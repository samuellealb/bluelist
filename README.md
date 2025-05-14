# Bluelist 0.0.2 Release - Enhanced List Navigation

Hey there! We're launching the very first prototype version of Bluelist. This is just the beginning - a minimal viable product focused on the core functionality of AI-powered list suggestions for your Bluesky follows.

## What Works Right Now

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

## Local Testing Requirements

If you want to run this locally, you'll need:

- An OpenAI developer account
- Your own OpenAI API key (set in the environment variables)
- Optional: Set exempt DIDs in the environment variables to bypass daily limits

This is only for local development and testing. The deployed version handles API access for you.

### Environment Variables

```
NUXT_OPENAI_API_KEY=your_openai_key_here
NUXT_ATP_SERVICE=your_atp_service_url
NUXT_EXEMPT_DIDS=did1,did2,did3  # Optional: Comma-separated list of DIDs exempt from daily limits
```

### Setup

Make sure to install dependencies:

```bash
yarn install
```

### Development Server

Start the development server on `http://localhost:3000`:

```bash
yarn dev
```

### Production

Build the application for production:

```bash
yarn build
```

Locally preview production build:

```bash
yarn preview
```

### What's Coming Next

We're just getting started! Here's what we're working on:

- Creating new lists directly in the app
- Removing users from lists (individually or in batches)
- Integrating your main Bluesky timeline

## Technical Details

Built with Nuxt 3, ATP Protocol integration, and a focus on making list management easier for Bluesky users.

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
