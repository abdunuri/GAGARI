import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const PUBLIC_PATHS = ["/", "/login",];

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip auth checks for framework internals and static/public files.
    if (
        pathname.startsWith("/_next") ||
        pathname === "/favicon.ico" ||
        pathname === "/robots.txt" ||
        pathname === "/sitemap.xml" ||
        pathname.includes(".")
    ) {
        return NextResponse.next();
    }

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
        "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};