import { processNumber } from "number-helper-functions";

export function useGeography() {
  function getAzimuth(bearing: number): number {
    const corrected = bearing < 0 ? 360 + bearing : bearing;

    return processNumber(corrected, 0);
  }

  return {
    getAzimuth,
  };
}
