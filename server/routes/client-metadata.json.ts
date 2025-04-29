import { defineEventHandler } from 'h3';
import { getClientMetadata } from '~/src/lib/oauth/client-metadata';

/**
 * Public endpoint that serves the ATP OAuth client metadata
 * This endpoint must be accessible at the URL specified in client_id
 */
export default defineEventHandler(() => {
  return getClientMetadata();
});
