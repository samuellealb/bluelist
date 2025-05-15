export default defineNuxtConfig({
  compatibilityDate: '2025-03-21',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxt/scripts', '@nuxt/test-utils', '@pinia/nuxt'],
  typescript: {
    typeCheck: true,
  },
  runtimeConfig: {
    openaiApiKey: process.env.NUXT_OPENAI_API_KEY,
    exemptDids: process.env.NUXT_EXEMPT_DIDS,
    public: {
      atpService: process.env.NUXT_ATP_SERVICE,
      oauth: {
        clientId: process.env.NUXT_OAUTH_CLIENT_ID,
        redirectUri: process.env.NUXT_OAUTH_REDIRECT_URI,
        appOrigin: process.env.NUXT_APP_ORIGIN,
        serverUrl: process.env.NUXT_ATP_SERVICE,
      },
    },
  },
  // devServer: {
  //   https: {
  //     key: './certs/localhost-key.pem',
  //     cert: './certs/localhost.pem',
  //   },
  // },
  nitro: {
    preset: 'vercel-edge',
  },
});
