const FEED_KEY = "feedItems";

export function saveFeedItems(feedItems) {
  const ttl = 24 * 60 * 60 * 1000; // 1 day in ms
  const item = {
    value: feedItems,
    expiry: Date.now() + ttl,
  };
  localStorage.setItem(FEED_KEY, JSON.stringify(item));
}

export function loadFeedItems() {
  const itemStr = localStorage.getItem(FEED_KEY);
  if (!itemStr) return [];

  try {
    const item = JSON.parse(itemStr);
    if (!item.expiry || Date.now() > item.expiry) {
      localStorage.removeItem(FEED_KEY); // expired
      return [];
    }
    return Array.isArray(item.value) ? item.value : [];
  } catch {
    return [];
  }
}
