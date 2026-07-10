import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";
import { getKeySessionStatus } from "@/lib/privacy-advanced/key-session";

export async function GET() {
  const result = await requireUser();
  if ("error" in result) return result.error;

  const { user } = result;
  const keyStatus = getKeySessionStatus(user.id);

  return NextResponse.json({
    enabled: user.privacyAdvancedModeEnabled,
    keyLoaded: keyStatus.loaded,
    keyExpiresAt: keyStatus.expiresAt,
    mappingCount: keyStatus.mappingCount,
  });
}
