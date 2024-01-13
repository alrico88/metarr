import is from "@sindresorhus/is";

const ONE_DAY_IN_SECONDS = 86400;

export default defineCachedEventHandler(
  (event) => {
    const icao = getRouterParam(event, "icao");

    if (is.falsy(icao) || icao?.length > 4) {
      throw createError({
        statusCode: 400,
        message: "Invalid ICAO code",
      });
    }

    return getAirportData(icao.toUpperCase());
  },
  {
    swr: false,
    maxAge: ONE_DAY_IN_SECONDS,
  }
);
