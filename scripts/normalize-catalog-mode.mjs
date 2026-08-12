import fs from 'node:fs/promises';

const path = 'data/products.json';
const feed = JSON.parse(await fs.readFile(path, 'utf8'));
if (feed?.source === 'cj' && Array.isArray(feed.products) && feed.products.length) {
  feed.mode = 'live-api';
  feed.feedScope = 'europe';
}
await fs.writeFile(path, `${JSON.stringify(feed, null, 2)}\n`);
