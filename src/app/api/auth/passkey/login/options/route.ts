import { NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { jsonError } from "@/lib/api-utils";
import { setPasskeyChallenge } from "@/lib/auth/passkey-challenge";
import { getWebAuthnConfig } from "@/lib/auth/webauthn-config";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const config = getWebAuthnConfig(request);
    const options = await generateAuthenticationOptions({
      rpID: config.rpID,
      userVerification: "preferred",
      timeout: 60_000,
    });

    await setPasskeyChallenge({
      challenge: options.challenge,
      type: "authentication",
    });

    return NextResponse.json({ options, rpID: config.rpID });
  } catch (error) {
    console.error("[passkey/login/options]", error);
    return jsonError("Failed to start passkey sign-in.", 500);
  }
}
