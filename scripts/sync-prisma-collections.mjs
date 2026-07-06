import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SOURCE = path.join(ROOT, "prisma", "schema.prisma");
const TARGET = path.join(ROOT, "prisma", ".schema.resolved.prisma");

function resolveCollectionPrefix() {
  if (process.env.MONGODB_COLLECTION_PREFIX) {
    return process.env.MONGODB_COLLECTION_PREFIX;
  }

  if (process.env.VERCEL_ENV === "production") {
    return "prod_";
  }

  if (process.env.VERCEL_ENV === "preview") {
    return "dev_";
  }

  return "dev_";
}

const prefix = resolveCollectionPrefix();
const source = fs.readFileSync(SOURCE, "utf8");

if (!source.includes("__PREFIX__")) {
  console.warn("prisma/schema.prisma enthält kein __PREFIX__ – Collection-Präfix wird übersprungen.");
  fs.writeFileSync(TARGET, source);
  process.exit(0);
}

const resolved = source.replaceAll("__PREFIX__", prefix);
fs.writeFileSync(TARGET, resolved);

console.log(`Prisma Collection-Präfix: ${prefix}`);
console.log(`Schema geschrieben: prisma/.schema.resolved.prisma`);
