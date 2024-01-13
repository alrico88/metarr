import parser from "aewx-metar-parser";
import buffer from "@turf/buffer";
import { getGeoJSONBBox } from "bbox-helper-functions";
import is from "@sindresorhus/is";
import CheapRuler from "cheap-ruler";
import { orderBy } from "lodash-es";
import { mapAndFilter } from "array-fm";

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
    (d) => {
      return {
        ...d,
        metar: metarIndexer.get(d.icaoId),
      };
    },
    (d) => !is.nullOrUndefined(d.metar)
  ) as NearestStationWithMetar[];
}

export async function getMetar(icao: string): Promise<IMetar | null> {
  const data = await $fetch<string>(
    `https://aviationweather.gov/api/data/metar`,
    {
      query: {
        ids: icao,
        format: "raw",
      },
    }
  );

  return parser(data);
}

export async function getMetars(icaos: string[]): Promise<string[]> {
  const data = await $fetch<string>(
    `https://aviationweather.gov/api/data/metar`,
    {
      query: {
        ids: icaos.join(","),
        format: "raw",
      },
    }
  );

  return data.split("\n");
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

  const listWithDistanceAndBearing = stationsWithMetar.map((station) => {
    return {
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
    };
  });

  return orderBy(listWithDistanceAndBearing, "nautical_miles", "asc").slice(
    0,
    amountToCheck
  );
}
