// YouTube search + stream helpers
// We avoid scraping; for server-side streaming we use play-dl to get an audio stream URL
// For client-side web playback, use Iframe API (see examples/web).

import play from 'play-dl';

async function searchYouTubeId(query) {
  const res = await play.search(query, { limit: 5, source: { youtube: 'video' } });
  const best = res?.[0];
  if (!best) return null;
  return {
    id: best.id,
    title: best.title,
    channel: best.channel?.name,
    durationSec: best.durationInSec,
  };
}

async function searchYouTubeList(query, limit = 5) {
  const res = await play.search(query, { limit, source: { youtube: 'video' } });
  const items = (res || []).map(v => ({
    id: v.id,
    title: v.title || '',
    channel: v.channel?.name || '',
    durationSec: v.durationInSec || 0,
  }));
  // Heuristic scoring: prefer Topic/Audio/Lyric, avoid very long videos
  const score = (it) => {
    let s = 0;
    if (/ - Topic$/i.test(it.channel)) s += 4;
    if (/\b(audio|lyric|lyrics)\b/i.test(it.title)) s += 3;
    if (/\bofficial music video\b/i.test(it.title)) s += 1; // keep, but lower priority than Topic/Audio
    if (it.durationSec > 900) s -= 3; // >15 min less likely a single track
    if (/\bsped up|nightcore\b/i.test(it.title)) s -= 1;
    return s;
  };
  items.sort((a,b) => score(b) - score(a));
  return items;
}

async function getYouTubeStreamInfo(id) {
  // If play-dl cannot get a stream, return null
  try {
    const info = await play.video_info(`https://www.youtube.com/watch?v=${id}`);
    const stream = await play.stream_from_info(info, { quality: 2 }); // 2=highest audio
    if (!stream?.stream?.url) return null;
    return {
      url: stream.stream.url,
      type: stream.type, // opus/webm
      bitrate: stream.audioBitrate,
    };
  } catch (e) {
    return null;
  }
}

export { searchYouTubeId, searchYouTubeList, getYouTubeStreamInfo };
