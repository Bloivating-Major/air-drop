import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import ImageKit from "imagekit";

// Initialize ImageKit with your credentials
const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "",
});

export async function DELETE(
  request: NextRequest,
  props: { params: { folderId: string } | Promise<{ folderId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Handle both synchronous and asynchronous params
    const params = props.params instanceof Promise 
      ? await props.params 
      : props.params;
    
    const { folderId } = params;

    if (!folderId) {
      return NextResponse.json(
        { error: "Folder ID is required" },
        { status: 400 }
      );
    }

    console.log(`Attempting to delete folder with ID: ${folderId}`);

    // First check if the item exists at all
    const [item] = await db
      .select()
      .from(files)
      .where(
        and(
          eq(files.id, folderId),
          eq(files.userId, userId)
        )
      );

    if (!item) {
      console.log(`No item found with ID ${folderId}`);
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    console.log(`Found item: ${item.name}, isFolder: ${item.isFolder}`);

    // If it's not a folder, return an error
    if (!item.isFolder) {
      console.log(`Item with ID ${folderId} is not a folder`);
      return NextResponse.json(
        { error: "The specified ID belongs to a file, not a folder" },
        { status: 400 }
      );
    }

    // Check if folder is empty
    const folderContents = await db
      .select()
      .from(files)
      .where(
        and(
          eq(files.parentId, folderId),
          eq(files.userId, userId)
        )
      );
      
    console.log(`Folder ${folderId} contains ${folderContents.length} items`);

    // If folder has contents, recursively delete them
    if (folderContents.length > 0) {
      await recursivelyDeleteFolder(folderId, userId);
    } else {
      console.log(`Folder ${folderId} is empty, skipping recursive deletion`);
    }

    // Delete the folder itself from the database
    const [deletedFolder] = await db
      .delete(files)
      .where(
        and(
          eq(files.id, folderId),
          eq(files.userId, userId)
        )
      )
      .returning();

    console.log(`Successfully deleted folder from database: ${deletedFolder.name}`);

    return NextResponse.json({
      success: true,
      message: "Folder deleted successfully",
      deletedFolder,
    });
  } catch (error) {
    console.error("Error deleting folder:", error);
    return NextResponse.json(
      { error: "Failed to delete folder" },
      { status: 500 }
    );
  }
}

// Helper function to recursively delete folder contents
async function recursivelyDeleteFolder(folderId: string, userId: string) {
  try {
    // Get all files and subfolders in this folder
    const folderContents = await db
      .select()
      .from(files)
      .where(
        and(
          eq(files.parentId, folderId),
          eq(files.userId, userId)
        )
      );

    console.log(`Found ${folderContents.length} items in folder ${folderId}`);
    
    // If folder is empty, just return
    if (folderContents.length === 0) {
      console.log(`Folder ${folderId} is empty, nothing to delete`);
      return true;
    }

    // Process each item
    for (const item of folderContents) {
      if (item.isFolder) {
        // Recursively delete subfolders
        await recursivelyDeleteFolder(item.id, userId);
        
        // Then delete the subfolder itself
        await db
          .delete(files)
          .where(
            and(
              eq(files.id, item.id),
              eq(files.userId, userId)
            )
          );
          
        console.log(`Deleted subfolder: ${item.name}`);
      } else {
        // Delete file from storage if it has a path
        if (item.path) {
          try {
            await imagekit.deleteFile(item.path);
            console.log(`Deleted file from storage: ${item.path}`);
          } catch (storageError) {
            console.error(`Failed to delete file from storage: ${item.path}`, storageError);
            // Continue with database deletion even if storage deletion fails
          }
        }
        
        // Delete the file from database
        await db
          .delete(files)
          .where(
            and(
              eq(files.id, item.id),
              eq(files.userId, userId)
            )
          );
          
        console.log(`Deleted file: ${item.name}`);
      }
    }
    
    console.log(`Successfully deleted all contents of folder ${folderId}`);
    return true;
  } catch (error) {
    console.error(`Error in recursivelyDeleteFolder for folder ${folderId}:`, error);
    throw error;
  }
}






