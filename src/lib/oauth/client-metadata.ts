import { useRuntimeConfig } from '#imports';

// Define types explicitly to match the OAuth library requirements
type ResponseType =
  | 'code'
  | 'none'
  | 'token'
  | 'code id_token token'
  | 'code id_token'
  | 'code token'
  | 'id_token token'
  | 'id_token';
type GrantType =
  | 'authorization_code'
  | 'refresh_token'
  | 'implicit'
  | 'password'
  | 'client_credentials'
  | 'urn:ietf:params:oauth:grant-type:jwt-bearer'
  | 'urn:ietf:params:oauth:grant-type:saml2-bearer';

/**
 * Client metadata for AT Protocol OAuth
 * This defines the application identity for the ATP OAuth flow
 *
 * Types are carefully set to meet the requirements of @atproto/oauth-client-node
 */
export const getClientMetadata = () => {
  const config = useRuntimeConfig();

  // Use the public app URL from environment variables
  const appUrl = config.public.appUrl || 'http://localhost:3000';

  // Use environment-specific redirect URI
  const redirectUri = config.atpRedirectUri || `${appUrl}/oauth/callback`;

  // Explicitly use the correct response and grant types
  const responseType: ResponseType = 'code';
  const grantType: GrantType = 'authorization_code';

  return {
    client_id: config.atpClientId || `${appUrl}/client-metadata.json`,
    client_name: config.public.atpClientName || 'Bluelist',
    client_uri: appUrl, // Your application domain
    logo_uri: `${appUrl}/logo.png`, // Path to your application logo
    redirect_uris: [redirectUri] as [string, ...string[]],
    scope: 'atproto',
    grant_types: [grantType] as [GrantType, ...GrantType[]],
    response_types: [responseType] as [ResponseType, ...ResponseType[]],
    application_type: 'web' as const,
    token_endpoint_auth_method: 'none' as const,
    dpop_bound_access_tokens: true,
  };
};
