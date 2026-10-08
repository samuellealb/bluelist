export default defineNuxtConfig({
  compatibilityDate: '2025-03-21',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxt/scripts', '@nuxt/test-utils', '@pinia/nuxt'],
  typescript: {
    typeCheck: true,
  },
  runtimeConfig: {
    anthropicApiKey: process.env.NUXT_ANTHROPIC_API_KEY,
    exemptDids: process.env.NUXT_EXEMPT_DIDS,
    public: {
      atpService: process.env.NUXT_ATP_SERVICE,
    },
  },
  devServer: {
    // Loopback only: OAuth needs a secure context, which browsers grant to
    // localhost/127.0.0.1 and HTTPS origins but not to a LAN IP over http.
    host: process.env.NUXT_DEV_HOST ?? '127.0.0.1',
    port: Number.parseInt(process.env.NUXT_DEV_PORT ?? '', 10) || 3000,
  },
  nitro: {
    publicAssets: [
      {
        dir: 'public',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      },
    ],
  },
});
