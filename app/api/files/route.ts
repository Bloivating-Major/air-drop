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

    // Ensure we're filtering by the authenticated user's ID
    let query = db
      .select()
      .from(files)
      .where(eq(files.userId, userId));

    // Apply filters based on view
    if (view === 'trash') {
      query = query.where(eq(files.isTrashed, true));
    } else if (view === 'starred') {
      query = query.where(
        and(
          eq(files.isStarred, true),
          eq(files.isTrashed, false)
        )
      );
    } else if (view === 'all') {
      query = query.where(eq(files.isTrashed, false));
      
      if (parentId) {
        query = query.where(eq(files.parentId, parentId));
      } else {
        query = query.where(isNull(files.parentId));
      }
    }

    query = query.orderBy(desc(files.isFolder), asc(files.name));

    const userFiles = await query;
    
    // Double-check that all returned files belong to the current user
    const filteredFiles = userFiles.filter(file => file.userId === userId);
    
    return NextResponse.json(filteredFiles);
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json(
      { error: "Failed to fetch files" },
      { status: 500 }
    );
  }
}
