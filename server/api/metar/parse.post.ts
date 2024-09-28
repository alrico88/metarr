import { parseMetarString } from "~/server/utils/metar";

export default defineEventHandler<{
  body: {
    metar: string;
  };
}>(async (event) => {
  const { metar } = await readBody(event);

  return parseMetarString(metar);
});
