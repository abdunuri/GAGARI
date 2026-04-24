import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAuthErrorMessage } from "@/lib/auth-error-message";

type SignupContext = "BOOTSTRAP" | "ADMIN" | "OWNER";
type Role = "ADMIN" | "OWNER" | "STAFF" | "VIEWER";

type SignUpBody = {
  email: string;
  password: string;
  name: string;
  username: string;
  role: Role;
  currentUserRole: SignupContext;
  bakeryId?: number;
};

const ROLE_OPTIONS: Record<SignupContext, Role[]> = {
  BOOTSTRAP: ["ADMIN"],
  ADMIN: ["ADMIN", "OWNER", "STAFF", "VIEWER"],
  OWNER: ["STAFF", "VIEWER"],
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<SignUpBody>;
    const email = body.email?.trim();
    const password = body.password;
    const name = body.name?.trim();
    const username = body.username?.trim();
    const role = body.role;
    const currentUserRole = body.currentUserRole;
    const requestedBakeryId = body.bakeryId;

    if (!email || !password || !name || !username || !role || !currentUserRole) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }

    if (!(currentUserRole in ROLE_OPTIONS)) {
      return NextResponse.json({ message: "Invalid signup context." }, { status: 400 });
    }

    const session = currentUserRole === "BOOTSTRAP" ? null : await auth.api.getSession({ headers: request.headers });

    if (currentUserRole !== "BOOTSTRAP" && !session) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    if (currentUserRole !== "BOOTSTRAP" && session?.user.role !== currentUserRole) {
      return NextResponse.json({ message: "Signup context does not match your session role." }, { status: 403 });
    }

    const userCount = await prisma.user.count();
    if (currentUserRole === "BOOTSTRAP" && userCount > 0) {
      return NextResponse.json(
        { message: "Bootstrap signup is only available when the database is empty." },
        { status: 403 }
      );
    }

    const resolvedBakeryId =
      currentUserRole === "BOOTSTRAP"
        ? null
        : currentUserRole === "OWNER"
          ? session?.user.bakeryId ?? null
          : typeof requestedBakeryId === "number" && Number.isInteger(requestedBakeryId) && requestedBakeryId > 0
            ? requestedBakeryId
            : null;

    if (currentUserRole !== "BOOTSTRAP" && resolvedBakeryId === null) {
      return NextResponse.json({ message: "Bakery ID is required." }, { status: 400 });
    }

    const allowedRoles = ROLE_OPTIONS[currentUserRole];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        { message: `Role ${role} is not allowed for ${currentUserRole.toLowerCase()}` },
        { status: 403 }
      );
    }

    const selectedRole = currentUserRole === "BOOTSTRAP" ? "ADMIN" : role;

    const response = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
        username,
        role: selectedRole,
        callbackURL: "/dashboard",
        ...(resolvedBakeryId !== null ? { bakeryId: resolvedBakeryId } : {}),
      },
      headers: request.headers,
    });

    return NextResponse.json(response ?? { ok: true });
  } catch (error) {
    const message = getAuthErrorMessage(error, "signup");
    return NextResponse.json({ message }, { status: 400 });
  }
}
