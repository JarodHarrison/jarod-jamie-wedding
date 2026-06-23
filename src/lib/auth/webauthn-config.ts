import type { AuthenticatorTransportFuture } from "@simplewebauthn/server";

export function isPasskeyConfigured() {
  return Boolean(process.env.AUTH_SECRET);
}

export function getWebAuthnConfig(request: Request) {
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
  const url = new URL(origin);
  const rpID = process.env.WEBAUTHN_RP_ID ?? url.hostname;

  return {
    rpName: "J&J's Wedding",
    rpID,
    origin: url.origin,
  };
}

export function parseTransports(value: string | null | undefined): AuthenticatorTransportFuture[] | undefined {
  if (!value) return undefined;
  return value.split(",").filter(Boolean) as AuthenticatorTransportFuture[];
}
