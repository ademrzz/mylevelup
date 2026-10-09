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
          top: "72px",
          zIndex: 35
        }}
      >
        <div className="container flex items-center justify-between" style={{ flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
            <span 
              style={{ 
                fontSize: "0.72rem", 
                fontWeight: 700, 
                background: "var(--gradient-orange)", 
                color: "white", 
                padding: "0.2rem 0.6rem", 
                borderRadius: "0.35rem",
                letterSpacing: "0.05em",
                textTransform: "uppercase"
              }}
            >
              Studio
            </span>
            <Link href="/instructor" style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--foreground)" }}>
              Espace Formateur
            </Link>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", fontSize: "0.88rem" }}>
            <Link 
              href="/instructor" 
              style={{ 
                color: "var(--foreground)", 
                fontWeight: 500,
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem"
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--brand-orange)" }}>
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              <span>Mes formations</span>
            </Link>

            <Link 
              href="/instructor/payouts" 
              style={{ 
                color: "var(--foreground)", 
                fontWeight: 500, 
                display: "inline-flex", 
                alignItems: "center", 
                gap: "0.4rem" 
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--brand-green)" }}>
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
              <span>Retraits CCP</span>
            </Link>

            <Link 
              href="/instructor/courses/new" 
              className="btn btn-primary"
              style={{ 
                padding: "0.45rem 0.95rem", 
                fontSize: "0.84rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                background: "var(--gradient-orange)",
                boxShadow: "0 4px 14px rgba(254,145,0,0.25)"
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Nouveau cours</span>
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
