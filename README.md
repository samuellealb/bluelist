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
- **Create & Edit Lists**: Create new lists and edit existing ones directly in the app
- **Delete Lists**: Remove lists you no longer need
- **Browse Your Follows**: Simple interface to view who you're following
- **Add to Lists**: Easily add users to your existing lists with a few clicks
- **✨ AI Suggestions**: Get AI-powered recommendations for organizing your follows into lists
- **View List Members**: Browse members of your lists with improved navigation, including a live member count
- **Remove Members**: Remove a member from a list, or select and remove several at once
- **View List Posts**: See posts from list members with user-friendly URLs
- **Light/Dark Theme**: Toggle and persist your preferred theme
- **Pagination**: Browse large lists, follows, and member lists a page at a time

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

The dev server binds to `127.0.0.1:3000`. Override with `NUXT_DEV_HOST` /
`NUXT_DEV_PORT` in `.env.local` if the port is taken — no code changes required.

> **Open `http://127.0.0.1:3000`, not `localhost:3000` or a LAN IP.** AtProto
> OAuth needs WebCrypto, which browsers only expose in a _secure context_ —
> HTTPS, or http on `localhost`/`127.0.0.1`. Serving the app from a LAN IP over
> plain http breaks sign-in; the app detects this and shows an explicit error
> instead of failing silently. To test authenticated flows from another device,
> use an HTTPS tunnel or a deployed preview.

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

Open `http://127.0.0.1:3000` — not `localhost:3000`, so the OAuth loopback
client's redirect URI matches the browser origin. The app automatically uses the
built-in loopback OAuth configuration for development.

### OAuth Client Metadata

Client metadata is generated dynamically at `/client-metadata.json`
(`server/routes/client-metadata.json.ts`), derived from whatever origin the app is
actually running at:

- Served with proper CORS headers
- Works unmodified on localhost, any preview deployment, and production — no
  per-environment configuration needed
- For localhost, the app instead uses the built-in loopback client configuration

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

- Surfacing the Bluesky timeline/feed view in the main navigation (the view
  itself is built at `/feed`, just not linked yet)
- Batch-adding a user to multiple lists at once (single-list add is supported today)
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

- Create, edit, and delete lists
- Add a user to a list, and remove members individually or in batches
- View list members and their posts in separate views, with a cached member count
- User-friendly URLs with readable slugs for better navigation
- Cached list data for improved performance

## Questions or Suggestions?

Have questions, feature requests, or suggestions? Found a bug? Visit our GitHub repository:
https://github.com/samuellealb/bluelist

We'd love your feedback on this early version! Every bit helps as we continue to develop and improve Bluelist.
