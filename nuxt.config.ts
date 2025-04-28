// https://nuxt.com/docs/api/configuration/nuxt-config
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
    },
  },
});
