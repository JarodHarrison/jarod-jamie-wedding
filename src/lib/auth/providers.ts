import { isGoogleOAuthConfigured } from "@/lib/auth/google-oauth";
import { isPasskeyConfigured } from "@/lib/auth/webauthn-config";

export { isGoogleOAuthConfigured, isPasskeyConfigured };

export async function getAuthProviders() {
  return {
    google: isGoogleOAuthConfigured(),
    passkeys: isPasskeyConfigured(),
  };
}
