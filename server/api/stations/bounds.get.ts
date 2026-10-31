import z from "zod";

const boundsSchema = z.object({
  west: z.coerce.number().min(-180).max(180),
  south: z.coerce.number().min(-90).max(90),
  east: z.coerce.number().min(-180).max(180),
  north: z.coerce.number().min(-90).max(90),
});

export default defineEventHandler(async (event) => {
  const { west, south, east, north } = await getValidatedQuery(event, (query) =>
    boundsSchema.parse(query)
  );

  return getStationsInBounds(west, south, east, north);
});
