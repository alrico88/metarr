const ATIS_API_URL = "https://atis.info/api";

const ONE_DAY_IN_SECONDS = 86400;

const getAtisStations = defineCachedFunction(
  () => $fetch<string[]>(`${ATIS_API_URL}/stations`),
  {
    name: "atis-stations",
    maxAge: ONE_DAY_IN_SECONDS,
  },
);

export async function getAtis(icao: string): Promise<Atis[]> {
  const upperIcao = icao.toUpperCase();
  const stations = await getAtisStations();

  if (!stations.includes(upperIcao)) {
    throw createError({
      statusCode: 404,
      message: `ATIS not available for ${icao}`,
    });
  }

  return $fetch<Atis[]>(`${ATIS_API_URL}/${upperIcao}`);
}
