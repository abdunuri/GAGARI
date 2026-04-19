import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const PUBLIC_PATHS = ["/", "/login",];

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (pathname.startsWith("/api/auth")) {
        return NextResponse.next();
    }

    if (PUBLIC_PATHS.includes(pathname)) {
        return NextResponse.next();
    }

    let session;
    try {
        session = await auth.api.getSession({
            headers: request.headers
        });
    } catch (error) {
        console.error("Failed to retrieve session:", error);
        // Fail closed: treat as unauthenticated
        session = null;
    }
    if(!session) {
        if (pathname.startsWith("/api/")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("next", pathname + request.nextUrl.search);
        return NextResponse.redirect(loginUrl);    }

    return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};