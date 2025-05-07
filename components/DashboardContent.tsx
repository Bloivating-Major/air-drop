"use client";

import { useState, useCallback, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Tabs, Tab } from "@heroui/tabs";
import { FileUp, FileText, User, FolderOpen } from "lucide-react";
import FileUploadForm from "@/components/FileUploadForm";
import FileList from "@/components/FileList";
import UserProfile from "@/components/UserProfile";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface DashboardContentProps {
  userId: string;
  userName: string;
}

export default function DashboardContent({
  userId,
  userName,
}: DashboardContentProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<string>("files");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);

  // Set the active tab based on URL parameter
  useEffect(() => {
    if (tabParam === "profile") {
      setActiveTab("profile");
    } else {
      setActiveTab("files");
    }
  }, [tabParam]);

  const handleFileUploadSuccess = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const handleFolderChange = useCallback((folderId: string | null) => {
    setCurrentFolder(folderId);
  }, []);

  return (
    <>
      <div className="mb-10">
        <h2 className="text-4xl font-bold text-white">
          Welcome back, <span className="text-primary">{userName?.split(" ")[0] || "there"}</span>
        </h2>
        <p className="text-gray-400 mt-2 text-lg">
          Your secure cloud storage dashboard
        </p>
      </div>

      <Tabs
        aria-label="Dashboard Tabs"
        color="primary"
        variant="light"
        selectedKey={activeTab}
        onSelectionChange={(key) => setActiveTab(key as string)}
        classNames={{
          tabList: "gap-6 border-b border-gray-800 mb-8",
          tab: "py-3 text-gray-400 data-[selected=true]:text-primary",
          cursor: "bg-primary",
        }}
      >
        <Tab
          key="files"
          title={
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5" />
              <span className="font-medium">My Files</span>
            </div>
          }
        >
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <Card className="bg-gray-900 border-none shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex gap-3 border-b border-gray-800 pb-4">
                  <FileUp className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold text-white">Upload Files</h2>
                </CardHeader>
                <CardBody>
                  <FileUploadForm
                    userId={userId}
                    onUploadSuccess={handleFileUploadSuccess}
                    currentFolder={currentFolder}
                  />
                </CardBody>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card className="bg-gray-900 border-none shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex justify-between items-center border-b border-gray-800 pb-4">
                  <div className="flex gap-3">
                    <FolderOpen className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold text-white">Your Files</h2>
                  </div>
                </CardHeader>
                <CardBody>
                  <FileList
                    userId={userId}
                    refreshTrigger={refreshTrigger}
                    onFolderChange={handleFolderChange}
                  />
                </CardBody>
              </Card>
            </div>
          </div>
        </Tab>

        <Tab
          key="profile"
          title={
            <div className="flex items-center gap-3">
              <User className="h-5 w-5" />
              <span className="font-medium">Profile</span>
            </div>
          }
        >
          <div className="mt-8">
            <Card className="bg-gray-900 border-none shadow-lg">
              <CardBody className="p-6">
                <UserProfile />
              </CardBody>
            </Card>
          </div>
        </Tab>
      </Tabs>
    </>
  );
}
