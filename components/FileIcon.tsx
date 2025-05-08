"use client";

import { Folder, FileText } from "lucide-react";
import { IKImage } from "imagekitio-next";
import type { File as FileType } from "@/lib/db/schema";

interface FileIconProps {
  file: FileType;
  size?: "default" | "mobile";
}

export default function FileIcon({ file, size = "default" }: FileIconProps) {
  // Determine icon sizes based on viewport
  const iconSize = size === "mobile" ? "h-6 w-6" : "h-5 w-5";
  const imageSize = size === "mobile" ? "h-14 w-14" : "h-12 w-12";
  
  if (file.isFolder) return <Folder className={`${iconSize} text-blue-500`} />;

  const fileType = file.type.split("/")[0];
  switch (fileType) {
    case "image":
      return (
        <div className={`${imageSize} relative overflow-hidden rounded`}>
          <IKImage
            path={file.path}
            transformation={[
              {
                height: size === "mobile" ? 56 : 48,
                width: size === "mobile" ? 56 : 48,
                focus: "auto",
                quality: 80,
                dpr: 2,
              },
            ]}
            loading="lazy"
            lqip={{ active: true }}
            alt={file.name}
            style={{ objectFit: "cover", height: "100%", width: "100%" }}
          />
        </div>
      );
    case "application":
      if (file.type.includes("pdf")) {
        return <FileText className={`${iconSize} text-red-500`} />;
      }
      return <FileText className={`${iconSize} text-orange-500`} />;
    case "video":
      return <FileText className={`${iconSize} text-purple-500`} />;
    default:
      return <FileText className={`${iconSize} text-gray-500`} />;
  }
}
