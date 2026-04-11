import { NextResponse } from "next/server";

export const revalidate = 3600;

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY!;
const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID!;

// Known title history for repackaged videos
const TITLE_HISTORY: Record<string, string[]> = {
  // videoId: [previous titles, oldest first]
  // "abc123def": ["Building a Junk Cabin with my Daughter"],
};

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  views: number;
  publishedAt: string;
  duration: string;
}

async function fetchAllVideos(): Promise<YouTubeVideo[]> {
  const channelRes = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${CHANNEL_ID}&key=${YOUTUBE_API_KEY}`
  );
  const channelData = await channelRes.json();
  const uploadsPlaylistId =
    channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

  if (!uploadsPlaylistId) throw new Error("Could not find uploads playlist");

  const videoIds: string[] = [];
  let pageToken = "";
  do {
    const playlistRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${uploadsPlaylistId}&maxResults=50&pageToken=${pageToken}&key=${YOUTUBE_API_KEY}`
    );
    const playlistData = await playlistRes.json();
    for (const item of playlistData.items || []) {
      videoIds.push(item.contentDetails.videoId);
    }
    pageToken = playlistData.nextPageToken || "";
  } while (pageToken);

  const videos: YouTubeVideo[] = [];
  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50);
    const videosRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${batch.join(",")}&key=${YOUTUBE_API_KEY}`
    );
    const videosData = await videosRes.json();
    for (const item of videosData.items || []) {
      videos.push({
        id: item.id,
        title: item.snippet.title,
        thumbnail:
          item.snippet.thumbnails?.medium?.url ||
          item.snippet.thumbnails?.high?.url ||
          "",
        views: parseInt(item.statistics.viewCount || "0", 10),
        publishedAt: item.snippet.publishedAt,
        duration: item.contentDetails.duration,
      });
    }
  }

  return videos;
}

export async function GET() {
  try {
    const videos = await fetchAllVideos();
    videos.sort((a, b) => b.views - a.views);

    const enriched = videos.map((v) => ({
      ...v,
      previousTitles: TITLE_HISTORY[v.id] || undefined,
    }));

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("Case studies fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch videos" },
      { status: 500 }
    );
  }
}
