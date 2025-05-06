import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { eq, and, isNull, desc, asc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parentId');
    const view = searchParams.get('view') || 'all';

    let query = db
      .select()
      .from(files)
      .where(eq(files.userId, userId));

    // Apply filters based on view
    if (view === 'trash') {
      // Show only trashed files
      query = query.where(eq(files.isTrashed, true));
    } else if (view === 'starred') {
      // Show only starred files that are not in trash
      query = query.where(
        and(
          eq(files.isStarred, true),
          eq(files.isTrashed, false)
        )
      );
    } else if (view === 'all') {
      // Show files that are not in trash
      query = query.where(eq(files.isTrashed, false));
      
      // Filter by parent folder
      if (parentId) {
        // If parentId is provided, show only files in that folder
        query = query.where(eq(files.parentId, parentId));
      } else {
        // If no parentId (root level), show only files with no parent
        query = query.where(isNull(files.parentId));
      }
    }

    // Order by folders first, then by name
    query = query.orderBy(desc(files.isFolder), asc(files.name));

    const userFiles = await query;
    return NextResponse.json(userFiles);
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json(
      { error: "Failed to fetch files" },
      { status: 500 }
    );
  }
}
