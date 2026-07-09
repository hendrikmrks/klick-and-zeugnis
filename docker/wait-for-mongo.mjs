const maxAttempts = Number(process.env.MONGO_WAIT_ATTEMPTS ?? 30);
const delayMs = Number(process.env.MONGO_WAIT_DELAY_MS ?? 2000);

async function waitForMongo() {
  const { PrismaClient } = await import("@prisma/client");

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const prisma = new PrismaClient();
    try {
      await prisma.$connect();
      await prisma.$disconnect();
      console.log("MongoDB ist erreichbar.");
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.log(`MongoDB noch nicht bereit (${attempt}/${maxAttempts}): ${message}`);
      await prisma.$disconnect().catch(() => undefined);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw new Error("MongoDB war nach mehreren Versuchen nicht erreichbar.");
}

waitForMongo().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
