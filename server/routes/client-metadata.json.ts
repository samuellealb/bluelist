import { defineEventHandler, getRequestURL, setHeaders } from 'h3';
import { OAUTH_SCOPE } from '~/src/lib/oauthScope';

export default defineEventHandler((event) => {
  const { origin } = getRequestURL(event, {
    xForwardedHost: true,
    xForwardedProto: true,
  });

  setHeaders(event, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  });

  return {
    client_id: `${origin}/client-metadata.json`,
    client_name: 'Bluelist',
    client_uri: origin,
    application_type: 'web',
    grant_types: ['authorization_code', 'refresh_token'],
    response_types: ['code'],
    scope: OAUTH_SCOPE,
    redirect_uris: [`${origin}/oauth-callback`],
    dpop_bound_access_tokens: true,
    token_endpoint_auth_method: 'none',
  };
});
