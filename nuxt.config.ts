// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

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
    atpClientId: process.env.NUXT_ATP_CLIENT_ID,
    atpClientSecret: process.env.NUXT_ATP_CLIENT_SECRET,
    atpRedirectUri: process.env.NUXT_ATP_REDIRECT_URI,
    public: {
      appUrl: process.env.NUXT_PUBLIC_APP_URL,
      atpService: process.env.NUXT_ATP_SERVICE,
      atpClientName: process.env.NUXT_ATP_CLIENT_NAME,
    },
  },
  devServer: {
    https: {
      key: fs.existsSync(resolve(__dirname, './certs/bluelist.blue-key.pem'))
        ? fs.readFileSync(
            resolve(__dirname, './certs/bluelist.blue-key.pem'),
            'utf-8'
          )
        : undefined,
      cert: fs.existsSync(resolve(__dirname, './certs/bluelist.blue.pem'))
        ? fs.readFileSync(
            resolve(__dirname, './certs/bluelist.blue.pem'),
            'utf-8'
          )
        : undefined,
    },
    host: 'bluelist.blue',
    port: 443,
  },
});
