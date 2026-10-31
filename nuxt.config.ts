export default defineNuxtConfig({

  modules: [
    "@nuxt/eslint",
    "@nuxt/ui",
    "@vueuse/nuxt",
    "@vite-pwa/nuxt",
    "nuxt-umami",
    "@nuxt/fonts",
  ],
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

  css: ["~/assets/css/main.css"],

  colorMode: {
    storageKey: "nuxt-color-mode",
  },

  runtimeConfig: {
    apiToken: "",
    airApiUrl: "https://airapi.vercel.app/api",
    redisHost: "",
    redisPort: "",
    redisPassword: "",
    redisDb: 0,
  },

  compatibilityDate: "2025-03-29",

  eslint: {
    config: {
      stylistic: {
        semi: true,
        quotes: "double",
        commaDangle: "always-multiline",
        braceStyle: "1tbs",
      },
    },
  },

  fonts: {
    families: [
      {
        name: "Cabin",
        provider: "google",
        weights: [400, 500, 700],
      },
    ],
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

  umami: {
    host: "https://stats.alrico.es",
    id: "028ca508-e57f-4271-ac79-eed27dd31445",
    ignoreLocalhost: true,
  },
});
