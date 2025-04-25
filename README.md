# Bluelist 0.0.1 Release - Early Prototype

Hey there! We're launching the very first prototype version of Bluelist. This is just the beginning - a minimal viable product focused on the core functionality of AI-powered list suggestions for your Bluesky follows.

## What Works Right Now

- **View Your Lists**: See all the lists you've already created on Bluesky
- **Browse Your Follows**: Simple interface to view who you're following
- **Add to Lists**: Easily add users to your existing lists with a few clicks
- **✨ AI Suggestions**: Get AI-powered recommendations for organizing your follows into lists (free during this early stage, but may change later!)

## Important Note

This is very much an **early prototype**! Expect bugs, limited features, and rough edges.

## Local Testing Requirements

If you want to run this locally, you'll need:

- An OpenAI developer account
- Your own OpenAI API key (set in the environment variables)

This is only for local development and testing. The deployed version handles API access for you.

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
- Viewing list members and their posts
- Removing users from lists (individually or in batches)
- Integrating your main Bluesky timeline

## Technical Details

Built with Nuxt 3, ATP Protocol integration, and a focus on making list management easier for Bluesky users.

## Questions or Suggestions?

Have questions, feature requests, or suggestions? Found a bug? Visit our GitHub repository:
https://github.com/samuellealb/bluelist

We'd love your feedback on this early version! Every bit helps as we continue to develop and improve Bluelist.
