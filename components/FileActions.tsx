"use client";

import { Star, Trash, X, ArrowUpFromLine, Download } from "lucide-react";
import { Button, Tooltip } from "@heroui/react";

interface FileActionsProps {
  file: FileType;
  onStar: (id: string) => void;
  onTrash: (id: string) => void;
  onDelete: (file: FileType) => void;
  onDownload: (file: FileType) => void;
}

export default function FileActions({
  file,
  onStar,
  onTrash,
  onDelete,
  onDownload,
}: FileActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1">
      {/* Star button */}
      <Tooltip content={file.isStarred ? "Remove from starred" : "Add to starred"}>
        <Button
          isIconOnly
          variant="flat"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onStar(file.id);
          }}
          className="min-w-0 w-9 h-9"
          color={file.isStarred ? "warning" : "default"}
        >
          <Star
            className={`h-4 w-4 ${file.isStarred ? "fill-warning" : ""}`}
          />
        </Button>
      </Tooltip>

      {/* Download button (only for files, not folders) */}
      {!file.isFolder && (
        <Tooltip content="Download file">
          <Button
            isIconOnly
            variant="flat"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDownload(file);
            }}
            className="min-w-0 w-9 h-9"
          >
            <Download className="h-4 w-4" />
          </Button>
        </Tooltip>
      )}

      {/* Trash/Restore button */}
      <Tooltip content={file.isTrashed ? "Restore from trash" : "Move to trash"}>
        <Button
          isIconOnly
          variant="flat"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onTrash(file.id);
          }}
          className="min-w-0 w-9 h-9"
          color={file.isTrashed ? "success" : "default"}
        >
          {file.isTrashed ? (
            <ArrowUpFromLine className="h-4 w-4" />
          ) : (
            <Trash className="h-4 w-4" />
          )}
        </Button>
      </Tooltip>

      {/* Delete permanently button */}
      {file.isTrashed && (
        <Tooltip content="Delete permanently">
          <Button
            isIconOnly
            variant="flat"
            size="sm"
            color="danger"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(file);
            }}
            className="min-w-0 w-9 h-9"
          >
            <X className="h-4 w-4" />
          </Button>
        </Tooltip>
      )}
    </div>
  );
}
