import { metarParser } from "aewx-metar-parser";
import is from "@sindresorhus/is";
import CheapRuler from "cheap-ruler";
import { orderBy } from "es-toolkit";
import { filterAndMap } from "array-fm";
import papa from "papaparse";

const storage = useStorage("metarr");

const cacheKey = "all-metars-v2";

const ONE_WEEK_IN_SECONDS = 604800;

export function parseMetarString(metar: string): IMetar {
  return metarParser(metar);
}

interface MetarStoreData {
  station_id: string;
  raw_text: string;
  latitude: number;
  longitude: number;
  flight_category: string;
  wind_kt?: number;
  visibility_mi?: number;
  wx?: string;
}

async function fetchAndStoreMetarData() {
  const csv = await $fetch<string>(
    "https://aviationweather.gov/data/cache/metars.cache.csv",
    {
      responseType: "text",
    }
  );

  const parsed = papa.parse<Record<string, unknown> & MetarStoreData>(csv, {
    header: true,
    skipEmptyLines: true,
  });

  const data = parsed.data.map((d) => ({
    station_id: d.station_id,
    raw_text: d.raw_text,
    latitude: Number(d.latitude),
    longitude: Number(d.longitude),
    flight_category: d.flight_category,
    // Gusts count: the filter is about the strongest wind seen.
    wind_kt: Math.max(Number(d.wind_speed_kt) || 0, Number(d.wind_gust_kt) || 0),
    visibility_mi: parseFloat(String(d.visibility_statute_mi)),
    wx: String(d.wx_string ?? ""),
  }));

  await storage.setItem(cacheKey, data, {
    ttl: 5 * 60,
  });

  return data;
}

async function getAllMetarData() {
  const stored = await storage.getItem<MetarStoreData[]>(cacheKey);

  return stored || fetchAndStoreMetarData();
}

export async function getMetar(icao: string): Promise<IMetar> {
  const data = await getAllMetarData();

  const icaoData = data.find((d) => d.station_id === icao.toUpperCase());

  if (!icaoData) {
    throw createError({
      statusCode: 404,
      message: `METAR not found for ${icao}`,
    });
  }

  return parseMetarString(icaoData.raw_text);
}

const getStationNames = defineCachedFunction(
  async (icaos: string[]): Promise<Record<string, string>> => {
    const stations = await $fetch<StationInfo[]>(
      "https://aviationweather.gov/api/data/stationinfo",
      {
        query: {
          ids: icaos.join(","),
          format: "json",
        },
      }
    );

    return Object.fromEntries(stations.map((d) => [d.icaoId, d.site]));
  },
  {
    name: "station-names",
    maxAge: ONE_WEEK_IN_SECONDS,
    getKey: (icaos: string[]) => [...icaos].sort().join("-"),
  }
);

export async function getNearestStations(
  latitude: number,
  longitude: number,
  amount: number
): Promise<NearestAirport[]> {
  const data = await getAllMetarData();

  const ruler = new CheapRuler(latitude, "nauticalmiles");

  const withDistance = data.map((d) => ({
    ...d,
    nautical_miles: ruler.distance(
      [longitude, latitude],
      [d.longitude, d.latitude]
    ),
  }));

  const nearest = orderBy(withDistance, ["nautical_miles"], ["asc"]).slice(
    0,
    amount
  );

  const names = await getStationNames(nearest.map((d) => d.station_id));

  return nearest.map((d) => ({
    station: {
      latitude: d.latitude,
      longitude: d.longitude,
      name: names[d.station_id] ?? d.station_id,
      icao: d.station_id,
    },
    nautical_miles: d.nautical_miles,
    metar: d.raw_text,
    flight_category: d.flight_category,
  }));
}

export async function getStationsInBounds(
  west: number,
  south: number,
  east: number,
  north: number
): Promise<MapStation[]> {
  const data = await getAllMetarData();

  // A box that crosses the antimeridian arrives with west > east.
  const inLongitude = (lon: number) =>
    west <= east ? lon >= west && lon <= east : lon >= west || lon <= east;

  return filterAndMap(
    data,
    (d) =>
      d.latitude >= south &&
      d.latitude <= north &&
      inLongitude(d.longitude),
    (d) => ({
      icao: d.station_id,
      latitude: d.latitude,
      longitude: d.longitude,
      flight_category: d.flight_category,
      metar: d.raw_text,
      wind_kt: d.wind_kt,
      visibility_mi: d.visibility_mi,
      wx: d.wx,
    })
  );
}

export async function getAvailableIcaos() {
  const data = await getAllMetarData();

  return filterAndMap(
    data,
    (d) => is.nonEmptyStringAndNotWhitespace(d?.station_id),
    (d) => d.station_id
  ).sort(Intl.Collator().compare);
}

export async function getTaf(icao: string): Promise<string> {
  const taf = await $fetch<string>("https://aviationweather.gov/api/data/taf", {
    query: {
      ids: icao.toUpperCase(),
      format: "raw",
    },
    responseType: "text",
  });

  if (is.emptyStringOrWhitespace(taf)) {
    throw createError({
      statusCode: 404,
      message: `TAF not found for ${icao}`,
    });
  }

  return taf.trim();
}
