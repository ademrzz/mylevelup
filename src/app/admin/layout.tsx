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
          border: "1px solid rgba(168, 85, 247, 0.3)",
          background: "linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(0,0,0,0.4) 100%)",
          marginBottom: "2.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div 
            style={{ 
              width: "42px", 
              height: "42px", 
              borderRadius: "0.75rem", 
              background: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              color: "white", 
              fontSize: "1.25rem",
              boxShadow: "0 4px 14px rgba(168, 85, 247, 0.35)"
            }}
          >
            🛡️
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "white", margin: 0 }}>
                Level Up DZ — Administration
              </h2>
              <span 
                style={{ 
                  fontSize: "0.7rem", 
                  fontWeight: 700, 
                  padding: "0.15rem 0.5rem", 
                  borderRadius: "9999px",
                  background: "rgba(168, 85, 247, 0.2)",
                  color: "#c084fc",
                  border: "1px solid rgba(168, 85, 247, 0.4)"
                }}
              >
                SUPER ADMIN
              </span>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", margin: 0 }}>
              Connecté en tant que <strong>{session.user.name}</strong> ({session.user.email})
            </p>
          </div>
        </div>

        {/* Quick Nav Links */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
          <Link 
            href="/admin" 
            className="btn btn-outline"
            style={{ 
              fontSize: "0.85rem", 
              padding: "0.45rem 0.9rem",
              borderColor: "rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem"
            }}
          >
            📊 Vue Générale
          </Link>
          <Link 
            href="/admin/users" 
            className="btn btn-outline"
            style={{ 
              fontSize: "0.85rem", 
              padding: "0.45rem 0.9rem",
              borderColor: "rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem"
            }}
          >
            👥 Utilisateurs & Rôles
          </Link>
          <Link 
            href="/admin/courses" 
            className="btn btn-outline"
            style={{ 
              fontSize: "0.85rem", 
              padding: "0.45rem 0.9rem",
              borderColor: "rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem"
            }}
          >
            📚 Modération Cours
          </Link>
          <Link 
            href="/admin/finance" 
            className="btn btn-outline"
            style={{ 
              fontSize: "0.85rem", 
              padding: "0.45rem 0.9rem",
              borderColor: "rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem"
            }}
          >
            💰 Finances & Commissions
          </Link>
          <Link 
            href="/instructor" 
            className="btn btn-secondary"
            style={{ 
              fontSize: "0.85rem", 
              padding: "0.45rem 0.9rem",
              color: "var(--brand-orange)",
              borderColor: "rgba(254,145,0,0.3)"
            }}
          >
            Studio Enseignant →
          </Link>
        </div>
      </div>

      {children}
    </div>
  );
}
