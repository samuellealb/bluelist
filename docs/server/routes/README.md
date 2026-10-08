# Server Routes

This directory contains non-`/api` Nitro routes. Each file name maps directly
to its public route.

## `/client-metadata.json`

**Consumer:** an AT Protocol OAuth authorization server reads this public client
metadata document during the OAuth flow. The client ID also points back to this
same URL.

### Response

The route derives its origin from the incoming request, honoring forwarded host
and protocol headers, and returns:

```json
{
  "client_id": "https://example.com/client-metadata.json",
  "client_name": "Bluelist",
  "client_uri": "https://example.com",
  "application_type": "web",
  "grant_types": ["authorization_code", "refresh_token"],
  "response_types": ["code"],
  "scope": "<OAUTH_SCOPE>",
  "redirect_uris": ["https://example.com/oauth-callback"],
  "dpop_bound_access_tokens": true,
  "token_endpoint_auth_method": "none"
}
```

`scope` is imported from `src/lib/oauthScope`. The metadata has no request
body and does not perform route-specific validation or emit application errors.

### Headers and configuration

The handler sets:

| Header                        | Value              |
| ----------------------------- | ------------------ |
| `Content-Type`                | `application/json` |
| `Access-Control-Allow-Origin` | `*`                |

It uses no runtime secrets or server-side configuration. The returned URLs are
based on the request origin, so reverse proxies must forward the intended host
and protocol.
