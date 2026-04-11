import { NextResponse } from "next/server";

export const revalidate = 3600;

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY!;
const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID!;

interface PatternResult {
  pattern: string;
  avgViews: number;
  count: number;
}

function detectPattern(title: string): string | null {
  if (
    /\b(this will|you will|how you|change how|what you)\b/i.test(title) ||
    /\bI promise\b/i.test(title)
  ) {
    return "Viewer Promise";
  }
  if (
    /\$[\d,]+/.test(title) ||
    /\b(from this|into a|turned .+ into)\b/i.test(title)
  ) {
    return "Transformation + Proof";
  }
  if (title.length < 30 && /^(she|he|they|it|this|we)\b/i.test(title)) {
    return "Curiosity Gap";
  }
  if (
    /\b(\d+\s*(year|month|week|day)s?)\b/i.test(title) &&
    /\b(to|from|beginner|started)\b/i.test(title)
  ) {
    return "Journey + Timeframe";
  }
  if (
    /\b(I had|only had|just \d+)\b/i.test(title) &&
    /\b(day|hour|week)\b/i.test(title)
  ) {
    return "Deadline Tension";
  }
  if (
    /\b(idiot|wrong|destroying|ruining|mistake|stop|never|worst)\b/i.test(title)
  ) {
    return "Strong Opinion";
  }
  if (/^how to\b/i.test(title) || /\bwithout\b/i.test(title)) {
    return "How-to / Utility";
  }
  return null;
}

function analyzePatterns(
  videos: { title: string; views: number }[]
): PatternResult[] {
  const patternMap: Record<string, { totalViews: number; count: number }> = {};
  for (const v of videos) {
    const pattern = detectPattern(v.title);
    if (pattern) {
      if (!patternMap[pattern])
        patternMap[pattern] = { totalViews: 0, count: 0 };
      patternMap[pattern].totalViews += v.views;
      patternMap[pattern].count += 1;
    }
  }
  return Object.entries(patternMap)
    .map(([pattern, data]) => ({
      pattern,
      avgViews: Math.round(data.totalViews / data.count),
      count: data.count,
    }))
    .sort((a, b) => b.avgViews - a.avgViews);
}

export async function GET() {
  try {
    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics,contentDetails&id=${CHANNEL_ID}&key=${YOUTUBE_API_KEY}`
    );
    const channelData = await channelRes.json();
    const channelStats = channelData.items?.[0]?.statistics;
    const uploadsPlaylistId =
      channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

    if (!channelStats || !uploadsPlaylistId) {
      throw new Error("Could not fetch channel data");
    }

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

    const videos: { title: string; views: number }[] = [];
    for (let i = 0; i < videoIds.length; i += 50) {
      const batch = videoIds.slice(i, i + 50);
      const videosRes = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${batch.join(",")}&key=${YOUTUBE_API_KEY}`
      );
      const videosData = await videosRes.json();
      for (const item of videosData.items || []) {
        videos.push({
          title: item.snippet.title,
          views: parseInt(item.statistics.viewCount || "0", 10),
        });
      }
    }

    const totalViews = parseInt(channelStats.viewCount || "0", 10);
    const subscribers = parseInt(channelStats.subscriberCount || "0", 10);
    const avgViews =
      videos.length > 0
        ? Math.round(
            videos.reduce((s, v) => s + v.views, 0) / videos.length
          )
        : 0;

    const avgCtr = 6.5; // Replace with YouTube Analytics API if available

    const topPatterns = analyzePatterns(videos);

    return NextResponse.json({
      avgCtr,
      avgViews,
      totalViews,
      subscribers,
      topPatterns,
    });
  } catch (error) {
    console.error("Stats fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
