import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/auth/password";
import { jsonError } from "@/lib/api-utils";
import { setDriverSessionCookie } from "@/lib/shuttle/driver-session";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const pin = (body.pin ?? "").toString().trim();

    if (!pin || pin.length < 4) {
      return jsonError("Please enter your driver PIN.", 400);
    }

    const drivers = await prisma.driver.findMany();
    let matched = null as (typeof drivers)[number] | null;

    for (const driver of drivers) {
      if (await verifyPassword(pin, driver.pinHash)) {
        matched = driver;
        break;
      }
    }

    if (!matched) {
      return jsonError("Invalid PIN.", 401);
    }

    await setDriverSessionCookie({
      type: "driver",
      id: matched.id,
      name: matched.name,
    });

    return NextResponse.json({
      driver: { id: matched.id, name: matched.name },
    });
  } catch {
    return jsonError("Login failed.", 500);
  }
}
