/**
 * AT Proto's AppView is mid-rollout on enforcing granular `rpc:`/`repo:` scopes
 * on top of the older `transition:generic` scope (see
 * https://github.com/bluesky-social/atproto/discussions/4118 and #4437).
 * `transition:generic` is documented as covering all of this, but the AppView
 * currently 403s some endpoints without the explicit `rpc:`/`repo:` grant, so
 * both are requested here. Keep this list in sync with every AT Proto method
 * called from `bskyService.ts`.
 */
export const OAUTH_SCOPE = [
  'atproto',
  'transition:generic',
  'rpc:app.bsky.feed.getTimeline?aud=*',
  'rpc:app.bsky.actor.getProfile?aud=*',
  'rpc:app.bsky.graph.getFollows?aud=*',
  'rpc:app.bsky.graph.getLists?aud=*',
  'rpc:app.bsky.graph.getList?aud=*',
  'rpc:app.bsky.feed.getListFeed?aud=*',
  'repo:app.bsky.graph.list?action=create&action=update&action=delete',
  'repo:app.bsky.graph.listitem?action=create&action=update&action=delete',
].join(' ');
