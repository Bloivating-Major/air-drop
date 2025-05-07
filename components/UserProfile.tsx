"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Spinner } from "@heroui/spinner";
import { Avatar } from "@heroui/avatar";
import { Divider } from "@heroui/divider";
import Badge from "@/components/ui/Badge";
import { useRouter } from "next/navigation";
import { Mail, User, LogOut, Shield, ArrowRight, CloudUpload } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";

interface StorageInfo {
  used: number;
  total: number;
  percentage: number;
}

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function extractNameFromEmail(email: string): string {
  if (!email) return "User";
  
  // Get the part before the @ symbol
  const emailPrefix = email.split('@')[0];
  
  // Try to extract a name by removing numbers and special characters
  const possibleName = emailPrefix
    .replace(/[0-9_.-]/g, ' ')  // Replace numbers and common separators with spaces
    .replace(/\s+/g, ' ')       // Replace multiple spaces with a single space
    .trim();
  
  if (possibleName) {
    // Get just the first word and capitalize it
    const firstWord = possibleName.split(' ')[0];
    return firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
  }
  
  // If we couldn't extract a name, just return the email prefix
  return emailPrefix;
}

export default function UserProfile() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const [storageInfo, setStorageInfo] = useState<StorageInfo>({
    used: 0,
    total: 1024 * 1024 * 1024, // 1 GB default
    percentage: 0
  });
  const [isLoadingStorage, setIsLoadingStorage] = useState(true);

  // Function to fetch storage info
  const fetchStorageInfo = useCallback(async () => {
    if (!isSignedIn) return;
    
    setIsLoadingStorage(true);
    try {
      const response = await axios.get('/api/user/storage');
      setStorageInfo(response.data);
    } catch (error) {
      console.error("Failed to fetch storage info:", error);
    } finally {
      setIsLoadingStorage(false);
    }
  }, [isSignedIn]);

  // Fetch storage info on initial load
  useEffect(() => {
    fetchStorageInfo();
  }, [fetchStorageInfo]);

  // Set up event listener for storage updates
  useEffect(() => {
    // Create a custom event listener for storage updates
    const handleStorageUpdate = () => {
      fetchStorageInfo();
    };

    // Add event listener
    window.addEventListener('storage-updated', handleStorageUpdate);

    // Clean up
    return () => {
      window.removeEventListener('storage-updated', handleStorageUpdate);
    };
  }, [fetchStorageInfo]);

  if (!isLoaded) {
    return (
      <div className="flex flex-col justify-center items-center p-12">
        <Spinner size="lg" color="primary" />
        <p className="mt-4 text-default-600">Loading your profile...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <Card className="max-w-md mx-auto border border-default-200 bg-default-50 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex gap-3">
          <User className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold">User Profile</h2>
        </CardHeader>
        <Divider />
        <CardBody className="text-center py-10">
          <div className="mb-6">
            <Avatar name="Guest" size="lg" className="mx-auto mb-4" />
            <p className="text-lg font-medium">Not Signed In</p>
            <p className="text-default-500 mt-2">
              Please sign in to access your profile
            </p>
          </div>
          <Button
            variant="solid"
            color="primary"
            size="lg"
            onClick={() => router.push("/sign-in")}
            className="px-8"
            endContent={<ArrowRight className="h-4 w-4" />}
          >
            Sign In
          </Button>
        </CardBody>
      </Card>
    );
  }

  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  const email = user.primaryEmailAddress?.emailAddress || "";
  const displayName = fullName || user.username || (email ? extractNameFromEmail(email) : "User");
  const initials = fullName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase() || email.charAt(0).toUpperCase() || "U";

  const userRole = user.publicMetadata.role as string | undefined;

  const handleSignOut = () => {
    signOut(() => {
      router.push("/");
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
        <div className="flex flex-col items-center">
          <Avatar
            name={initials}
            src={user.imageUrl}
            className="h-24 w-24 text-lg"
            fallback={<User className="h-10 w-10" />}
          />
          <div className="mt-4 text-center">
            <h3 className="text-xl font-semibold text-white">{displayName}</h3>
            <p className="text-gray-400 text-sm">{email}</p>
          </div>
        </div>
        
        <div className="flex-1 w-full md:w-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 p-5 rounded-lg border border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-medium text-white">Account Security</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Email verification</span>
                  <Badge color="success" variant="flat">Verified</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Account Status</span>
                  <Badge color="success" variant="flat">Active</Badge>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 p-5 rounded-lg border border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <CloudUpload className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-medium text-white">Storage</h3>
              </div>
              <div className="space-y-4">
                {isLoadingStorage ? (
                  <div className="flex justify-center py-2">
                    <Spinner size="sm" color="primary" />
                  </div>
                ) : (
                  <>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-primary h-2.5 rounded-full" 
                        style={{ width: `${storageInfo.percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">{formatBytes(storageInfo.used)} used</span>
                      <span className="text-white">{formatBytes(storageInfo.total)} total</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
        </div>
      </div>
      
      <div className="pt-6 border-t border-gray-800">
        <h3 className="text-lg font-medium text-white mb-4">Account Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Button 
            color="danger" 
            variant="flat"
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
