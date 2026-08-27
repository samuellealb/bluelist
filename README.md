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

- **Localhost**: `http://localhost:3000` (uses loopback client configuration)
- **Preview**: `https://bluelist-three.vercel.app` (Vercel preview deployments)
- **Production**: `https://listy.blue` (production domain)

## Local Development

### Prerequisites

If you want to run this locally, you'll need:

- An Anthropic developer account
- Your API key (set in the environment variables)
- Optional: Set exempt DIDs in the environment variables to bypass daily limits

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required:

```
NUXT_ATP_SERVICE=https://bsky.social
```

Optional:

```
NUXT_ANTHROPIC_API_KEY=your_anthropic_key_here  # Required for AI suggestions
NUXT_EXEMPT_DIDS=did1,did2,did3                 # DIDs exempt from daily AI limits
```

### Environment Profiles

The dev server defaults to `http://localhost:3000` with no extra configuration needed. Platform-specific setups are opt-in via `.env.local` only — no code changes required.

**WSL / any clean machine** — default, nothing to add.

**macOS with HTTPS and a custom local domain:**

```
NUXT_DEV_HTTPS=true
NUXT_DEV_HOST=bluelist-local.blue
NUXT_DEV_PORT=4430
NUXT_DEV_SSL_KEY=./certs/bluelist-local.blue-key.pem
NUXT_DEV_SSL_CERT=./certs/bluelist-local.blue.pem
```

> Prerequisites: add `127.0.0.1 bluelist-local.blue` to `/etc/hosts`, install
> [mkcert](https://github.com/FiloSottile/mkcert), run `mkcert -install` and
> `mkcert bluelist-local.blue` inside `./certs/`.

**Corporate proxy with a custom CA:**

```
NODE_EXTRA_CA_CERTS=./certs/bayer-proxy-ca.pem
```

> Place your corporate CA certificate at the path above. The launcher
> (`scripts/run.mjs`) automatically detects and injects it before the Node TLS
> stack initialises. If the variable is unset it is silently skipped; if it is
> set but the file is missing, a warning is logged and the variable is ignored.

### Setup

Make sure to install dependencies:

```bash
yarn install
```

### Development Server

Start the development server:

```bash
yarn dev
```

Serves `http://localhost:3000` by default, or HTTPS on the configured host/port
when `NUXT_DEV_HTTPS=true`. The app automatically uses the localhost OAuth
configuration for development.

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

Built with Nuxt 4, AT Protocol integration, and a focus on making list management easier for Bluesky users.

- **Architecture overview:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **Contributing & local setup:** [CONTRIBUTING.md](CONTRIBUTING.md)

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
