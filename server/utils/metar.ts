import parser from "aewx-metar-parser";
import buffer from "@turf/buffer";
import { getGeoJSONBBox } from "bbox-helper-functions";
import is from "@sindresorhus/is";
import CheapRuler from "cheap-ruler";
import { orderBy } from "lodash-es";
import { filterAndMap, mapAndFilter } from "array-fm";
import papa from "papaparse";

const storage = useStorage("metar");

const cacheKey = "metarr:all-metars";

export function parseMetarString(metar: string): IMetar {
  return parser(metar);
}

interface MetarStoreData {
  station_id: string;
  raw_text: string;
  latitude: number;
  longitude: number;
}

async function fetchAndStoreMetarData() {
  const csv = await $fetch<string>(
    "https://aviationweather.gov/data/cache/metars.cache.csv"
  );

  const dataLines = csv.split("\n").slice(5).join("\n");

  const parsed = papa.parse<Record<string, unknown> & MetarStoreData>(
    dataLines,
    { header: true, skipEmptyLines: true }
  );

  const data = parsed.data.map((d) => ({
    station_id: d.station_id,
    raw_text: d.raw_text,
    latitude: Number(d.latitude),
    longitude: Number(d.longitude),
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

function embedMetarToStations(
  stations: NearestStation[],
  metars: string[]
): NearestStationWithMetar[] {
  const metarIndexer = metars.reduce(
    (acc, d) => {
      const icao = d.split(" ").shift();

      acc.set(icao as string, d);

      return acc;
    },
    new Map() as Map<string, string>
  );

  return mapAndFilter(
    stations,
    (d) => ({
      ...d,
      metar: metarIndexer.get(d.icaoId),
    }),
    (d) => !is.nullOrUndefined(d.metar)
  ) as NearestStationWithMetar[];
}

export async function getMetar(icao: string): Promise<IMetar | null> {
  const data = await getAllMetarData();

  const icaoData = data.find((d) => d.station_id === icao);

  if (!icaoData) {
    throw new Error(`METAR not found for ${icao}`);
  }

  return parseMetarString(icaoData.raw_text);
}

export async function getMetars(icaos: string[]): Promise<string[]> {
  const data = await getAllMetarData();

  return filterAndMap(
    data,
    (d) => icaos.includes(d.station_id),
    (d) => d.raw_text
  );
}

export async function getNearestStations(
  latitude: number,
  longitude: number,
  amount?: number,
  bufferNm?: number
): Promise<NearestAirport[]> {
  const bufferToApply = bufferNm ?? 100;
  const amountToCheck = amount ?? 10;

  const pointAsBuffer = buffer(
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
      properties: {},
    },
    bufferToApply,
    {
      units: "nauticalmiles",
    }
  );

  const [minLon, minLat, maxLon, maxLat] = getGeoJSONBBox(pointAsBuffer);

  const list = await $fetch<NearestStation[]>(
    `https://aviationweather.gov/api/data/stationinfo`,
    {
      query: {
        bbox: `${minLat},${minLon},${maxLat},${maxLon}`,
        format: "json",
      },
    }
  );

  const metars = await getMetars(list.map((d) => d.icaoId));

  const stationsWithMetar = embedMetarToStations(list, metars);

  if (
    is.emptyArray(stationsWithMetar) ||
    stationsWithMetar.length < amountToCheck
  ) {
    return getNearestStations(latitude, longitude, amount, bufferToApply + 100);
  }

  const ruler = new CheapRuler(stationsWithMetar[0].lat, "nauticalmiles");

  const listWithDistanceAndBearing = stationsWithMetar.map((station) => ({
    station: {
      latitude: station.lat,
      longitude: station.lon,
      name: station.site,
      icao: station.icaoId,
    },
    nautical_miles: ruler.distance(
      [longitude, latitude],
      [station.lon, station.lat]
    ),
    metar: station.metar,
  }));

  return orderBy(listWithDistanceAndBearing, "nautical_miles", "asc").slice(
    0,
    amountToCheck
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
