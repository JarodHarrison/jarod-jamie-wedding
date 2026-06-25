import { scoreBingoItems } from "@/lib/photobooth-bingo";

export type BingoRankRow = {
  guestId: string;
  name: string;
  score: number;
  completed: boolean;
  verified: boolean;
};

export type BingoLeaderEntry = BingoRankRow & {
  photoUrl: string | null;
};

type GuestPhotoFields = {
  id: string;
  profilePhotoMime: string | null;
  profileUpdatedAt: Date | null;
};

export function guestProfilePhotoUrl(guest: GuestPhotoFields): string | null {
  if (!guest.profilePhotoMime) return null;
  return `/api/guest/profile/photo?guestId=${guest.id}&v=${guest.profileUpdatedAt?.getTime() ?? guest.id}`;
}

export function rankBingoPlayers(
  rows: {
    guestId: string;
    name: string;
    checkedItems: string[];
    completedAt: Date | null | undefined;
    verifiedAt?: Date | null | undefined;
  }[],
): BingoRankRow[] {
  return rows
    .map((row) => ({
      guestId: row.guestId,
      name: row.name,
      score: scoreBingoItems(row.checkedItems),
      completed: Boolean(row.completedAt),
      verified: Boolean(row.verifiedAt),
    }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || Number(b.completed) - Number(a.completed));
}

export function buildBingoLeaderboard(
  rows: {
    guestId: string;
    name: string;
    checkedItems: string[];
    completedAt: Date | null | undefined;
    verifiedAt?: Date | null | undefined;
    profilePhotoMime: string | null;
    profileUpdatedAt: Date | null;
  }[],
): BingoLeaderEntry[] {
  return rankBingoPlayers(rows).map((row) => {
    const guest = rows.find((entry) => entry.guestId === row.guestId);
    return {
      ...row,
      photoUrl: guest
        ? guestProfilePhotoUrl({
            id: guest.guestId,
            profilePhotoMime: guest.profilePhotoMime,
            profileUpdatedAt: guest.profileUpdatedAt,
          })
        : null,
    };
  });
}

export type BingoViewerContext = {
  rank: number | null;
  score: number;
  isLeader: boolean;
  leaderAlert: string | null;
  chaserAlert: string | null;
};

export function buildBingoViewerContext(
  leaders: BingoLeaderEntry[],
  viewerGuestId: string,
): BingoViewerContext {
  const viewerIndex = leaders.findIndex((entry) => entry.guestId === viewerGuestId);
  const viewer = viewerIndex >= 0 ? leaders[viewerIndex] : null;
  const leader = leaders[0] ?? null;
  const second = leaders[1] ?? null;

  let leaderAlert: string | null = null;
  let chaserAlert: string | null = null;

  if (leader && viewer) {
    if (leader.guestId === viewerGuestId) {
      if (leader.score > 10 && second && leader.score - second.score <= 10) {
        leaderAlert = "People are catching up to you — keep snapping those poses!";
      }
      if (second && leader.score - second.score === 1) {
        chaserAlert = `${second.name} is only 1 point behind you!`;
      }
    } else if (leader.score - viewer.score === 1) {
      chaserAlert = `You're only 1 point behind ${leader.name}!`;
    }
  }

  return {
    rank: viewerIndex >= 0 ? viewerIndex + 1 : null,
    score: viewer?.score ?? 0,
    isLeader: Boolean(leader && leader.guestId === viewerGuestId),
    leaderAlert,
    chaserAlert,
  };
}
