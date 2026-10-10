"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import logoLong from "@/logo/logolong.png";
import logoShort from "@/logo/logoshort.png";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const role = (session?.user as any)?.role || "STUDENT";
  const isAdmin = role === "ADMIN";
  const isInstructor = role === "INSTRUCTOR" || isAdmin;

  // Fermer le menu déroulant au clic extérieur ou touche Échap
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsProfileOpen(false);
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Fermer les menus lors d'un changement de route
  useEffect(() => {
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const getUserInitials = (name?: string | null) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const isCoursesActive = pathname.startsWith("/courses");

  return (
    <header className="site-header">
      <div className="site-header-inner">
        {/* =========================================================
            1. GAUCHE : Logo (Aligne a gauche, flex: 1 1 0%)
           ========================================================= */}
        <div className="header-col-left">
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }} aria-label="Level Up DZ Accueil">
            {/* Desktop Brand Logo */}
            <div className="desktop-only" style={{ alignItems: "center" }}>
              <Image 
                src={logoLong} 
                alt="Level Up DZ" 
                height={38}
                width={125}
                style={{ height: "38px", width: "auto", objectFit: "contain" }}
                priority
              />
            </div>
            {/* Mobile Brand Logo */}
            <div className="mobile-only" style={{ alignItems: "center" }}>
              <Image 
                src={logoShort} 
                alt="Level Up DZ" 
                height={32}
                width={32}
                style={{ height: "32px", width: "auto", objectFit: "contain" }}
                priority
              />
            </div>
          </Link>
        </div>

        {/* =========================================================
            2. CENTRE : Catalogue des cours (Centre au milieu, flex: 0 0 auto)
           ========================================================= */}
        <div className="header-col-center">
          <Link 
            href="/courses" 
            className={`header-catalog-pill ${isCoursesActive ? "active" : ""}`}
          >
            <svg 
              width="15" 
              height="15" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              style={{ color: isCoursesActive ? "#fe9100" : "var(--brand-orange)", flexShrink: 0 }}
            >
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
            </svg>
            <span className="desktop-only">Catalogue des cours</span>
            <span className="mobile-only">Catalogue</span>
          </Link>
        </div>

        {/* =========================================================
            3. DROITE : Actions & Profil (Aligne a droite, flex: 1 1 0%)
           ========================================================= */}
        <div className="header-col-right">
          {session ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              {/* Raccourci Studio Formateur (Desktop) */}
              {isInstructor && (
                <Link
                  href="/instructor"
                  className="desktop-only"
                  style={{
                    alignItems: "center",
                    gap: "0.4rem",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    textDecoration: "none",
                    color: "var(--brand-orange)",
                    background: pathname.startsWith("/instructor") 
                      ? "rgba(254, 145, 0, 0.16)" 
                      : "rgba(254, 145, 0, 0.06)",
                    border: "1px solid rgba(254, 145, 0, 0.28)",
                    padding: "0.38rem 0.75rem",
                    borderRadius: "0.5rem",
                    transition: "all 0.15s ease"
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                  <span>Studio</span>
                </Link>
              )}

              {/* Raccourci Espace Administration (Desktop) */}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="desktop-only"
                  style={{
                    alignItems: "center",
                    gap: "0.4rem",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    textDecoration: "none",
                    color: "#c084fc",
                    background: pathname.startsWith("/admin") 
                      ? "rgba(168, 85, 247, 0.18)" 
                      : "rgba(168, 85, 247, 0.08)",
                    border: "1px solid rgba(168, 85, 247, 0.28)",
                    padding: "0.38rem 0.75rem",
                    borderRadius: "0.5rem",
                    transition: "all 0.15s ease"
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span>Admin</span>
                </Link>
              )}

              {/* Lien Mes cours (Desktop) */}
              <Link
                href="/dashboard"
                className="desktop-only"
                style={{
                  alignItems: "center",
                  fontSize: "0.86rem",
                  fontWeight: 500,
                  textDecoration: "none",
                  color: pathname === "/dashboard" ? "white" : "#9ca3af",
                  padding: "0.38rem 0.65rem",
                  borderRadius: "0.5rem",
                  transition: "color 0.15s ease"
                }}
              >
                Mes cours
              </Link>

              {/* Menu Profil Utilisateur */}
              <div ref={dropdownRef} style={{ position: "relative" }}>
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  aria-expanded={isProfileOpen}
                  aria-haspopup="true"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.45rem",
                    background: isProfileOpen ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.03)",
                    border: "1px solid " + (isProfileOpen ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.09)"),
                    padding: "0.22rem 0.55rem 0.22rem 0.25rem",
                    borderRadius: "9999px",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  {/* Avatar */}
                  <div
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      overflow: "hidden",
                      background: "linear-gradient(135deg, var(--brand-orange) 0%, var(--brand-blue) 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      flexShrink: 0
                    }}
                  >
                    {session.user?.image ? (
                      <img 
                        src={session.user.image} 
                        alt={session.user.name || "Avatar"} 
                        style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                      />
                    ) : (
                      getUserInitials(session.user?.name)
                    )}
                  </div>

                  <span
                    className="desktop-only"
                    style={{
                      fontSize: "0.84rem",
                      fontWeight: 600,
                      color: "white",
                      maxWidth: "100px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {session.user?.name || "Compte"}
                  </span>

                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      color: "#9ca3af",
                      transform: isProfileOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease"
                    }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {/* Dropdown Floating Menu */}
                {isProfileOpen && (
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "calc(100% + 8px)",
                      width: "260px",
                      background: "#0c111d",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "0.85rem",
                      boxShadow: "0 18px 40px rgba(0, 0, 0, 0.5)",
                      backdropFilter: "blur(20px)",
                      padding: "0.5rem",
                      zIndex: 120,
                      animation: "fadeIn 0.15s ease-out"
                    }}
                  >
                    {/* User Card */}
                    <div style={{ padding: "0.75rem 0.85rem 0.85rem", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: "0.92rem", color: "white" }}>
                        {session.user?.name || "Utilisateur"}
                      </p>
                      <p style={{ margin: "0.2rem 0 0.5rem", fontSize: "0.78rem", color: "#9ca3af", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {session.user?.email}
                      </p>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          letterSpacing: "0.04em",
                          padding: "0.15rem 0.55rem",
                          borderRadius: "9999px",
                          textTransform: "uppercase",
                          ...(isAdmin
                            ? { background: "rgba(168, 85, 247, 0.15)", color: "#c084fc", border: "1px solid rgba(168, 85, 247, 0.3)" }
                            : isInstructor
                            ? { background: "rgba(254, 145, 0, 0.15)", color: "var(--brand-orange)", border: "1px solid rgba(254, 145, 0, 0.3)" }
                            : { background: "rgba(0, 160, 220, 0.15)", color: "var(--brand-blue)", border: "1px solid rgba(0, 160, 220, 0.3)" })
                        }}
                      >
                        {isAdmin ? "Administrateur" : isInstructor ? "Formateur Officiel" : "Apprenant"}
                      </span>
                    </div>

                    {/* Links */}
                    <div style={{ padding: "0.4rem 0" }}>
                      <Link
                        href="/dashboard"
                        onClick={() => setIsProfileOpen(false)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.65rem",
                          padding: "0.55rem 0.85rem",
                          fontSize: "0.86rem",
                          color: "#e5e7eb",
                          textDecoration: "none",
                          borderRadius: "0.5rem",
                          transition: "background 0.15s ease"
                        }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--brand-orange)" }}>
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                        </svg>
                        <span>Mes cours</span>
                      </Link>

                      <Link
                        href="/dashboard/profile"
                        onClick={() => setIsProfileOpen(false)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.65rem",
                          padding: "0.55rem 0.85rem",
                          fontSize: "0.86rem",
                          color: "#e5e7eb",
                          textDecoration: "none",
                          borderRadius: "0.5rem",
                          transition: "background 0.15s ease"
                        }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--brand-blue)" }}>
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        <span>Profil & Paramètres</span>
                      </Link>

                      <Link
                        href="/dashboard/certificates"
                        onClick={() => setIsProfileOpen(false)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.65rem",
                          padding: "0.55rem 0.85rem",
                          fontSize: "0.86rem",
                          color: "#e5e7eb",
                          textDecoration: "none",
                          borderRadius: "0.5rem",
                          transition: "background 0.15s ease"
                        }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--brand-green)" }}>
                          <circle cx="12" cy="8" r="7" />
                          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                        </svg>
                        <span>Mes certificats</span>
                      </Link>

                      {isInstructor && (
                        <Link
                          href="/instructor"
                          onClick={() => setIsProfileOpen(false)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.65rem",
                            padding: "0.55rem 0.85rem",
                            fontSize: "0.86rem",
                            color: "#e5e7eb",
                            textDecoration: "none",
                            borderRadius: "0.5rem",
                            transition: "background 0.15s ease"
                          }}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--brand-orange)" }}>
                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                            <line x1="8" y1="21" x2="16" y2="21" />
                            <line x1="12" y1="17" x2="12" y2="21" />
                          </svg>
                          <span>Studio Formateur</span>
                        </Link>
                      )}

                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setIsProfileOpen(false)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.65rem",
                            padding: "0.55rem 0.85rem",
                            fontSize: "0.86rem",
                            color: "#e5e7eb",
                            textDecoration: "none",
                            borderRadius: "0.5rem",
                            transition: "background 0.15s ease"
                          }}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#c084fc" }}>
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          </svg>
                          <span>Espace Administration</span>
                        </Link>
                      )}
                    </div>

                    {/* Déconnexion */}
                    <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "0.4rem" }}>
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileOpen(false);
                          signOut();
                        }}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.65rem",
                          padding: "0.55rem 0.85rem",
                          fontSize: "0.86rem",
                          color: "#ef4444",
                          background: "transparent",
                          border: "none",
                          borderRadius: "0.5rem",
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "background 0.15s ease"
                        }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                          <polyline points="16 17 21 12 16 7" />
                          <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        <span>Déconnexion</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Hamburger toggle (uniquement sur mobile) */}
              <button 
                type="button"
                className="mobile-only"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Menu"
                style={{ 
                  background: "transparent", 
                  border: "none", 
                  cursor: "pointer", 
                  padding: "0.35rem", 
                  color: "white", 
                  flexDirection: "column", 
                  gap: "4px" 
                }}
              >
                <div style={{ width: "20px", height: "2px", background: "currentColor", borderRadius: "1px" }} />
                <div style={{ width: "20px", height: "2px", background: "currentColor", borderRadius: "1px" }} />
                <div style={{ width: "20px", height: "2px", background: "currentColor", borderRadius: "1px" }} />
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
              {/* Devenir formateur (Desktop only) */}
              <Link 
                href="/dashboard/profile"
                className="desktop-only"
                style={{ 
                  fontSize: "0.86rem",
                  fontWeight: 500,
                  color: "#9ca3af",
                  textDecoration: "none",
                  transition: "color 0.15s ease"
                }}
              >
                Devenir formateur
              </Link>

              {/* Connexion (Desktop only) */}
              <Link 
                href="/login" 
                className="desktop-only"
                style={{ 
                  padding: "0.4rem 0.85rem", 
                  fontSize: "0.85rem", 
                  fontWeight: 600,
                  color: "#f3f4f6",
                  textDecoration: "none",
                  borderRadius: "0.55rem",
                  background: "transparent",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  transition: "all 0.15s ease"
                }}
              >
                Connexion
              </Link>

              {/* S'inscrire (Visible Desktop & Mobile) */}
              <Link 
                href="/register" 
                style={{ 
                  padding: "0.42rem 1.15rem", 
                  fontSize: "0.86rem", 
                  fontWeight: 700,
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "0.55rem",
                  background: "linear-gradient(135deg, #fe9100 0%, #ea580c 100%)",
                  boxShadow: "0 2px 14px rgba(254, 145, 0, 0.35)",
                  border: "none",
                  transition: "all 0.15s ease"
                }}
              >
                S'inscrire
              </Link>

              {/* Mobile Hamburger toggle (uniquement sur mobile) */}
              <button 
                type="button"
                className="mobile-only"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Menu"
                style={{ 
                  background: "transparent", 
                  border: "none", 
                  cursor: "pointer", 
                  padding: "0.35rem", 
                  color: "white", 
                  flexDirection: "column", 
                  gap: "4px" 
                }}
              >
                <div style={{ width: "20px", height: "2px", background: "currentColor", borderRadius: "1px" }} />
                <div style={{ width: "20px", height: "2px", background: "currentColor", borderRadius: "1px" }} />
                <div style={{ width: "20px", height: "2px", background: "currentColor", borderRadius: "1px" }} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================
          TIROIR MOBILE FLUIDE
         ========================================================= */}
      {isMobileMenuOpen && (
        <div 
          style={{
            padding: "1rem 1.25rem 1.5rem",
            background: "#080c15",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.6)",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem"
          }}
        >
          {session ? (
            <>
              <div style={{ fontSize: "0.85rem", color: "#9ca3af", paddingBottom: "0.5rem", borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}>
                Connecté en tant que <strong style={{ color: "white" }}>{session.user?.name}</strong>
              </div>
              <Link 
                href="/courses" 
                onClick={() => setIsMobileMenuOpen(false)}
                style={{ padding: "0.4rem 0", color: isCoursesActive ? "#fe9100" : "white", fontWeight: 600, fontSize: "0.92rem" }}
              >
                Catalogue des cours
              </Link>
              <Link 
                href="/dashboard" 
                onClick={() => setIsMobileMenuOpen(false)}
                style={{ padding: "0.4rem 0", color: "#d1d5db", fontSize: "0.9rem" }}
              >
                Mes cours
              </Link>
              <Link 
                href="/dashboard/profile" 
                onClick={() => setIsMobileMenuOpen(false)}
                style={{ padding: "0.4rem 0", color: "#d1d5db", fontSize: "0.9rem" }}
              >
                Profil & Paramètres
              </Link>
              <Link 
                href="/dashboard/certificates" 
                onClick={() => setIsMobileMenuOpen(false)}
                style={{ padding: "0.4rem 0", color: "#d1d5db", fontSize: "0.9rem" }}
              >
                Mes certificats
              </Link>
              {isInstructor && (
                <Link 
                  href="/instructor" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ padding: "0.4rem 0", color: "var(--brand-orange)", fontWeight: 600, fontSize: "0.9rem" }}
                >
                  Studio Formateur
                </Link>
              )}
              {isAdmin && (
                <Link 
                  href="/admin" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ padding: "0.4rem 0", color: "#c084fc", fontWeight: 600, fontSize: "0.9rem" }}
                >
                  Administration
                </Link>
              )}
              <button 
                type="button"
                onClick={() => { setIsMobileMenuOpen(false); signOut(); }}
                style={{ 
                  marginTop: "0.5rem", 
                  padding: "0.55rem", 
                  borderRadius: "0.5rem", 
                  background: "rgba(239, 68, 68, 0.1)", 
                  border: "1px solid rgba(239, 68, 68, 0.3)", 
                  color: "#ef4444", 
                  cursor: "pointer", 
                  fontWeight: 600, 
                  fontSize: "0.88rem" 
                }}
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/courses" 
                onClick={() => setIsMobileMenuOpen(false)}
                style={{ padding: "0.4rem 0", color: isCoursesActive ? "#fe9100" : "white", fontWeight: 600, fontSize: "0.92rem" }}
              >
                Catalogue des cours
              </Link>
              <Link 
                href="/dashboard/profile" 
                onClick={() => setIsMobileMenuOpen(false)}
                style={{ padding: "0.4rem 0", color: "#9ca3af", fontSize: "0.9rem" }}
              >
                Devenir formateur
              </Link>
              <Link 
                href="/login" 
                onClick={() => setIsMobileMenuOpen(false)}
                style={{ padding: "0.4rem 0", color: "#d1d5db", fontSize: "0.9rem" }}
              >
                Connexion
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}