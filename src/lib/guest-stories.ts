export const GUEST_STORY_MOODS = [
  { value: "funny", label: "Funny", emoji: "😂" },
  { value: "heartfelt", label: "Heartfelt", emoji: "🥹" },
  { value: "chaotic", label: "Chaotic", emoji: "💅" },
  { value: "wholesome", label: "Wholesome", emoji: "💕" },
] as const;

export type GuestStoryMood = (typeof GUEST_STORY_MOODS)[number]["value"];

export const GUEST_STORY_MAX_PER_GUEST = 3;
export const GUEST_STORY_AUTO_HIDE_REPORTS = 2;
export const GUEST_STORY_MIN_LENGTH = 12;
export const GUEST_STORY_MAX_LENGTH = 480;

export function isGuestStoryMood(value: string): value is GuestStoryMood {
  return GUEST_STORY_MOODS.some((mood) => mood.value === value);
}

export function guestStoryMoodLabel(value: string) {
  return GUEST_STORY_MOODS.find((mood) => mood.value === value)?.label ?? value;
}

export type GuestStoryItem = {
  id: string;
  content: string;
  mood: string;
  displayName: string | null;
  createdAt: string;
  isMine: boolean;
};
