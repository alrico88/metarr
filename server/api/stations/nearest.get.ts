import z from "zod";

const nearestSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  amount: z.coerce.number().min(10).max(30),
});

export default defineEventHandler(async (event) => {
  const { latitude, longitude, amount } = await getValidatedQuery(
    event,
    query => nearestSchema.parse(query),
  );

  return getNearestStations(latitude, longitude, amount);
});
