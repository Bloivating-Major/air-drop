import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { eq, and, not, isNull } from "drizzle-orm";

// Storage limit in bytes (1 GB)
const STORAGE_LIMIT = 1024 * 1024 * 1024;

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all non-deleted files for this user
    const userFiles = await db
      .select()
      .from(files)
      .where(
        and(
          eq(files.userId, userId),
          not(eq(files.isTrashed, true)),
          not(eq(files.isFolder, true))
        )
      );

    // Calculate total storage used
    const storageUsed = userFiles.reduce((total, file) => total + file.size, 0);

    return NextResponse.json({
      used: storageUsed,
      total: STORAGE_LIMIT,
      percentage: Math.min(100, Math.round((storageUsed / STORAGE_LIMIT) * 100))
    });
  } catch (error) {
    console.error("Error calculating storage:", error);
    return NextResponse.json(
      { error: "Failed to calculate storage" },
      { status: 500 }
    );
  }
}