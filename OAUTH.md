# OAuth Implementation Guide for Bluelist

This guide explains how to set up and use the OAuth authentication flow with the AT Protocol (Bluesky) in Bluelist.

## Prerequisites

Before you can use OAuth authentication, you need to:

1. Register your application with the AT Protocol service
2. Configure your environment variables

## Registering Your Application

To register your application with the AT Protocol service:

1. Contact the ATP service provider (Bluesky) and request OAuth client credentials
2. When registering, you'll need to provide:
   - Your application's name (e.g., "Bluelist")
   - Your application's website URL
   - Your redirect URI (e.g., "https://your-domain.com/oauth/callback")
   - Your client metadata endpoint URL (e.g., "https://your-domain.com/client-metadata.json")

After registration, you'll receive a client ID and client secret that you'll need to configure in your environment variables.

## Environment Configuration

Copy the `.env.local.example` file to `.env.local` and update the values:

```bash
# Bluesky/ATP Service Configuration
NUXT_ATP_SERVICE=https://bsky.social

# OAuth Client Configuration
NUXT_ATP_CLIENT_ID=your_registered_client_id_here
NUXT_ATP_CLIENT_SECRET=your_client_secret_here
NUXT_ATP_REDIRECT_URI=https://your-domain.com/oauth/callback
NUXT_ATP_CLIENT_NAME=Bluelist
```

Replace the placeholder values with your actual OAuth client credentials.

## Deploying Your Application

When deploying your application:

1. Make sure your domain is accessible via HTTPS
2. Ensure the client metadata endpoint is available at the URL you registered
3. Verify that the redirect URI is correctly configured and accessible

## How the OAuth Flow Works

1. **User Initiates Login**: The user enters their Bluesky handle and clicks "Login with Bluesky"
2. **Authorization Request**: The application redirects to the ATP service's authorization endpoint
3. **User Consents**: The user authenticates with their ATP service and authorizes your application
4. **Callback**: The ATP service redirects back to your application with an authorization code
5. **Token Exchange**: Your server exchanges the code for access tokens
6. **Authentication Complete**: The user is now authenticated in your application

## Troubleshooting

If you encounter issues with the OAuth implementation:

- Check that your environment variables are correctly set
- Verify that your redirect URI matches exactly what you registered
- Ensure your client metadata endpoint is accessible
- Check server logs for any error messages during the OAuth flow

## Security Considerations

- Never expose your client secret in client-side code
- Use HTTPS for all OAuth-related endpoints
- Implement proper session management and token validation
- Use HTTP-only, secure cookies for storing session information
