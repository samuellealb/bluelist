import { AtpAgent, AtUri } from '@atproto/api';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();
dotenv.config({ path: '.env.local' });

// Create an agent
const agent = new AtpAgent({
  service: process.env.ATP_SERVICE,
});

// Login
const { data: loginData } = await agent.login({
  identifier: process.env.BSKY_IDENTIFIER,
  password: process.env.BSKY_PASSWORD,
});

// Get user info
const { did, handle, email } = loginData;
console.log({ did, handle, email });

// Get user feed
const { data } = await agent.getTimeline({
  limit: 3,
});

const { feed: postsArray, cursor: nextPage } = data;
console.log(postsArray, nextPage);

// Get user lists
const { data: listsData } = await agent.app.bsky.graph.getLists({
  actor: did,
  limit: 3,
});
const lists = listsData.lists.map((list) => list.name);
console.log(lists);

// Get a single list
const { data: singleList } = await agent.app.bsky.graph.getList({
  list: listsData.lists[0].uri,
  limit: 3,
});
console.log(singleList);

// // Add an item to a list
const userToAddDid = 'did:plc:xwqgusybtrpm67tcwqdfmzvy';

await agent.com.atproto.repo.createRecord({
  repo: agent.session.did,
  collection: 'app.bsky.graph.listitem',
  record: {
    $type: 'app.bsky.graph.listitem',
    subject: userToAddDid,
    list: listsData.lists[0].uri,
    createdAt: new Date().toISOString(),
  },
});
console.log(singleList);

// Delete last added item from a list
const itemUri = singleList.items[0].uri;
const { repo, collection, rkey } = new AtUri(itemUri);
console.log('itemData => ', { repo, collection, rkey });
await agent.com.atproto.repo.deleteRecord({
  repo: repo ? repo : did,
  collection,
  rkey,
});
console.log(singleList);

// Get all following users of a user
const { data: followingData } = await agent.app.bsky.graph.getFollows({
  actor: did,
  limit: 3,
});
console.log(followingData);
