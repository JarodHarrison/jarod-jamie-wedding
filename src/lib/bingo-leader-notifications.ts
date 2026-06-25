import type { Prisma } from "@prisma/client";
import { rankBingoPlayers } from "@/lib/bingo-leaderboard";
import { ANNITA_NOTIFICATION_ICON, scoreBingoItems } from "@/lib/photobooth-bingo";

type Tx = Prisma.TransactionClient;

export async function notifyBingoLeaderboardChanges(params: {
  tx: Tx;
  actorGuestId: string;
  actorName: string;
  previousCheckedItems: string[];
  newCheckedItems: string[];
}) {
  const { tx, actorGuestId, actorName, previousCheckedItems, newCheckedItems } = params;
  const previousScore = scoreBingoItems(previousCheckedItems);
  const newScore = scoreBingoItems(newCheckedItems);
  if (newScore <= previousScore) return;

  const allProgress = await tx.photoboothBingoProgress.findMany({
    select: {
      guestId: true,
      checkedItems: true,
      completedAt: true,
      guest: { select: { name: true } },
    },
  });

  function rankSnapshot(checkedFor: (guestId: string, checkedItems: string[]) => string[]) {
    return rankBingoPlayers(
      allProgress.map((row) => ({
        guestId: row.guestId,
        name: row.guest.name,
        checkedItems: checkedFor(row.guestId, row.checkedItems),
        completedAt: row.completedAt,
      })),
    );
  }

  const beforeRanked = rankSnapshot((guestId, checkedItems) =>
    guestId === actorGuestId ? previousCheckedItems : checkedItems,
  );
  const afterRanked = rankSnapshot((guestId, checkedItems) =>
    guestId === actorGuestId ? newCheckedItems : checkedItems,
  );

  const beforeLeader = beforeRanked[0];
  const afterLeader = afterRanked[0];
  const beforeSecond = beforeRanked[1];
  const afterSecond = afterRanked[1];

  const pending: { guestId: string; title: string; body: string }[] = [];

  if (
    afterLeader?.guestId === actorGuestId &&
    beforeLeader &&
    beforeLeader.guestId !== actorGuestId &&
    newScore > beforeLeader.score
  ) {
    pending.push({
      guestId: beforeLeader.guestId,
      title: "You've been overtaken!",
      body: `${actorName} just took the lead on Photobooth Bingo with ${newScore} points.`,
    });
  }

  if (afterLeader) {
    const leaderId = afterLeader.guestId;
    const leaderScore = afterLeader.score;

    if (afterSecond && leaderScore - afterSecond.score === 1) {
      const wasOneBehind =
        beforeLeader &&
        beforeSecond &&
        beforeLeader.guestId === leaderId &&
        beforeLeader.score - beforeSecond.score === 1;

      if (!wasOneBehind) {
        pending.push({
          guestId: leaderId,
          title: "So close!",
          body: `${afterSecond.name} is only 1 point behind you on Photobooth Bingo. Keep those poses coming!`,
        });
      }
    }

    if (leaderScore > 10 && afterSecond && leaderScore - afterSecond.score <= 10) {
      const wasWithinTen =
        beforeLeader &&
        beforeSecond &&
        beforeLeader.guestId === leaderId &&
        beforeLeader.score > 10 &&
        beforeLeader.score - beforeSecond.score <= 10;

      if (!wasWithinTen) {
        pending.push({
          guestId: leaderId,
          title: "People are catching up!",
          body: `You lead with ${leaderScore} points, but the pack is closing in. Don't slow down now!`,
        });
      }
    }
  }

  if (afterLeader && afterLeader.guestId !== actorGuestId) {
    const actorRank = afterRanked.find((row) => row.guestId === actorGuestId);
    if (actorRank && afterLeader.score - actorRank.score === 1) {
      const wasOneBehindLeader =
        beforeLeader &&
        beforeLeader.guestId !== actorGuestId &&
        previousScore > 0 &&
        beforeLeader.score - previousScore === 1;

      if (!wasOneBehindLeader) {
        pending.push({
          guestId: actorGuestId,
          title: "Almost there!",
          body: `You're only 1 point behind ${afterLeader.name} on Photobooth Bingo!`,
        });
      }
    }
  }

  const seen = new Set<string>();
  for (const notification of pending) {
    const key = `${notification.guestId}:${notification.title}`;
    if (seen.has(key)) continue;
    seen.add(key);

    await tx.inAppNotification.create({
      data: {
        guestId: notification.guestId,
        title: notification.title,
        body: notification.body,
        imageUrl: ANNITA_NOTIFICATION_ICON,
      },
    });
  }
}
