"use client";

import { ArrowUpFromLine } from "lucide-react";
import { Button } from "@heroui/button";

interface FolderNavigationProps {
  folderPath: Array<{ id: string; name: string }>;
  navigateUp: () => void;
  navigateToPathFolder: (index: number) => void;
}

export default function FolderNavigation({
  folderPath,
  navigateUp,
  navigateToPathFolder,
}: FolderNavigationProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm overflow-x-auto pb-2">
      <Button
        variant="flat"
        size="sm"
        isIconOnly
        onClick={navigateUp}
        isDisabled={folderPath.length === 0}
      >
        <ArrowUpFromLine className="h-4 w-4" />
      </Button>
      <Button
        variant="flat"
        size="sm"
        onClick={() => navigateToPathFolder(-1)}
        className={folderPath.length === 0 ? "font-bold" : ""}
      >
        Home
      </Button>
      {folderPath.map((folder, index) => (
        <div key={folder.id} className="flex items-center">
          <span className="mx-1 text-default-400">/</span>
          <Button
            variant="flat"
            size="sm"
            onClick={() => navigateToPathFolder(index)}
            className={`${index === folderPath.length - 1 ? "font-bold" : ""} text-ellipsis overflow-hidden max-w-[150px]`}
            title={folder.name}
          >
            {folder.name}
          </Button>
        </div>
      ))}
    </div>
  );
}
