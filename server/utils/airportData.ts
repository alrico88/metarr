export function getAirportData(icao: string): Promise<Airport> {
  const config = useRuntimeConfig();

  return $fetch<Airport>(`${config.airApiUrl}/airport/${icao}`, {});
}
