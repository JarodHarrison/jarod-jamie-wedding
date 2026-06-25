export type WallPhoto = {
  id: string;
  source: "hashtag" | "upload";
  mediaUrl: string;
  permalink: string | null;
  mediaType: string;
  caption: string | null;
  guestName: string | null;
  createdAt: string;
};
