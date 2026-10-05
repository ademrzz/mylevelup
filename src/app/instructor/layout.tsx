import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/instructor");
  }

  const userRole = (session.user as any).role;
  if (userRole !== "INSTRUCTOR" && userRole !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div style={{ minHeight: "calc(100vh - 80px)", display: "flex", flexDirection: "column" }}>
      {/* Instructor Studio Sub-Nav */}
      <div 
        className="glass" 
        style={{ 
          borderBottom: "1px solid var(--border)", 
          padding: "0.75rem 0",
          position: "sticky",
          top: "65px",
          zIndex: 35
        }}
      >
        <div className="container flex items-center justify-between" style={{ flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span 
              style={{ 
                fontSize: "0.8rem", 
                fontWeight: 700, 
                background: "var(--gradient-orange)", 
                color: "white", 
                padding: "0.2rem 0.6rem", 
                borderRadius: "0.3rem",
                letterSpacing: "0.05em"
              }}
            >
              STUDIO
            </span>
            <Link href="/instructor" style={{ fontWeight: 700, fontSize: "1.1rem", color: "white" }}>
              Espace Enseignant
            </Link>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", fontSize: "0.9rem" }}>
            <Link href="/instructor" style={{ color: "var(--foreground)", fontWeight: 500 }}>
              Mes Formations
            </Link>
            <Link href="/instructor/payouts" style={{ color: "var(--brand-orange)", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.3rem" }}>
              💰 Mes Retraits CCP
            </Link>
            <Link 
              href="/instructor/courses/new" 
              className="btn btn-primary"
              style={{ 
                padding: "0.45rem 1rem", 
                fontSize: "0.85rem",
                background: "var(--gradient-orange)",
                boxShadow: "0 4px 14px rgba(254,145,0,0.3)"
              }}
            >
              + Nouveau Cours
            </Link>
          </div>
        </div>
      </div>

      {/* Main Studio Viewport */}
      <main className="container" style={{ flex: 1, padding: "2.5rem 1.5rem 6rem 1.5rem" }}>
        {children}
      </main>
    </div>
  );
}
