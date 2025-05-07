"use client";

import { File } from "lucide-react";
import { Card, CardBody } from "@heroui/card";

interface FileEmptyStateProps {
  activeTab: string;
}

export default function FileEmptyState({ activeTab }: FileEmptyStateProps) {
  return (
    <Card className="border border-default-200 bg-default-50">
      <CardBody className="text-center py-16">
        <File className="h-16 w-16 mx-auto text-primary/50 mb-6" />
        <h3 className="text-xl font-medium mb-2">
          {activeTab === "all" && "No files available"}
          {activeTab === "starred" && "No starred files"}
          {activeTab === "trash" && "Trash is empty"}
        </h3>
        <p className="text-default-500 mt-2 max-w-md mx-auto">
          {activeTab === "all" &&
            "Upload your first file to get started with your personal cloud storage"}
          {activeTab === "starred" &&
            "Mark important files with a star to find them quickly when you need them"}
          {activeTab === "trash" &&
            "Files you delete will appear here for 30 days before being permanently removed"}
        </p>
      </CardBody>
    </Card>
  );
}
