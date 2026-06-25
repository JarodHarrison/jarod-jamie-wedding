import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { buildPasswordFields, generateTemporaryPassword } from "@/lib/auth/password";
import { requireAdminAccess } from "@/lib/auth/admin-access";
import { jsonError } from "@/lib/api-utils";
import { sendGuestInviteEmail } from "@/lib/guest-emails";
import {
  GUEST_IMPORT_TEMPLATE_CSV,
  parseGuestSpreadsheet,
  type GuestSpreadsheetRow,
} from "@/lib/guest-spreadsheet-import";
import { mergeSayiGuestExports } from "@/lib/guest-spreadsheet-merge";
import { findExistingGuestForImport } from "@/lib/guest-claim";
import { prisma } from "@/lib/prisma";

type ImportMode = "create" | "upsert";

function buildGuestProfileFields(row: GuestSpreadsheetRow) {
  const hasRsvpAnswer =
    row.rsvpStatus !== "PENDING" ||
    Boolean(
      row.phone ||
        row.plusOneName ||
        row.dietaryNotes ||
        row.songRequest ||
        row.sayiPartyName,
    );

  const sayiImportedAt = new Date();

  return {
    rsvpStatus: row.rsvpStatus,
    phone: row.phone,
    plusOneName: row.plusOneName,
    dietaryNotes: row.dietaryNotes,
    songRequest: row.songRequest,
    guestOfHost: row.guestOfHost,
    guestRelationship: row.guestRelationship,
    guestRelationshipNote: row.guestRelationshipNote,
    accommodationAddress: row.accommodationAddress,
    mailingAddress: row.mailingAddress,
    sayiPartyName: row.sayiPartyName,
    sayiLink: row.sayiLink,
    sayiPlusOneAllowed: row.sayiPlusOneAllowed,
    sayiCustomData: row.sayiCustomData ?? undefined,
    sayiImportedAt,
    ...(row.rsvpStatus !== "PENDING" || hasRsvpAnswer
      ? { rsvpSubmittedAt: sayiImportedAt }
      : {}),
  };
}

function buildGuestData(row: GuestSpreadsheetRow, passwordFields: { passwordHash: string; passwordPlaintext: string }) {
  const data: Prisma.GuestCreateInput = {
    name: row.name,
    email: row.email,
    tier: row.tier,
    passwordHash: passwordFields.passwordHash,
    passwordPlaintext: passwordFields.passwordPlaintext,
    ...buildGuestProfileFields(row),
  };

  return data;
}

function buildGuestUpdateData(row: GuestSpreadsheetRow) {
  const data: Prisma.GuestUpdateInput = {
    name: row.name,
    tier: row.tier,
    ...buildGuestProfileFields(row),
  };

  return data;
}

export async function GET() {
  try {
    await requireAdminAccess();
    return new NextResponse(GUEST_IMPORT_TEMPLATE_CSV, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="guest-import-template.csv"',
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Failed to load template.", 500);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminAccess();

    const formData = await request.formData();
    const file = formData.get("file");
    const attendingFile = formData.get("attendingFile");
    const rsvpFile = formData.get("rsvpFile");
    const mode = (formData.get("mode") ?? "upsert").toString() as ImportMode;
    const sendInvites = formData.get("sendInvites") === "true";

    if (mode !== "create" && mode !== "upsert") {
      return jsonError("Invalid import mode.", 400);
    }

    let rows: GuestSpreadsheetRow[];
    let parseErrors: { row: number; message: string }[];
    let format: "standard" | "sayi";
    let generatedEmailCount: number;
    let extraColumns: string[];
    let mergeStats: { matched: number; attendingOnly: number; rsvpOnly: number } | undefined;

    if (attendingFile instanceof File && rsvpFile instanceof File) {
      const merged = mergeSayiGuestExports(await attendingFile.text(), await rsvpFile.text());
      rows = merged.rows;
      parseErrors = merged.errors;
      format = merged.format;
      generatedEmailCount = merged.generatedEmailCount;
      extraColumns = merged.extraColumns;
      mergeStats = merged.mergeStats;
    } else if (file instanceof File) {
      const parsed = parseGuestSpreadsheet(await file.text());
      rows = parsed.rows;
      parseErrors = parsed.errors;
      format = parsed.format;
      generatedEmailCount = parsed.generatedEmailCount;
      extraColumns = parsed.extraColumns;
    } else {
      return jsonError("Upload a CSV file, or both Sayi attending + RSVP CSV files.", 400);
    }

    if (rows.length === 0) {
      return jsonError(parseErrors[0]?.message ?? "No valid rows found.", 400);
    }

    const result = {
      created: 0,
      updated: 0,
      skipped: 0,
      invited: 0,
      format,
      generatedEmailCount,
      extraColumns,
      mergeStats,
      errors: [...parseErrors] as { row: number; message: string; email?: string }[],
      passwords: [] as { name: string; email: string; password: string }[],
    };

    for (const row of rows) {
      try {
        const existing = await findExistingGuestForImport(row);

        if (existing) {
          if (mode === "create") {
            result.skipped += 1;
            result.errors.push({
              row: row.rowNumber,
              email: row.email,
              message: "Guest already exists (create-only mode).",
            });
            continue;
          }

          const updateData = buildGuestUpdateData(row);

          if (row.password) {
            const passwordFields = await buildPasswordFields(row.password);
            Object.assign(updateData, {
              passwordHash: passwordFields.passwordHash,
              passwordPlaintext: passwordFields.passwordPlaintext,
            });
          }

          await prisma.guest.update({
            where: { id: existing.id },
            data: updateData,
          });
          result.updated += 1;
          continue;
        }

        const password = row.password || generateTemporaryPassword();
        const passwordFields = await buildPasswordFields(password);

        await prisma.guest.create({
          data: buildGuestData(row, passwordFields),
        });

        result.created += 1;
        result.passwords.push({ name: row.name, email: row.email, password });

        if (sendInvites && !row.emailGenerated) {
          void sendGuestInviteEmail({ name: row.name, email: row.email, password });
          result.invited += 1;
        }
      } catch (error) {
        result.errors.push({
          row: row.rowNumber,
          email: row.email,
          message: error instanceof Error ? error.message : "Import failed for this row.",
        });
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    console.error("[admin/guests/import]", error);
    return jsonError("Failed to import guests.", 500);
  }
}
