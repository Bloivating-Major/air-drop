"use client";

import { Star, Trash, Download, ArrowUpFromLine, X } from "lucide-react";
import { Button } from "@heroui/button";
import { Tooltip } from "@heroui/tooltip";
import type { File as FileType } from "@/lib/db/schema";

interface FileActionsProps {
  file: FileType;
  onStar: (fileId: string) => void;
  onTrash: (fileId: string) => void;
  onDelete: (file: FileType) => void;
  onDownload: (file: FileType) => void;
  isMobile?: boolean;
}

export default function FileActions({
  file,
  onStar,
  onTrash,
  onDelete,
  onDownload,
  isMobile = false,
}: FileActionsProps) {
  // Adjust button sizes for mobile
  const buttonSize = isMobile ? "md" : "sm";
  const buttonClass = isMobile 
    ? "min-w-0 w-10 h-10" 
    : "min-w-0 w-9 h-9";
  const iconSize = isMobile ? "h-5 w-5" : "h-4 w-4";

  return (
    <div className="flex items-center justify-end gap-1">
      {/* Star button */}
      <Tooltip content={file.isStarred ? "Remove from starred" : "Add to starred"}>
        <Button
          isIconOnly
          variant="flat"
          size={buttonSize}
          onClick={(e) => {
            e.stopPropagation();
            onStar(file.id);
          }}
          className={buttonClass}
          color={file.isStarred ? "warning" : "default"}
        >
          <Star
            className={`${iconSize} ${file.isStarred ? "fill-warning" : ""}`}
          />
        </Button>
      </Tooltip>

      {/* Download button (only for files, not folders) */}
      {!file.isFolder && (
        <Tooltip content="Download file">
          <Button
            isIconOnly
            variant="flat"
            size={buttonSize}
            onClick={(e) => {
              e.stopPropagation();
              onDownload(file);
            }}
            className={buttonClass}
          >
            <Download className={iconSize} />
          </Button>
        </Tooltip>
      )}

      {/* Trash/Restore button */}
      <Tooltip content={file.isTrashed ? "Restore from trash" : "Move to trash"}>
        <Button
          isIconOnly
          variant="flat"
          size={buttonSize}
          onClick={(e) => {
            e.stopPropagation();
            onTrash(file.id);
          }}
          className={buttonClass}
          color={file.isTrashed ? "success" : "default"}
        >
          {file.isTrashed ? (
            <ArrowUpFromLine className={iconSize} />
          ) : (
            <Trash className={iconSize} />
          )}
        </Button>
      </Tooltip>

      {/* Delete permanently button */}
      {file.isTrashed && (
        <Tooltip content="Delete permanently">
          <Button
            isIconOnly
            variant="flat"
            size={buttonSize}
            color="danger"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(file);
            }}
            className={buttonClass}
          >
            <X className={iconSize} />
          </Button>
        </Tooltip>
      )}
    </div>
  );
}
