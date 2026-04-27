import { NextResponse } from "next/server";
import { localeCookieName, resolveLocale } from "@/lib/locales";

const defaultMaxAge = 60 * 60 * 24 * 365;

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON payload." }, { status: 400 });
  }

  const payload = body && typeof body === "object" && !Array.isArray(body) ? body as Record<string, unknown> : {};
  const locale = resolveLocale(typeof payload.locale === "string" ? payload.locale : null);
  const maxAge = typeof payload.maxAge === "number" && payload.maxAge > 0 ? payload.maxAge : defaultMaxAge;
  const response = NextResponse.json({ locale });

  response.cookies.set(localeCookieName, locale, {
    path: "/",
    maxAge,
    sameSite: "lax",
  });

  return response;
}
