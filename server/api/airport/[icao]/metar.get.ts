import is from "@sindresorhus/is";

const THREE_MINUTES_IN_SECONDS = 180;

export default defineCachedEventHandler(
  (event) => {
    const icao = getRouterParam(event, "icao");

    if (is.falsy(icao) || icao?.length > 4) {
      throw createError({
        statusCode: 400,
        message: "Invalid ICAO code",
      });
    }

    return getMetar(icao as string);
  },
  {
    swr: false,
    maxAge: THREE_MINUTES_IN_SECONDS,
  }
);
