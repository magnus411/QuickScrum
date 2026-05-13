"use server";
import Sidebar from "@/app/components/Sidebar";
import { requireAuth } from "@/app/lib/auth";
import { seedDatabase } from "@/app/lib/seed";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAuth();
  await seedDatabase();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
