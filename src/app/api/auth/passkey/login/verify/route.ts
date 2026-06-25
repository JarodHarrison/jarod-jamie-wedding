import { NextResponse } from "next/server";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { jsonError } from "@/lib/api-utils";
import {
  createAdminSessionResponse,
  createGuestSessionResponse,
} from "@/lib/auth/create-session";
import { consumePasskeyChallenge } from "@/lib/auth/passkey-challenge";
import { getWebAuthnConfig, parseTransports } from "@/lib/auth/webauthn-config";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const stored = await consumePasskeyChallenge("authentication");
    if (!stored) {
      return jsonError("Passkey sign-in expired. Please try again.", 400);
    }

    const config = getWebAuthnConfig(request);
    const credential = await prisma.passkeyCredential.findUnique({
      where: { credentialId: body.id as string },
      include: {
        guest: { select: { id: true, name: true, email: true, tier: true, isMc: true } },
        admin: { select: { id: true, name: true, email: true } },
      },
    });

    if (!credential) {
      return jsonError("Passkey not recognized.", 401);
    }

    const verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge: stored.challenge,
      expectedOrigin: config.origin,
      expectedRPID: config.rpID,
      requireUserVerification: false,
      credential: {
        id: credential.credentialId,
        publicKey: Buffer.from(credential.publicKey, "base64url"),
        counter: Number(credential.counter),
        transports: parseTransports(credential.transports ?? undefined),
      },
    });

    if (!verification.verified || !verification.authenticationInfo) {
      return jsonError("Passkey verification failed.", 401);
    }

    await prisma.passkeyCredential.update({
      where: { id: credential.id },
      data: {
        counter: BigInt(verification.authenticationInfo.newCounter),
        lastUsedAt: new Date(),
      },
    });

    if (credential.guest) {
      const admin = await prisma.admin.findUnique({
        where: { email: credential.guest.email },
        select: { id: true },
      });
      return createGuestSessionResponse(credential.guest, Boolean(admin));
    }

    if (credential.admin) {
      return createAdminSessionResponse(credential.admin);
    }

    return jsonError("Passkey account not found.", 401);
  } catch (error) {
    console.error("[passkey/login/verify]", error);
    return jsonError("Passkey sign-in failed.", 500);
  }
}
