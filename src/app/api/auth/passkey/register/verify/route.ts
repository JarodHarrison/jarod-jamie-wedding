import { NextResponse } from "next/server";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { jsonError } from "@/lib/api-utils";
import { consumePasskeyChallenge } from "@/lib/auth/passkey-challenge";
import { getWebAuthnConfig } from "@/lib/auth/webauthn-config";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const stored = await consumePasskeyChallenge("registration");
    if (!stored || (!stored.guestId && !stored.adminId)) {
      return jsonError("Passkey setup expired. Please try again.", 400);
    }

    const config = getWebAuthnConfig(request);
    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge: stored.challenge,
      expectedOrigin: config.origin,
      expectedRPID: config.rpID,
      requireUserVerification: false,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return jsonError("Passkey setup failed.", 400);
    }

    const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;
    const transports = body.response?.transports?.join(",") ?? null;

    await prisma.passkeyCredential.create({
      data: {
        guestId: stored.guestId,
        adminId: stored.adminId,
        credentialId: credential.id,
        publicKey: Buffer.from(credential.publicKey).toString("base64url"),
        counter: BigInt(credential.counter),
        deviceType: credentialDeviceType,
        backedUp: credentialBackedUp,
        transports,
      },
    });

    return NextResponse.json({ success: true, message: "Passkey added successfully." });
  } catch (error) {
    console.error("[passkey/register/verify]", error);
    return jsonError("Passkey setup failed.", 500);
  }
}
