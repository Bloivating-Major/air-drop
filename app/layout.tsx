import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "./providers";
import { fontSans } from "@/config/fonts";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Air Drop",
  description: "Secure cloud storage for your images, powered by ImageKit",
  icons: [
    {
      url: "/airdroplogo.svg",
      sizes: "42x42",
      type: "image/svg+xml",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className={`font-sans ${fontSans.variable} antialiased bg-background text-foreground`}>
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}


