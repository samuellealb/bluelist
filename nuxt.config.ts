import { resolve } from 'node:path';
import fs from 'node:fs';

const useHttps = process.env.NUXT_DEV_HTTPS === 'true';

function readCert(envVar: string, fallback: string): string | undefined {
  const filePath = resolve(__dirname, process.env[envVar] ?? fallback);
  try {
    return fs.existsSync(filePath)
      ? fs.readFileSync(filePath, 'utf-8')
      : undefined;
  } catch (error) {
    console.warn(`Failed to read cert file ${filePath}: ${error}`);
    return undefined;
  }
}

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
  devServer: useHttps
    ? {
        https: {
          key: readCert(
            'NUXT_DEV_SSL_KEY',
            './certs/bluelist-local.blue-key.pem'
          ),
          cert: readCert(
            'NUXT_DEV_SSL_CERT',
            './certs/bluelist-local.blue.pem'
          ),
        },
        host: process.env.NUXT_DEV_HOST ?? 'bluelist-local.blue',
        port: Number.parseInt(process.env.NUXT_DEV_PORT ?? '', 10) || 4430,
      }
    : {
        host: '127.0.0.1',
        port: 3000,
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
