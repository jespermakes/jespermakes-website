import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";

export const metadata = {
  title: "Admin · Jesper Makes",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
    redirect("/login?callbackUrl=/admin");
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-7xl mx-auto flex">
        <AdminSidebar />
        <main className="flex-1 px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
