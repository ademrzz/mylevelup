import { DashboardSidebar } from "@/components/DashboardSidebar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />
      <div className="dashboard-content">
        {children}
      </div>
    </div>
  );
}
