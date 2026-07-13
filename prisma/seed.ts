import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const forceReset = process.env.FORCE_SEED_RESET === "true";

async function seedUser(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  role: "User" | "Admin" = "User"
) {
  const passwordHash = await hash(password, 12);
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    await prisma.user.update({
      where: { email },
      data: { passwordHash, firstName, lastName, role },
    });
    console.log("Updated user:", email, role === "Admin" ? "(Admin)" : "");
    return;
  }

  await prisma.user.create({
    data: { email, passwordHash, firstName, lastName, role },
  });
  console.log("Seeded user:", email, role === "Admin" ? "(Admin)" : "");
}

async function main() {
  if (forceReset) {
    console.log("FORCE_SEED_RESET=true – lösche alle Anwendungsdaten …");
    await prisma.blocklistEntry.deleteMany();
    await prisma.contactMessage.deleteMany();
    await prisma.supportTicket.deleteMany();
    await prisma.faqItem.deleteMany();
    await prisma.certificateReport.deleteMany();
    await prisma.subscriptionRequest.deleteMany();
    await prisma.certificate.deleteMany();
    await prisma.generatedCertificate.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.authenticator.deleteMany();
    await prisma.user.deleteMany();
  }

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "mail@hendrik-beier.de";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (adminPassword) {
    await seedUser(adminEmail, adminPassword, "Hendrik", "Beier", "Admin");
    console.log("");
    console.log(`Login admin: ${adminEmail}`);
    return;
  }

  await seedUser("test@example.com", "secret123", "Test", "User");
  await seedUser("admin@example.com", "admin123", "Admin", "User", "Admin");
  await seedUser("mail@hendrik-beier.de", "admin123", "Hendrik", "Beier", "Admin");

  console.log("");
  console.log("Login test: test@example.com / secret123");
  console.log("Login admin: admin@example.com / admin123");
  console.log("Login admin: mail@hendrik-beier.de / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
