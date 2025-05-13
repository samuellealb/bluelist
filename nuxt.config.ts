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
      key: (() => {
        const keyPath = resolve(
          __dirname,
          './certs/bluelist-local.blue-key.pem'
        );
        try {
          return fs.existsSync(keyPath)
            ? fs.readFileSync(keyPath, 'utf-8')
            : undefined;
        } catch (error) {
          console.warn(`Failed to read SSL key: ${error}`);
          return undefined;
        }
      })(),
      cert: (() => {
        const certPath = resolve(__dirname, './certs/bluelist-local.blue.pem');
        try {
          return fs.existsSync(certPath)
            ? fs.readFileSync(certPath, 'utf-8')
            : undefined;
        } catch (error) {
          console.warn(`Failed to read SSL certificate: ${error}`);
          return undefined;
        }
      })(),
    },
    host: 'bluelist-local.blue',
    port: 443,
  },
});
