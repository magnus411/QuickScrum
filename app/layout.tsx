import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QuickScrum - Team Workspace",
  description: "Internal Scrum tool for the team",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
