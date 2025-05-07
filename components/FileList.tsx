"use client";

import { useEffect, useState, useMemo } from "react";
import { Folder, Star, Trash, X, ExternalLink } from "lucide-react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Divider } from "@heroui/divider";
import { Tooltip } from "@heroui/tooltip";
import { Card } from "@heroui/card";
import { addToast } from "@heroui/toast";
import { formatDistanceToNow, format } from "date-fns";
import type { File as FileType } from "@/lib/db/schema";
import axios from "axios";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import FileEmptyState from "@/components/FileEmptyState";
import FileIcon from "@/components/FileIcon";
import FileActions from "@/components/FileActions";
import FileLoadingState from "@/components/FileLoadingState";
import FileTabs from "@/components/FileTabs";
import FolderNavigation from "@/components/FolderNavigation";
import FileActionButtons from "@/components/FileActionButtons";

interface FileListProps {
  userId: string;
  refreshTrigger?: number;
  onFolderChange?: (folderId: string | null) => void;
}

export default function FileList({
  userId,
  refreshTrigger = 0,
  onFolderChange,
}: FileListProps) {
  const [files, setFiles] = useState<FileType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [trashCount, setTrashCount] = useState(0);
  const [starredCount, setStarredCount] = useState(0);
  const [allFilesCount, setAllFilesCount] = useState(0);

  // Modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [emptyTrashModalOpen, setEmptyTrashModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null);

  // Add this function to dispatch the storage-updated event
  const triggerStorageUpdate = () => {
    window.dispatchEvent(new Event('storage-updated'));
  };

  // Fetch files
  const fetchFiles = async () => {
    setLoading(true);
    try {
      // First, fetch ALL files to get accurate counts for all tabs
      const allFilesResponse = await axios.get('/api/files');
      const allFiles = allFilesResponse.data;
      
      // Calculate counts from all files
      const allTrashCount = allFiles.filter(file => file.isTrashed).length;
      const allStarredCount = allFiles.filter(file => file.isStarred && !file.isTrashed).length;
      const allFilesCount = allFiles.filter(file => !file.isTrashed).length;
      
      // Update counts
      setTrashCount(allTrashCount);
      setStarredCount(allStarredCount);
      setAllFilesCount(allFilesCount); // Add this line
      
      // Now fetch files for the current view
      const params = new URLSearchParams();
      
      // Add view parameter based on activeTab
      params.append('view', activeTab);
      
      // Add folder parameter if we're in a folder
      if (currentFolder) {
        params.append('parentId', currentFolder);
      }
      
      const url = `/api/files?${params.toString()}`;
      console.log('Fetching files with URL:', url);
      
      const response = await axios.get(url);
      setFiles(response.data);
      
      console.log('Files received:', response.data);
    } catch (error) {
      console.error("Error fetching files:", error);
      addToast({
        title: "Error Loading Files",
        description: "We couldn't load your files. Please try again later.",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch files when userId, refreshTrigger, currentFolder, or activeTab changes
  useEffect(() => {
    fetchFiles();
  }, [userId, refreshTrigger, currentFolder, activeTab]);

  // Filter files based on active tab
  const filteredFiles = useMemo(() => {
    switch (activeTab) {
      case "starred":
        return files.filter((file) => file.isStarred && !file.isTrashed);
      case "trash":
        return files.filter((file) => file.isTrashed);
      case "all":
      default:
        return files.filter((file) => !file.isTrashed);
    }
  }, [files, activeTab]);

  const handleStarFile = async (fileId: string) => {
    try {
      const file = files.find((f) => f.id === fileId);
      if (!file) return;
      
      await axios.patch(`/api/files/${fileId}/star`);

      // Update local state
      setFiles(
        files.map((file) =>
          file.id === fileId ? { ...file, isStarred: !file.isStarred } : file
        )
      );
      
      // Update starred count
      if (file.isStarred) {
        setStarredCount(prev => prev - 1);
      } else {
        setStarredCount(prev => prev + 1);
      }

      // Show toast
      addToast({
        title: file.isStarred ? "Removed from Starred" : "Added to Starred",
        description: `"${file.name}" has been ${
          file.isStarred ? "removed from" : "added to"
        } your starred files`,
        color: "success",
      });
    } catch (error) {
      console.error("Error starring file:", error);
      addToast({
        title: "Action Failed",
        description: "We couldn't update the star status. Please try again.",
        color: "danger",
      });
    }
  };

  const handleTrashFile = async (fileId: string) => {
    try {
      // Store the current state of the file before making the API call
      const file = files.find((f) => f.id === fileId);
      if (!file) return;
      
      const isCurrentlyTrashed = file.isTrashed;
      const fileName = file.name;

      // Make the API call to toggle trash status
      await axios.patch(`/api/files/${fileId}/trash`);
      
      // Update local state
      setFiles(
        files.map((file) =>
          file.id === fileId ? { ...file, isTrashed: !file.isTrashed } : file
        )
      );
      
      // Update counts
      if (isCurrentlyTrashed) {
        setTrashCount(prev => prev - 1);
        setAllFilesCount(prev => prev + 1); // Add this line
      } else {
        setTrashCount(prev => prev + 1);
        setAllFilesCount(prev => prev - 1); // Add this line
      }

      // Show appropriate toast message based on the action
      addToast({
        title: isCurrentlyTrashed ? "File Restored" : "Moved to Trash",
        description: `"${fileName}" has been ${
          isCurrentlyTrashed ? "restored from trash" : "moved to trash"
        }`,
        color: "success",
      });
      
      // Trigger storage update
      triggerStorageUpdate();
    } catch (error) {
      console.error("Error updating file trash status:", error);
      addToast({
        title: "Action Failed",
        description: "We couldn't update the file status. Please try again.",
        color: "danger",
      });
    }
  };

  const handleDeleteFile = async () => {
    if (!selectedFile) return;

    try {
      console.log(`Deleting ${selectedFile.isFolder ? 'folder' : 'file'} with ID: ${selectedFile.id}`);
      
      // Store file info before deletion
      const fileInfo = {
        id: selectedFile.id,
        name: selectedFile.name,
        isFolder: selectedFile.isFolder,
        isStarred: selectedFile.isStarred,
        isTrashed: selectedFile.isTrashed
      };
      
      // Close modal first to prevent multiple clicks
      setDeleteModalOpen(false);
      
      // Use different endpoints for files and folders
      let endpoint;
      if (selectedFile.isFolder) {
        endpoint = `/api/folders/${selectedFile.id}/delete`;
      } else {
        endpoint = `/api/files/${selectedFile.id}/delete`;
      }
      
      console.log(`Using endpoint: ${endpoint}`);
      
      // Make the API call
      const response = await axios.delete(endpoint);
      console.log('Delete response:', response.data);

      // Remove the file from local state immediately
      setFiles(prevFiles => prevFiles.filter(file => file.id !== fileInfo.id));
      
      // Update counts
      if (fileInfo.isTrashed) {
        setTrashCount(prev => prev - 1);
      } else {
        setAllFilesCount(prev => prev - 1); // Add this line
      }
      
      if (fileInfo.isStarred && !fileInfo.isTrashed) {
        setStarredCount(prev => prev - 1);
      }
      
      // Only show success toast after successful deletion
      addToast({
        title: fileInfo.isFolder ? "Folder Deleted" : "File Deleted",
        description: `"${fileInfo.name}" has been permanently deleted`,
        color: "success",
      });
      
      // Trigger storage update
      triggerStorageUpdate();
      
      // If we deleted a folder and we're currently in it, navigate up
      if (fileInfo.isFolder && currentFolder === fileInfo.id) {
        navigateUp();
      }
      
    } catch (error) {
      console.error("Error deleting file/folder:", error);
      
      // Show error toast only if deletion fails
      const errorMessage = error.response?.data?.error || "We couldn't delete this item. Please try again later.";
      
      addToast({
        title: "Deletion Failed",
        description: errorMessage,
        color: "danger",
      });
    }
  };

  const handleEmptyTrash = async () => {
    try {
      await axios.delete(`/api/files/empty-trash`);

      // Remove all trashed files from local state
      setFiles(files.filter((file) => !file.isTrashed));
      
      // Reset trash count
      setTrashCount(0);

      // Show toast
      addToast({
        title: "Trash Emptied",
        description: `All items have been permanently deleted`,
        color: "success",
      });

      // Close modal
      setEmptyTrashModalOpen(false);
      
      // Trigger storage update
      triggerStorageUpdate();
    } catch (error) {
      console.error("Error emptying trash:", error);
      addToast({
        title: "Action Failed",
        description: "We couldn't empty the trash. Please try again later.",
        color: "danger",
      });
    }
  };

  // Add this function to handle file downloads
  const handleDownloadFile = async (file: FileType) => {
    try {
      // Show loading toast
      const loadingToastId = addToast({
        title: "Preparing Download",
        description: `Getting "${file.name}" ready for download...`,
        color: "primary",
      });

      // For images, we can use the ImageKit URL directly with optimized settings
      if (file.type.startsWith("image/")) {
        // Create a download-optimized URL with ImageKit
        // Using high quality and original dimensions for downloads
        const downloadUrl = `${process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}/tr:q-100,orig-true/${file.path}`;

        // Fetch the image first to ensure it's available
        const response = await fetch(downloadUrl);
        if (!response.ok) {
          throw new Error(`Failed to download image: ${response.statusText}`);
        }

        // Get the blob data
        const blob = await response.blob();

        // Create a download link
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = file.name;
        document.body.appendChild(link);

        // Remove loading toast and show success toast
        addToast({
          title: "Download Ready",
          description: `"${file.name}" is ready to download.`,
          color: "success",
        });

        // Trigger download
        link.click();

        // Clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      } else {
        // For other file types, use the fileUrl directly
        const response = await fetch(file.fileUrl);
        if (!response.ok) {
          throw new Error(`Failed to download file: ${response.statusText}`);
        }

        // Get the blob data
        const blob = await response.blob();

        // Create a download link
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = file.name;
        document.body.appendChild(link);

        // Remove loading toast and show success toast
        addToast({
          title: "Download Ready",
          description: `"${file.name}" is ready to download.`,
          color: "success",
        });

        // Trigger download
        link.click();

        // Clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      addToast({
        title: "Download Failed",
        description: "We couldn't download the file. Please try again later.",
        color: "danger",
      });
    }
  };

  // Function to open image in a new tab with optimized view
  const openImageViewer = (file: FileType) => {
    if (file.type.startsWith("image/")) {
      // Create an optimized URL with ImageKit transformations for viewing
      // Using higher quality and responsive sizing for better viewing experience
      const optimizedUrl = `${process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}/tr:q-90,w-1600,h-1200,fo-auto/${file.path}`;
      window.open(optimizedUrl, "_blank");
    }
  };

  // Navigate to a folder
  const navigateToFolder = (folderId: string, folderName: string) => {
    console.log('Navigating to folder:', folderId, folderName); // Debug log
    
    setCurrentFolder(folderId);
    setFolderPath([...folderPath, { id: folderId, name: folderName }]);

    // Notify parent component about folder change
    if (onFolderChange) {
      onFolderChange(folderId);
    }
  };

  // Navigate back to parent folder
  const navigateUp = () => {
    if (folderPath.length > 0) {
      const newPath = [...folderPath];
      newPath.pop();
      setFolderPath(newPath);
      
      const newFolderId = newPath.length > 0 ? newPath[newPath.length - 1].id : null;
      console.log('Navigating up to folder:', newFolderId); // Debug log
      
      setCurrentFolder(newFolderId);

      // Notify parent component about folder change
      if (onFolderChange) {
        onFolderChange(newFolderId);
      }
    }
  };

  // Navigate to specific folder in path
  const navigateToPathFolder = (index: number) => {
    if (index < 0) {
      console.log('Navigating to root folder'); // Debug log
      
      setCurrentFolder(null);
      setFolderPath([]);

      // Notify parent component about folder change
      if (onFolderChange) {
        onFolderChange(null);
      }
    } else {
      const newPath = folderPath.slice(0, index + 1);
      setFolderPath(newPath);
      
      const newFolderId = newPath[newPath.length - 1].id;
      console.log('Navigating to path folder:', newFolderId); // Debug log
      
      setCurrentFolder(newFolderId);

      // Notify parent component about folder change
      if (onFolderChange) {
        onFolderChange(newFolderId);
      }
    }
  };

  // Handle file or folder click
  const handleItemClick = (file: FileType) => {
    if (file.isFolder) {
      navigateToFolder(file.id, file.name);
    } else if (file.type.startsWith("image/")) {
      openImageViewer(file);
    }
  };

  const handleUploadSuccess = async () => {
    try {
      // Fetch the latest files from the server
      const response = await axios.get('/api/files', {
        params: {
          folderId: currentFolder || null,
          view: currentView
        }
      });
      
      // If we're in the trash view, we need to preserve trashed files
      if (currentView === 'trash') {
        // Keep the existing trashed files and don't update the state
        return;
      } else {
        // For other views, update with the new files from the server
        setFiles(response.data);
      }
      
      // Trigger storage update
      triggerStorageUpdate();
    } catch (error) {
      console.error('Error refreshing files after upload:', error);
      addToast({
        title: 'Refresh Failed',
        description: 'Unable to refresh file list. Please reload the page.',
        color: 'danger',
      });
    }
  };

  if (loading) {
    return <FileLoadingState />;
  }

  return (
    <div className="space-y-6">
      {/* Tabs for filtering files */}
      <FileTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        allFilesCount={allFilesCount}
        starredCount={starredCount}
        trashCount={trashCount}
      />

      {/* Folder navigation - only show in "all" view */}
      {activeTab === "all" && (
        <FolderNavigation
          folderPath={folderPath}
          navigateUp={navigateUp}
          navigateToPathFolder={navigateToPathFolder}
        />
      )}

      {/* Action buttons */}
      <FileActionButtons
        activeTab={activeTab}
        trashCount={trashCount}
        folderPath={folderPath}
        onRefresh={fetchFiles}
        onEmptyTrash={() => setEmptyTrashModalOpen(true)}
      />

      <Divider className="my-4" />

      {/* Files table */}
      {filteredFiles.length === 0 ? (
        <FileEmptyState activeTab={activeTab} />
      ) : (
        <Card
          shadow="sm"
          className="border border-default-200 bg-default-50 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <Table
              aria-label="Files table"
              isStriped
              color="default"
              selectionMode="none"
              classNames={{
                base: "min-w-full",
                th: "bg-default-100 text-default-800 font-medium text-sm",
                td: "py-4",
                tr: "rounded-md overflow-hidden", // Add rounded corners to rows
              }}
            >
              <TableHeader>
                <TableColumn className="w-[40%]">Name</TableColumn>
                <TableColumn className="hidden sm:table-cell w-[15%]">Type</TableColumn>
                <TableColumn className="hidden md:table-cell w-[10%]">Size</TableColumn>
                <TableColumn className="hidden sm:table-cell w-[20%]">
                  Added
                </TableColumn>
                <TableColumn className="w-[15%]">Actions</TableColumn>
              </TableHeader>
              <TableBody>
                {filteredFiles.map((file) => (
                  <TableRow
                    key={file.id}
                    className={`hover:bg-default-100 transition-colors rounded-md ${
                      file.isFolder || file.type.startsWith("image/")
                        ? "cursor-pointer"
                        : ""
                    }`}
                    onClick={() => handleItemClick(file)}
                  >
                    <TableCell className="first:rounded-l-md last:rounded-r-md">
                      <div className="flex items-center gap-3">
                        <FileIcon file={file} />
                        <div>
                          <div className="font-medium flex items-center gap-2 text-default-800">
                            <span className="truncate max-w-[80px] sm:max-w-[200px] md:max-w-[300px]">
                              {file.name}
                            </span>
                            {file.isStarred && (
                              <Tooltip content="Starred">
                                <Star
                                  className="h-4 w-4 text-yellow-400"
                                  fill="currentColor"
                                />
                              </Tooltip>
                            )}
                            {file.isFolder && (
                              <Tooltip content="Folder">
                                <Folder className="h-3 w-3 text-default-400" />
                              </Tooltip>
                            )}
                            {file.type.startsWith("image/") && (
                              <Tooltip content="Click to view image">
                                <ExternalLink className="h-3 w-3 text-default-400" />
                              </Tooltip>
                            )}
                          </div>
                          <div className="text-xs text-default-500 sm:hidden">
                            {formatDistanceToNow(new Date(file.createdAt), {
                              addSuffix: true,
                            })}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="text-xs text-default-500">
                        {file.isFolder ? "Folder" : file.type}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="text-default-700">
                        {file.isFolder
                          ? "-"
                          : file.size < 1024
                            ? `${file.size} B`
                            : file.size < 1024 * 1024
                              ? `${(file.size / 1024).toFixed(1)} KB`
                              : `${(file.size / (1024 * 1024)).toFixed(1)} MB`}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div>
                        <div className="text-default-700">
                          {formatDistanceToNow(new Date(file.createdAt), {
                            addSuffix: true,
                          })}
                        </div>
                        <div className="text-xs text-default-500 mt-1">
                          {format(new Date(file.createdAt), "MMMM d, yyyy")}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()} className="last:rounded-r-md">
                      <FileActions
                        file={file}
                        onStar={handleStarFile}
                        onTrash={handleTrashFile}
                        onDelete={(file) => {
                          setSelectedFile(file);
                          setDeleteModalOpen(true);
                        }}
                        onDownload={handleDownloadFile}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Delete confirmation modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Confirm Permanent Deletion"
        description={`Are you sure you want to permanently delete this ${selectedFile?.isFolder ? 'folder' : 'file'}?`}
        icon={X}
        iconColor="text-danger"
        confirmText="Delete Permanently"
        confirmColor="danger"
        onConfirm={handleDeleteFile}
        isDangerous={true}
        warningMessage={`You are about to permanently delete "${selectedFile?.name}". This ${selectedFile?.isFolder ? 'folder and all its contents' : 'file'} will be permanently removed from your account and cannot be recovered.`}
      />

      {/* Empty trash confirmation modal */}
      <ConfirmationModal
        isOpen={emptyTrashModalOpen}
        onOpenChange={setEmptyTrashModalOpen}
        title="Empty Trash"
        description={`Are you sure you want to empty the trash?`}
        icon={Trash}
        iconColor="text-danger"
        confirmText="Empty Trash"
        confirmColor="danger"
        onConfirm={handleEmptyTrash}
        isDangerous={true}
        warningMessage={`You are about to permanently delete ${trashCount} ${
          trashCount === 1 ? "item" : "items"
        } in your trash. ${
          trashCount === 1 ? "This file" : "These files"
        } will be permanently removed from your account and cannot be recovered.`}
      />
    </div>
  );
}

