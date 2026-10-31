import is from "@sindresorhus/is";

const TEN_MINUTES_IN_SECONDS = 600;

export default defineCachedEventHandler(
  async (event) => {
    const icao = getRouterParam(event, "icao");

    if (is.falsy(icao) || icao?.length > 4) {
      throw createError({
        statusCode: 400,
        message: "Invalid ICAO code",
      });
    }

    return { raw: await getTaf(icao as string) };
  },
  {
    swr: false,
    maxAge: TEN_MINUTES_IN_SECONDS,
  },
);
