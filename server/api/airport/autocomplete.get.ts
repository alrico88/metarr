import { getAvailableIcaos } from "~/server/utils/metar";

export default defineCachedEventHandler(() => getAvailableIcaos(), {
  swr: false,
  maxAge: 1200,
});
