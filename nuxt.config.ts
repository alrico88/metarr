export default defineNuxtConfig({
  extends: ["nuxt-umami"],
  app: {
    head: {
      title: "metarr",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "theme-color", content: "#ebf4f5" },
        { name: "author", content: "Alberto Rico" },
        {
          name: "google-site-verification",
          content: "nc0pKffQdhm679g_eXEQhjK-NzBM8ZbyFQLR9ZMeJtc",
        },
      ],
      link: [{ rel: "icon", type: "image/png", href: "/icon.png" }],
    },
  },
  css: ["@/assets/main.scss"],
  modules: [
    "nuxt-icon",
    "@vueuse/nuxt",
    "@vite-pwa/nuxt",
    "nuxt3-leaflet",
    "@bootstrap-vue-next/nuxt",
    "@nuxtjs/google-fonts",
    "@nuxtjs/color-mode",
  ],
  nitro: {
    storage: {
      metar: {
        driver: "redis",
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        db: process.env.REDIS_DB,
        password: process.env.REDIS_PASS,
      },
    },
  },
  pwa: {
    registerType: "prompt",
    manifest: {
      name: "metarr",
      description: "Check any airport's METAR",
      theme_color: "#ebf4f5",
      icons: [
        {
          src: "pwa-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
        {
          src: "pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable",
        },
      ],
    },
    client: {
      installPrompt: true,
    },
  },
  colorMode: {
    dataValue: "bs-theme",
    storageKey: "nuxt-color-mode",
  },
  runtimeConfig: {
    apiToken: "",
  },
  googleFonts: {
    families: {
      Cabin: [400, 500, 700],
    },
  },
  appConfig: {
    umami: {
      host: "https://stats.alrico.es",
      id: "028ca508-e57f-4271-ac79-eed27dd31445",
      ignoreLocalhost: true,
      version: 2,
    },
  },
});
