import redisDriver from "unstorage/drivers/redis";

export default defineNitroPlugin(() => {
  const storage = useStorage();

  const config = useRuntimeConfig();

  const driver = redisDriver({
    base: "redis",
    host: config.redisHost,
    port: Number(config.redisPort),
    password: config.redisPassword,
    db: config.redisDb,
  });

  // Mount driver
  storage.mount("metarr", driver);
});
