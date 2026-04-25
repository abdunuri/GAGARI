import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAuthErrorMessage, logServerError } from "@/lib/auth-error-message";

type CreateBakeryOwnerBody = {
  bakeryName: string;
  ownerName: string;
  ownerEmail: string;
  ownerUsername: string;
  ownerPassword: string;
};

const isNonEmpty = (value: unknown) => typeof value === "string" && value.trim().length > 0;

export async function POST(request: Request) {
  let createdBakeryId: number | null = null;

  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || session.user.role !== "SYSTEM_ADMIN") {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const body = (await request.json()) as Partial<CreateBakeryOwnerBody>;
    const bakeryName = body.bakeryName;
    const ownerName = body.ownerName;
    const ownerEmail = body.ownerEmail;
    const ownerUsername = body.ownerUsername;
    const ownerPassword = body.ownerPassword;

    if (typeof bakeryName !== "string" || typeof ownerName !== "string" || typeof ownerEmail !== "string" || typeof ownerUsername !== "string" || typeof ownerPassword !== "string") {
      return NextResponse.json({ message: "All bakery and owner fields are required." }, { status: 400 });
    }

    const normalizedBakeryName = bakeryName.trim();
    const normalizedOwnerName = ownerName.trim();
    const normalizedOwnerEmail = ownerEmail.trim().toLowerCase();
    const normalizedOwnerUsername = ownerUsername.trim();
    const normalizedOwnerPassword = ownerPassword.trim();

    if (!isNonEmpty(normalizedBakeryName) || !isNonEmpty(normalizedOwnerName) || !isNonEmpty(normalizedOwnerEmail) || !isNonEmpty(normalizedOwnerUsername) || !isNonEmpty(normalizedOwnerPassword)) {
      return NextResponse.json({ message: "All bakery and owner fields are required." }, { status: 400 });
    }

    if (normalizedOwnerPassword.length < 8) {
      return NextResponse.json({ message: "Owner password must be at least 8 characters." }, { status: 400 });
    }

    // Step 1: create bakery with no owner assigned yet.
    const bakeries = await prisma.$queryRaw<Array<{ id: number; name: string }>>`
      INSERT INTO "production"."Bakery" ("name", "createdAt", "updatedAt")
      VALUES (${normalizedBakeryName}, NOW(), NOW())
      RETURNING "id", "name"
    `;

    const bakery = bakeries[0];
    if (!bakery) {
      return NextResponse.json({ message: "Failed to create bakery." }, { status: 500 });
    }
    createdBakeryId = bakery.id;

    // Step 2: create owner account with the created bakery id.
    await auth.api.signUpEmail({
      body: {
        email: normalizedOwnerEmail,
        password: normalizedOwnerPassword,
        name: normalizedOwnerName,
        username: normalizedOwnerUsername,
        role: "OWNER",
        bakeryId: bakery.id,
        callbackURL: "/dashboard",
      },
      headers: request.headers,
    });

    const owner = await prisma.user.findFirst({
      where: { email: normalizedOwnerEmail },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!owner) {
      return NextResponse.json({ message: "Owner account creation did not return a user record." }, { status: 500 });
    }

    // Step 3: set bakery owner id to created owner id.
    const updatedBakery = await prisma.bakery.update({
      where: { id: bakery.id },
      data: { ownerId: owner.id },
      select: {
        id: true,
        name: true,
        ownerId: true,
      },
    });

    return NextResponse.json({
      message: "Bakery and owner created successfully.",
      bakery: updatedBakery,
      owner,
    });
  } catch (error) {
    logServerError("Admin bakery creation failed", error);
    const message = getAuthErrorMessage(error, "signup");

    if (createdBakeryId !== null) {
      // Best-effort cleanup for failures that happen before owner is linked.
      const maybeBakery = await prisma.bakery.findUnique({
        where: { id: createdBakeryId },
        select: { ownerId: true },
      });

      if (maybeBakery && maybeBakery.ownerId === null) {
        await prisma.bakery.delete({ where: { id: createdBakeryId } }).catch(() => {});
      }
    }

    return NextResponse.json({ message }, { status: 400 });
  }
}
