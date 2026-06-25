import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/constants";

export { MIN_PASSWORD_LENGTH };

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateTemporaryPassword(length = 12): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function buildPasswordFields(password: string) {
  const trimmed = password.trim();
  if (trimmed.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }
  return {
    passwordHash: await hashPassword(trimmed),
    passwordPlaintext: trimmed,
  };
}

/** Random hash with no stored plaintext — guest must sign up to claim the account. */
export async function createUnclaimedPasswordFields() {
  return {
    passwordHash: await hashPassword(randomBytes(32).toString("hex")),
    passwordPlaintext: null as string | null,
  };
}
