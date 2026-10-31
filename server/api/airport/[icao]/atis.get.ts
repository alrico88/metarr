import is from "@sindresorhus/is";

const TWO_MINUTES_IN_SECONDS = 120;

export default defineCachedEventHandler(
  (event) => {
    const icao = getRouterParam(event, "icao");

    if (is.falsy(icao) || icao?.length > 4) {
      throw createError({
        statusCode: 400,
        message: "Invalid ICAO code",
      });
    }

    return getAtis(icao as string);
  },
  {
    swr: false,
    maxAge: TWO_MINUTES_IN_SECONDS,
  },
);
