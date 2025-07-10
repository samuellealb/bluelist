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
      oauthClientId: process.env.NUXT_OAUTH_CLIENT_ID,
      oauthRedirectUri: process.env.NUXT_OAUTH_REDIRECT_URI,
      appOrigin: process.env.NUXT_APP_ORIGIN,
    },
  },
  devServer: {
    // Use standard localhost for OAuth development
    host: '127.0.0.1',
    port: 3000,
    https: false,
  },
  nitro: {
    publicAssets: [
      {
        dir: 'public',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      },
    ],
    routeRules: {
      '/client-metadata.json': {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      },
    },
  },
});
