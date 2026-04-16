import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const PUBLIC_PATHS = ["/", "/login", "/signup"];

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (pathname.startsWith("/api/auth")) {
        return NextResponse.next();
    }

    if (PUBLIC_PATHS.includes(pathname)) {
        return NextResponse.next();
    }

    const session = await auth.api.getSession({
        headers: request.headers
    });

    if(!session) {
        if (pathname.startsWith("/api/")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("next", pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};