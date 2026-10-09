import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user as any)?.role;

  // Strict role check: only ADMIN can enter
  if (role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="container" style={{ minHeight: "calc(100vh - 120px)", padding: "2.5rem 1rem" }}>
      {/* Admin Top Navigation Banner */}
      <div 
        className="glass"
        style={{
          padding: "1.25rem 1.75rem",
          borderRadius: "1rem",
          border: "1px solid rgba(168, 85, 247, 0.25)",
          background: "linear-gradient(135deg, rgba(168, 85, 247, 0.06) 0%, rgba(18, 18, 20, 0.6) 100%)",
          marginBottom: "2.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1.25rem"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div 
            style={{ 
              width: "44px", 
              height: "44px", 
              borderRadius: "0.75rem", 
              background: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              color: "white",
              boxShadow: "0 4px 14px rgba(168, 85, 247, 0.25)",
              flexShrink: 0
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <h1 style={{ fontSize: "1.15rem", fontWeight: 700, color: "white", margin: 0 }}>
                Espace Administration
              </h1>
              <span 
                style={{ 
                  fontSize: "0.68rem", 
                  fontWeight: 700, 
                  letterSpacing: "0.06em",
                  padding: "0.15rem 0.55rem", 
                  borderRadius: "9999px",
                  background: "rgba(168, 85, 247, 0.15)",
                  color: "#c084fc",
                  border: "1px solid rgba(168, 85, 247, 0.35)",
                  textTransform: "uppercase"
                }}
              >
                Super Admin
              </span>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", margin: "0.2rem 0 0 0" }}>
              Connecté en tant que <strong>{session.user.name}</strong> ({session.user.email})
            </p>
          </div>
        </div>

        {/* Quick Nav Links with Vector Icons */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
          <Link 
            href="/admin" 
            className="btn btn-outline"
            style={{ 
              fontSize: "0.84rem", 
              padding: "0.45rem 0.85rem",
              borderColor: "rgba(255,255,255,0.12)",
              display: "flex",
              alignItems: "center",
              gap: "0.45rem",
              borderRadius: "0.5rem"
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            <span>Vue générale</span>
          </Link>

          <Link 
            href="/admin/users" 
            className="btn btn-outline"
            style={{ 
              fontSize: "0.84rem", 
              padding: "0.45rem 0.85rem",
              borderColor: "rgba(255,255,255,0.12)",
              display: "flex",
              alignItems: "center",
              gap: "0.45rem",
              borderRadius: "0.5rem"
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>Utilisateurs & Rôles</span>
          </Link>

          <Link 
            href="/admin/courses" 
            className="btn btn-outline"
            style={{ 
              fontSize: "0.84rem", 
              padding: "0.45rem 0.85rem",
              borderColor: "rgba(255,255,255,0.12)",
              display: "flex",
              alignItems: "center",
              gap: "0.45rem",
              borderRadius: "0.5rem"
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <span>Modération cours</span>
          </Link>

          <Link 
            href="/admin/finance" 
            className="btn btn-outline"
            style={{ 
              fontSize: "0.84rem", 
              padding: "0.45rem 0.85rem",
              borderColor: "rgba(255,255,255,0.12)",
              display: "flex",
              alignItems: "center",
              gap: "0.45rem",
              borderRadius: "0.5rem"
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
            <span>Finances & Retraits</span>
          </Link>

          <Link 
            href="/instructor" 
            className="btn btn-secondary"
            style={{ 
              fontSize: "0.84rem", 
              padding: "0.45rem 0.85rem",
              color: "var(--brand-orange)",
              borderColor: "rgba(254,145,0,0.3)",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              borderRadius: "0.5rem"
            }}
          >
            <span>Studio Formateur</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>
      </div>

      {children}
    </div>
  );
}
