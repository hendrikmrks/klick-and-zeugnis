import { prisma } from "@/lib/prisma";

export async function isEmailBlocked(email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  const entry = await prisma.blocklistEntry.findFirst({
    where: { email: normalized },
  });
  return Boolean(entry);
}

export async function isIpBlocked(ip: string | null): Promise<boolean> {
  if (!ip) return false;
  const entry = await prisma.blocklistEntry.findFirst({
    where: { ip },
  });
  return Boolean(entry);
}

export async function isRegistrationBlocked(
  email: string,
  ip: string | null
): Promise<boolean> {
  const [emailBlocked, ipBlocked] = await Promise.all([
    isEmailBlocked(email),
    isIpBlocked(ip),
  ]);
  return emailBlocked || ipBlocked;
}

export async function blockUser(
  userId: string,
  reason?: string
): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        isBlocked: true,
        blockedAt: new Date(),
        blockedReason: reason ?? null,
      },
    });

    if (user.email) {
      const email = user.email.trim().toLowerCase();
      const existingEmail = await tx.blocklistEntry.findFirst({
        where: { email },
      });
      if (!existingEmail) {
        await tx.blocklistEntry.create({
          data: { email, reason, userId },
        });
      }
    }

    if (user.registrationIp) {
      const existingIp = await tx.blocklistEntry.findFirst({
        where: { ip: user.registrationIp },
      });
      if (!existingIp) {
        await tx.blocklistEntry.create({
          data: { ip: user.registrationIp, reason, userId },
        });
      }
    }
  });
}

export async function unblockUser(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        isBlocked: false,
        blockedAt: null,
        blockedReason: null,
      },
    });

    if (user.email) {
      await tx.blocklistEntry.deleteMany({
        where: { email: user.email.trim().toLowerCase() },
      });
    }

    if (user.registrationIp) {
      await tx.blocklistEntry.deleteMany({
        where: { ip: user.registrationIp },
      });
    }
  });
}
