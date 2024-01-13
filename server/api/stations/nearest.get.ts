import z from "zod";

const ONE_WEEK_IN_SECONDS = 604800;

export default defineCachedEventHandler<{
  query: {
    latitude: string;
    longitude: string;
    amount: string;
  };
}>(
  async (event) => {
    const nearestSchema = z.object({
      latitude: z.number({ coerce: true }).min(-90).max(90),
      longitude: z.number({ coerce: true }).min(-180).max(180),
      amount: z.number({ coerce: true }).min(10).max(30),
    });

    const { latitude, longitude, amount } = await getValidatedQuery(
      event,
      (query) => nearestSchema.parse(query)
    );

    return getNearestStations(latitude, longitude, amount);
  },
  {
    swr: false,
    maxAge: ONE_WEEK_IN_SECONDS,
  }
);
