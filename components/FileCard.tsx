"use client";

import { Card, CardBody, CardFooter } from "@heroui/card";
import { Star, Folder, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { File as FileType } from "@/lib/db/schema";
import FileIcon from "@/components/FileIcon";
import FileActions from "@/components/FileActions";

interface FileCardProps {
  file: FileType;
  onItemClick: (file: FileType) => void;
  onStar: (fileId: string) => void;
  onTrash: (fileId: string) => void;
  onDelete: (file: FileType) => void;
  onDownload: (file: FileType) => void;
}

export default function FileCard({
  file,
  onItemClick,
  onStar,
  onTrash,
  onDelete,
  onDownload,
}: FileCardProps) {
  return (
    <Card
      isPressable
      onPress={() => onItemClick(file)}
      className="border border-default-200 bg-default-50 overflow-hidden h-full"
    >
      <CardBody className="p-3 flex flex-col items-center">
        <div className="h-16 w-16 flex items-center justify-center mb-2">
          <FileIcon file={file} size="mobile" />
        </div>
        <div className="w-full text-center">
          <div className="font-medium flex items-center justify-center gap-1 text-default-800">
            <span className="truncate max-w-[120px]">
              {file.name}
            </span>
            {file.isStarred && (
              <Star
                className="h-3 w-3 text-yellow-400 flex-shrink-0"
                fill="currentColor"
              />
            )}
          </div>
          <div className="text-xs text-default-500 mt-1">
            {file.isFolder
              ? "Folder"
              : file.size < 1024
                ? `${file.size} B`
                : file.size < 1024 * 1024
                  ? `${(file.size / 1024).toFixed(1)} KB`
                  : `${(file.size / (1024 * 1024)).toFixed(1)} MB`}
          </div>
          <div className="text-xs text-default-400 mt-1">
            {formatDistanceToNow(new Date(file.createdAt), {
              addSuffix: true,
            })}
          </div>
        </div>
      </CardBody>
      <CardFooter 
        className="p-2 pt-2 flex justify-center border-t border-default-200"
        onClick={(e) => e.stopPropagation()}
      >
        <FileActions
          file={file}
          onStar={onStar}
          onTrash={onTrash}
          onDelete={onDelete}
          onDownload={onDownload}
          isMobile={true}
        />
      </CardFooter>
    </Card>
  );
}