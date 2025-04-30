import { resolve } from 'path';
import fs from 'fs';

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
  devServer: {
    https: {
      key: fs.existsSync(
        resolve(__dirname, './certs/bluelist-local.blue-key.pem')
      )
        ? fs.readFileSync(
            resolve(__dirname, './certs/bluelist-local.blue-key.pem'),
            'utf-8'
          )
        : undefined,
      cert: fs.existsSync(resolve(__dirname, './certs/bluelist-local.blue.pem'))
        ? fs.readFileSync(
            resolve(__dirname, './certs/bluelist-local.blue.pem'),
            'utf-8'
          )
        : undefined,
    },
    host: 'bluelist-local.blue',
    port: 443,
  },
});
