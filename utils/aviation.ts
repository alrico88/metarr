const FLIGHT_CATEGORY_COLORS: Record<string, string> = {
  VFR: "#4caf50",
  MVFR: "#3b82f6",
  IFR: "#ff5722",
  LIFR: "#c026d3",
};

export function flightCategoryColor(category?: string): string {
  return FLIGHT_CATEGORY_COLORS[category ?? ""] ?? "#6c757d";
}

/**
 * Splits a wind into runway components.
 * Positive headwind is wind on the nose, negative is tailwind.
 * Positive crosswind comes from the right, negative from the left.
 */
export function runwayWindComponents(
  windDegrees: number,
  windSpeed: number,
  runwayBearing: number
): { headwind: number; crosswind: number } {
  const angle = ((windDegrees - runwayBearing) * Math.PI) / 180;

  return {
    headwind: windSpeed * Math.cos(angle),
    crosswind: windSpeed * Math.sin(angle),
  };
}

export function pressureAltitude(elevationFt: number, qnhMb: number): number {
  return elevationFt + (1013.25 - qnhMb) * 27;
}

export function densityAltitude(
  elevationFt: number,
  qnhMb: number,
  temperatureC: number
): number {
  const pa = pressureAltitude(elevationFt, qnhMb);
  const isaTemperature = 15 - (2 * pa) / 1000;

  return pa + 118.8 * (temperatureC - isaTemperature);
}
