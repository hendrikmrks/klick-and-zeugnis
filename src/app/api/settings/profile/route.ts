import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  const result = await requireUser();
  if ("error" in result) return result.error;

  const { user } = result;
  const body = await req.json();
  const { firstName, lastName } = body;

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      firstName: typeof firstName === "string" ? firstName.trim() || null : user.firstName,
      lastName: typeof lastName === "string" ? lastName.trim() || null : user.lastName,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      birthDate: true,
      subscriptionLevel: true,
      subscriptionExpiresAt: true,
      totpEnabled: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(updated);
}
