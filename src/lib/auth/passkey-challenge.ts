import { cookies } from "next/headers";

const CHALLENGE_COOKIE = "passkey_challenge";
const MAX_AGE = 60 * 5;

type ChallengePayload = {
  challenge: string;
  type: "registration" | "authentication";
  guestId?: string;
  adminId?: string;
};

export async function setPasskeyChallenge(payload: ChallengePayload) {
  const cookieStore = await cookies();
  cookieStore.set(CHALLENGE_COOKIE, JSON.stringify(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export async function consumePasskeyChallenge(expectedType: ChallengePayload["type"]) {
  const cookieStore = await cookies();
  const raw = cookieStore.get(CHALLENGE_COOKIE)?.value;
  cookieStore.delete(CHALLENGE_COOKIE);
  if (!raw) return null;

  try {
    const payload = JSON.parse(raw) as ChallengePayload;
    if (payload.type !== expectedType || !payload.challenge) return null;
    return payload;
  } catch {
    return null;
  }
}
