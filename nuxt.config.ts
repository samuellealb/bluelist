// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-03-21',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxt/scripts', '@nuxt/test-utils', '@pinia/nuxt'],
  typescript: {
    typeCheck: true,
  },
  runtimeConfig: {
    public: {
      atpService: 'https://bsky.social',
    },
  },
});
