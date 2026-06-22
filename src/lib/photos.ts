export const WEDDING_HASHTAG = "J-rodandJamo";
export const BOOTH_EVENT_CODE = "JJ260926";

export const INSTAGRAM_TAG_URL = `https://www.instagram.com/explore/tags/${encodeURIComponent(WEDDING_HASHTAG)}/`;

export const IN_THE_BOOTH = {
  infoUrl: "https://inthebooth.com.au/big-news-in-the-booth-got-apped/",
  iosUrl: "https://apps.apple.com/au/app/inthebooth/id1015134341",
  androidUrl: "https://play.google.com/store/apps/details?id=com.inthebooth.mobileapp",
} as const;

export type HashtagPhoto = {
  id: string;
  mediaUrl: string;
  permalink: string;
  mediaType: string;
};

export async function fetchHashtagPhotos(): Promise<HashtagPhoto[]> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const userId = process.env.INSTAGRAM_USER_ID;
  const hashtag = process.env.INSTAGRAM_HASHTAG ?? WEDDING_HASHTAG;

  if (!token || !userId) return [];

  const searchRes = await fetch(
    `https://graph.facebook.com/v21.0/ig_hashtag_search?user_id=${userId}&q=${encodeURIComponent(hashtag)}&access_token=${token}`,
    { next: { revalidate: 300 } },
  );

  if (!searchRes.ok) return [];

  const searchData = (await searchRes.json()) as { data?: { id: string }[] };
  const hashtagId = searchData.data?.[0]?.id;
  if (!hashtagId) return [];

  const mediaRes = await fetch(
    `https://graph.facebook.com/v21.0/${hashtagId}/recent_media?user_id=${userId}&fields=id,caption,media_type,media_url,permalink,thumbnail_url&limit=24&access_token=${token}`,
    { next: { revalidate: 300 } },
  );

  if (!mediaRes.ok) return [];

  const mediaData = (await mediaRes.json()) as {
    data?: {
      id: string;
      media_type: string;
      media_url?: string;
      thumbnail_url?: string;
      permalink: string;
    }[];
  };

  return (mediaData.data ?? [])
    .map((item) => ({
      id: item.id,
      mediaUrl: item.media_url ?? item.thumbnail_url ?? "",
      permalink: item.permalink,
      mediaType: item.media_type,
    }))
    .filter((item) => item.mediaUrl);
}
