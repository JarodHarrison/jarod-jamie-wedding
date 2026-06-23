import { NextResponse } from "next/server";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { jsonError } from "@/lib/api-utils";
import { setPasskeyChallenge } from "@/lib/auth/passkey-challenge";
import { getSession } from "@/lib/auth/session";
import { getWebAuthnConfig, parseTransports } from "@/lib/auth/webauthn-config";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return jsonError("Unauthorized", 401);
    }

    const owner =
      session.type === "guest"
        ? { guestId: session.id, adminId: undefined as string | undefined }
        : { guestId: undefined as string | undefined, adminId: session.id };

    const existing = await prisma.passkeyCredential.findMany({
      where: session.type === "guest" ? { guestId: session.id } : { adminId: session.id },
      select: { credentialId: true, transports: true },
    });

    const config = getWebAuthnConfig(request);

    const options = await generateRegistrationOptions({
      rpName: config.rpName,
      rpID: config.rpID,
      userName: session.email,
      userDisplayName: session.name,
      userID: new TextEncoder().encode(`${session.type}:${session.id}`),
      attestationType: "none",
      excludeCredentials: existing.map((item) => ({
        id: item.credentialId,
        transports: parseTransports(item.transports ?? undefined),
      })),
      authenticatorSelection: {
        residentKey: "required",
        userVerification: "preferred",
      },
      timeout: 60_000,
    });

    await setPasskeyChallenge({
      challenge: options.challenge,
      type: "registration",
      guestId: owner.guestId,
      adminId: owner.adminId,
    });

    return NextResponse.json({ options, rpID: config.rpID });
  } catch (error) {
    console.error("[passkey/register/options]", error);
    return jsonError("Failed to start passkey setup.", 500);
  }
}
