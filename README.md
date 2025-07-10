# Bluelist 0.0.3 Release - OAuth Authentication

Hey there! We've upgraded to OAuth authentication for better security and user experience. This version introduces handle-based login using the AtProto OAuth standard.

## What's New in 0.0.3

- **🔐 OAuth Authentication**: Secure login using your Bluesky handle
- **🌐 Multi-Environment Support**: Works on localhost, preview, and production
- **🔑 Enhanced Security**: No more password storage, OAuth tokens managed securely
- **📱 Desktop App Pattern**: Follows AtProto OAuth "Desktop App" client type

## What Works Right Now

- **OAuth Login**: Sign in with your Bluesky handle (e.g., username.bsky.social)
- **View Your Lists**: See all the lists you've already created on Bluesky
- **Browse Your Follows**: Simple interface to view who you're following
- **Add to Lists**: Easily add users to your existing lists with a few clicks
- **✨ AI Suggestions**: Get AI-powered recommendations for organizing your follows into lists
- **View List Members**: Browse members of your lists with improved navigation
- **View List Posts**: See posts from list members with user-friendly URLs

## Important Note

- This is very much an **early prototype**! Expect bugs, limited features, and rough edges.
- AI suggestions limited to 5 requests per day, with exception handling for certain users
- AI suggestions is free during this early stage, but may change later!
- **OAuth Login Required**: You'll need a Bluesky handle to sign in

## OAuth Authentication

This app uses AtProto OAuth for authentication. Simply enter your Bluesky handle (e.g., `username.bsky.social`) and you'll be redirected to authenticate with your provider.

### Supported Environments

- **Localhost**: `http://127.0.0.1:3000` (uses loopback client configuration)
- **Preview**: `https://bluelist-three.vercel.app` (Vercel preview deployments)
- **Production**: `https://listy.blue` (production domain)

## Local Development

### Prerequisites

If you want to run this locally, you'll need:

- An OpenAI developer account
- Your own OpenAI API key (set in the environment variables)
- Optional: Set exempt DIDs in the environment variables to bypass daily limits

### Environment Variables

The app uses different environment files for different deployments:

#### `.env.local` (Development)

```bash
NUXT_ATP_SERVICE=https://bsky.social
NUXT_OPENAI_API_KEY=your_openai_key_here
NUXT_EXEMPT_DIDS=

# OAuth Configuration for localhost
NUXT_OAUTH_CLIENT_ID=http://127.0.0.1:3000/client-metadata.json
NUXT_OAUTH_REDIRECT_URI=http://127.0.0.1:3000/oauth-callback
NUXT_APP_ORIGIN=http://127.0.0.1:3000
```

#### `.env.preview` (Vercel Preview)

```bash
NUXT_ATP_SERVICE=https://bsky.social
NUXT_OPENAI_API_KEY=your_openai_key_here
NUXT_EXEMPT_DIDS=your_exempt_dids

# OAuth Configuration for preview environment
NUXT_OAUTH_CLIENT_ID=https://bluelist-three.vercel.app/client-metadata.json
NUXT_OAUTH_REDIRECT_URI=https://bluelist-three.vercel.app/oauth-callback
NUXT_APP_ORIGIN=https://bluelist-three.vercel.app
```

#### `.env.production` (Production)

```bash
NUXT_ATP_SERVICE=https://bsky.social
NUXT_OPENAI_API_KEY=your_openai_key_here
NUXT_EXEMPT_DIDS=your_exempt_dids

# OAuth Configuration for production environment
NUXT_OAUTH_CLIENT_ID=https://listy.blue/client-metadata.json
NUXT_OAUTH_REDIRECT_URI=https://listy.blue/oauth-callback
NUXT_APP_ORIGIN=https://listy.blue
```

### Setup

Make sure to install dependencies:

```bash
yarn install
```

### Development Server

Start the development server on `http://127.0.0.1:3000`:

```bash
yarn dev
```

The app will automatically use the localhost OAuth configuration for development.

### OAuth Client Metadata

The app includes client metadata files in the `public/` directory:

- `public/client-metadata.json` - Contains OAuth client configuration
- The metadata is automatically served with proper CORS headers
- For localhost, the app uses the built-in loopback client configuration

### Production

Build the application for production:

```bash
yarn build
```

Locally preview production build:

```bash
yarn preview
```

## Technical Details

Built with:

- **Nuxt 3** - Vue.js framework
- **@atproto/oauth-client-browser** - AtProto OAuth client for browsers
- **@atproto/api** - AtProto API integration
- **Pinia** - State management
- **TypeScript** - Type safety

### OAuth Implementation

- Follows AtProto OAuth specification for "Desktop App" clients
- Uses PKCE, DPoP, and PAR for security
- Handles token refresh automatically
- Supports multiple environments with environment-specific configurations
- Uses handle resolution for user-friendly login experience

### What's Coming Next

We're just getting started! Here's what we're working on:

- Creating new lists directly in the app
- Removing users from lists (individually or in batches)
- Integrating your main Bluesky timeline
- Enhanced OAuth session management
- Mobile-responsive improvements

## How to Use

1. **Sign In**: Enter your Bluesky handle (e.g., `username.bsky.social`)
2. **OAuth Redirect**: You'll be redirected to authenticate with your AtProto provider
3. **Authorization**: Approve the app's access to your account
4. **Return**: You'll be redirected back to Bluelist with an active session
5. **Explore**: Start managing your lists and follows!

### Handle Format Examples

- `username.bsky.social`
- `mydomain.com` (if you have a custom domain)
- `handle.another-provider.com` (for other AtProto providers)

## Technical Details

Built with:

- **Nuxt 3** - Vue.js framework
- **@atproto/oauth-client-browser** - AtProto OAuth client for browsers
- **@atproto/api** - AtProto API integration
- **Pinia** - State management
- **TypeScript** - Type safety

### OAuth Implementation

- Follows AtProto OAuth specification for "Desktop App" clients
- Uses PKCE, DPoP, and PAR for security
- Handles token refresh automatically
- Supports multiple environments with environment-specific configurations
- Uses handle resolution for user-friendly login experience

## Feature Details

### AI Suggestions

- Limited to 5 requests per user per day (to manage API costs)
- Certain users can be exempted from this limit through the exempt users API
- Remaining request count is tracked and displayed to users

### List Management

- View list members and their posts in separate views
- User-friendly URLs with readable slugs for better navigation
- Cached list data for improved performance

## Questions or Suggestions?

Have questions, feature requests, or suggestions? Found a bug? Visit our GitHub repository:
https://github.com/samuellealb/bluelist

We'd love your feedback on this early version! Every bit helps as we continue to develop and improve Bluelist.
