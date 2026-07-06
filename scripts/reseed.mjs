import { execSync } from "node:child_process";

process.env.FORCE_SEED_RESET = "true";

execSync("node scripts/sync-prisma-collections.mjs", { stdio: "inherit", env: process.env });
execSync("npx prisma db push --schema=prisma/.schema.resolved.prisma", {
  stdio: "inherit",
  env: process.env,
});
execSync("npx prisma db seed --schema=prisma/.schema.resolved.prisma", {
  stdio: "inherit",
  env: process.env,
});

console.log("\nReseed abgeschlossen.");
