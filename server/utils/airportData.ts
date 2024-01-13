export function getAirportData(icao: string): Promise<Airport> {
  return $fetch<Airport>(`https://airapi.vercel.app/api/airport/${icao}`, {});
}
