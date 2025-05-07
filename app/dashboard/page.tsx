import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardContent from "@/components/DashboardContent";
import Navbar from "@/components/Navbar";
import Image from "next/image";

// Add this function to extract name from email
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

export default async function Dashboard() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) {
    redirect("/sign-in");
  }

  // Serialize the user data to avoid passing the Clerk User object directly
  const serializedUser = user
    ? {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        username: user.username,
        emailAddress: user.emailAddresses?.[0]?.emailAddress,
      }
    : null;

  // Get display name using the same logic as other components
  const displayName = user?.firstName || 
                     user?.username || 
                     (user?.emailAddresses?.[0]?.emailAddress ? 
                      extractNameFromEmail(user.emailAddresses[0].emailAddress) : 
                      "");

  return (
    <div className="min-h-screen flex flex-col bg-gray-950">
      <Navbar user={serializedUser} />

      <main className="flex-1 container mx-auto py-10 px-6">
        <DashboardContent
          userId={userId}
          userName={displayName}
        />
      </main>

      <footer className="bg-gray-900 border-t border-gray-800 py-6">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Image 
                src="/airdroplogo.svg" 
                alt="Air Drop Logo" 
                width={42}
                height={42}
                className="h-10 w-10"
              />
              <h2 className="text-lg font-bold text-white">Air Drop</h2>
            </div>
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} Air Drop
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
