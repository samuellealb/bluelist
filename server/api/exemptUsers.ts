import { defineEventHandler, readBody } from 'h3';
import { useRuntimeConfig } from '#imports';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const EXEMPT_DIDS = config.exemptDids ? config.exemptDids.split(',') : [];

  const { did } = await readBody(event);

  if (!did) {
    return {
      isExempt: false,
      error: 'No DID provided',
    };
  }

  const isExempt = EXEMPT_DIDS.includes(did);

  return {
    isExempt,
  };
});
