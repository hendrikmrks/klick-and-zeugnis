import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = (
    process.env.SEED_ADMIN_EMAIL ??
    process.env.ADMIN_EMAIL ??
    "mail@hendrik-beier.de"
  )
    .trim()
    .toLowerCase();

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.log(`ensure-admin: Nutzer ${email} nicht gefunden – übersprungen.`);
    return;
  }

  if (user.role === "Admin") {
    console.log(`ensure-admin: ${email} ist bereits Admin.`);
    return;
  }

  await prisma.user.update({
    where: { email },
    data: { role: "Admin" },
  });

  console.log(`ensure-admin: ${email} wurde zum Admin befördert.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
