export interface YouTubeVideo {
  title: string;
  url: string;
  thumbnail: string;
  published: string;
}

export async function getLatestVideos(count = 3): Promise<YouTubeVideo[]> {
  const CHANNEL_ID = "UCk0O_ZN01r4U3IImiE-ufTQ";
  const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

  const res = await fetch(feedUrl, { next: { revalidate: 3600 } });
  if (!res.ok) return [];

  const xml = await res.text();

  const entries: YouTubeVideo[] = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;

  while ((match = entryRegex.exec(xml)) !== null && entries.length < count) {
    const entry = match[1];
    const videoId = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/)?.[1] ?? "";
    const title = entry.match(/<title>(.*?)<\/title>/)?.[1] ?? "";
    const published = entry.match(/<published>(.*?)<\/published>/)?.[1] ?? "";

    if (videoId) {
      entries.push({
        title,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
        published,
      });
    }
  }

  return entries;
}
