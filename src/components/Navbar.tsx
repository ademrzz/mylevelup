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

  // Fermer le menu deroulant au clic exterieur ou avec Echap
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

  // Fermer les menus lors d'un changement de page
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

  return (
    <nav
      className="glass w-full"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        borderBottom: "1px solid var(--border)",
        background: "var(--surface)",
        backdropFilter: "blur(20px)",
      }}
    >
      <div 
        className="container"
        style={{ 
          height: "72px", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between",
          padding: "0 1.5rem"
        }}
      >
        {/* Section Gauche : Logo et Liens Principaux */}
        <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          <Link 
            href="/" 
            style={{ display: "flex", alignItems: "center" }} 
            aria-label="Level Up DZ Accueil"
          >
            {/* Logo Desktop */}
            <div className="hidden-mobile" style={{ alignItems: "center" }}>
              <Image 
                src={logoLong} 
                alt="Level Up DZ" 
                height={46}
                width={120}
                style={{ height: "46px", width: "auto", objectFit: "contain" }}
                priority
              />
            </div>
            {/* Logo Mobile */}
            <div className="show-mobile" style={{ alignItems: "center" }}>
              <Image 
                src={logoShort} 
                alt="Level Up DZ" 
                height={36}
                width={36}
                style={{ height: "36px", width: "auto", objectFit: "contain" }}
                priority
              />
            </div>
          </Link>

          {/* Liens de Navigation Desktop (Espacement bien defini) */}
          <div 
            className="hidden-mobile" 
            style={{ 
              display: "flex",
              alignItems: "center", 
              gap: "1.25rem"
            }}
          >
            <Link 
              href="/courses" 
              style={{ 
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 0.9rem",
                borderRadius: "0.5rem",
                fontSize: "0.92rem", 
                fontWeight: 500,
                color: pathname.startsWith("/courses") ? "var(--foreground)" : "var(--text-muted)",
                background: pathname.startsWith("/courses") ? "var(--surface-hover)" : "transparent",
                transition: "all 0.15s ease" 
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}>
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <span>Catalogue des cours</span>
            </Link>
            
            {(!session || role === "STUDENT") && (
              <Link 
                href={session ? "/dashboard/profile" : "/register"}
                style={{ 
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.45rem",
                  padding: "0.45rem 0.95rem",
                  borderRadius: "0.5rem",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  color: "var(--brand-orange)",
                  background: "rgba(254, 145, 0, 0.08)",
                  border: "1px solid rgba(254, 145, 0, 0.28)",
                  transition: "all 0.15s ease"
                }}
              >
                <span>Devenir formateur</span>
              </Link>
            )}
          </div>
        </div>

        {/* Section Droite : Actions utilisateur Desktop */}
        <div className="hidden-mobile" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {session ? (
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              {/* Raccourci Espace Administration */}
              {isAdmin && (
                <Link
                  href="/admin"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    letterSpacing: "0.01em",
                    color: "#c084fc",
                    background: pathname.startsWith("/admin") 
                      ? "rgba(168, 85, 247, 0.2)" 
                      : "rgba(168, 85, 247, 0.09)",
                    border: "1px solid rgba(168, 85, 247, 0.3)",
                    padding: "0.45rem 0.85rem",
                    borderRadius: "0.5rem",
                    transition: "all 0.15s ease"
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span>Administration</span>
                </Link>
              )}

              {/* Raccourci Studio Formateur */}
              {isInstructor && (
                <Link
                  href="/instructor"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    letterSpacing: "0.01em",
                    color: "var(--brand-orange)",
                    background: pathname.startsWith("/instructor") 
                      ? "rgba(254, 145, 0, 0.18)" 
                      : "rgba(254, 145, 0, 0.08)",
                    border: "1px solid rgba(254, 145, 0, 0.28)",
                    padding: "0.45rem 0.85rem",
                    borderRadius: "0.5rem",
                    transition: "all 0.15s ease"
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                  <span>Studio Formateur</span>
                </Link>
              )}

              {/* Lien Mes cours pour apprenant */}
              <Link
                href="/dashboard"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  color: pathname === "/dashboard" ? "var(--foreground)" : "var(--text-muted)",
                  padding: "0.45rem 0.85rem",
                  borderRadius: "0.5rem",
                  background: pathname === "/dashboard" ? "var(--surface-hover)" : "transparent",
                  transition: "all 0.15s ease"
                }}
              >
                Mes cours
              </Link>

              {/* Bouton Profil & Menu Deroulant */}
              <div ref={dropdownRef} style={{ position: "relative" }}>
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  aria-expanded={isProfileOpen}
                  aria-haspopup="true"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    background: isProfileOpen ? "var(--surface-hover)" : "transparent",
                    border: "1px solid " + (isProfileOpen ? "var(--border)" : "rgba(255, 255, 255, 0.1)"),
                    padding: "0.3rem 0.7rem 0.3rem 0.35rem",
                    borderRadius: "9999px",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  {/* Avatar utilisateur */}
                  <div
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "50%",
                      overflow: "hidden",
                      background: "linear-gradient(135deg, var(--brand-orange) 0%, var(--brand-blue) 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "0.84rem",
                      fontWeight: 700,
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
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
                    style={{
                      fontSize: "0.88rem",
                      fontWeight: 600,
                      color: "var(--foreground)",
                      maxWidth: "130px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {session.user?.name || "Mon compte"}
                  </span>

                  {/* Fleche chevron */}
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      color: "var(--text-muted)",
                      transform: isProfileOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease"
                    }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {/* Panneau Flottant du Menu Deroulant */}
                {isProfileOpen && (
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "calc(100% + 8px)",
                      width: "270px",
                      background: "var(--surface-solid)",
                      border: "1px solid var(--border)",
                      borderRadius: "0.85rem",
                      boxShadow: "0 16px 36px rgba(0, 0, 0, 0.28)",
                      backdropFilter: "blur(20px)",
                      padding: "0.5rem",
                      zIndex: 60,
                      animation: "fadeIn 0.15s ease-out"
                    }}
                  >
                    {/* Carte Identite Utilisateur */}
                    <div style={{ padding: "0.75rem 0.85rem 0.85rem", borderBottom: "1px solid var(--border)" }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: "0.95rem", color: "var(--foreground)" }}>
                        {session.user?.name || "Utilisateur"}
                      </p>
                      <p style={{ margin: "0.2rem 0 0.5rem", fontSize: "0.8rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {session.user?.email}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <span
                          style={{
                            fontSize: "0.72rem",
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
                    </div>

                    {/* Liens Internes du Menu */}
                    <div style={{ padding: "0.4rem 0" }}>
                      <Link
                        href="/dashboard"
                        onClick={() => setIsProfileOpen(false)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.65rem",
                          padding: "0.6rem 0.85rem",
                          fontSize: "0.88rem",
                          color: "var(--foreground)",
                          borderRadius: "0.5rem",
                          transition: "background 0.15s ease"
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--brand-blue)" }}>
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                        </svg>
                        <span>Mes formations</span>
                      </Link>

                      <Link
                        href="/dashboard/profile"
                        onClick={() => setIsProfileOpen(false)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.65rem",
                          padding: "0.6rem 0.85rem",
                          fontSize: "0.88rem",
                          color: "var(--foreground)",
                          borderRadius: "0.5rem",
                          transition: "background 0.15s ease"
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-muted)" }}>
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        <span>Profil & Parametres</span>
                      </Link>

                      <Link
                        href="/dashboard/certificates"
                        onClick={() => setIsProfileOpen(false)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.65rem",
                          padding: "0.6rem 0.85rem",
                          fontSize: "0.88rem",
                          color: "var(--foreground)",
                          borderRadius: "0.5rem",
                          transition: "background 0.15s ease"
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--brand-green)" }}>
                          <circle cx="12" cy="8" r="7" />
                          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                        </svg>
                        <span>Mes certificats</span>
                      </Link>

                      {/* Studio Formateur dans le menu */}
                      {isInstructor && (
                        <Link
                          href="/instructor"
                          onClick={() => setIsProfileOpen(false)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.65rem",
                            padding: "0.6rem 0.85rem",
                            fontSize: "0.88rem",
                            color: "var(--foreground)",
                            borderRadius: "0.5rem",
                            transition: "background 0.15s ease"
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--brand-orange)" }}>
                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                            <line x1="8" y1="21" x2="16" y2="21" />
                            <line x1="12" y1="17" x2="12" y2="21" />
                          </svg>
                          <span>Espace Formateur</span>
                        </Link>
                      )}

                      {/* Portail Admin dans le menu */}
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setIsProfileOpen(false)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.65rem",
                            padding: "0.6rem 0.85rem",
                            fontSize: "0.88rem",
                            color: "var(--foreground)",
                            borderRadius: "0.5rem",
                            transition: "background 0.15s ease"
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#c084fc" }}>
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          </svg>
                          <span>Espace Administration</span>
                        </Link>
                      )}
                    </div>

                    {/* Action Deconnexion */}
                    <div style={{ borderTop: "1px solid var(--border)", paddingTop: "0.4rem" }}>
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
                          padding: "0.6rem 0.85rem",
                          fontSize: "0.88rem",
                          color: "#ef4444",
                          background: "transparent",
                          border: "none",
                          borderRadius: "0.5rem",
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "background 0.15s ease"
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                          <polyline points="16 17 21 12 16 7" />
                          <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        <span>Deconnexion</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Link 
                href="/login" 
                className="btn btn-secondary" 
                style={{ 
                  padding: "0.45rem 1.1rem", 
                  fontSize: "0.88rem", 
                  fontWeight: 500 
                }}
              >
                Connexion
              </Link>
              <Link 
                href="/register" 
                className="btn btn-primary" 
                style={{ 
                  padding: "0.45rem 1.15rem", 
                  fontSize: "0.88rem", 
                  fontWeight: 600 
                }}
              >
                S inscrire
              </Link>
            </div>
          )}
        </div>

        {/* Bouton Hamburger Mobile */}
        <button 
          className="show-mobile"
          style={{ 
            background: "transparent", 
            border: "none", 
            cursor: "pointer", 
            padding: "0.5rem",
            color: "var(--foreground)",
            flexDirection: "column",
            justifyContent: "center",
            gap: "5px"
          }}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Menu"
        >
          <div 
            style={{ 
              width: "22px", 
              height: "2px", 
              background: "currentColor", 
              transition: "all 0.25s ease", 
              transform: isMobileMenuOpen ? "rotate(45deg) translate(4px, 4px)" : "none" 
            }} 
          />
          <div 
            style={{ 
              width: "22px", 
              height: "2px", 
              background: "currentColor", 
              transition: "all 0.25s ease", 
              opacity: isMobileMenuOpen ? 0 : 1 
            }} 
          />
          <div 
            style={{ 
              width: "22px", 
              height: "2px", 
              background: "currentColor", 
              transition: "all 0.25s ease", 
              transform: isMobileMenuOpen ? "rotate(-45deg) translate(4px, -4px)" : "none" 
            }} 
          />
        </button>
      </div>

      {/* Menu Tiroir Mobile */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-menu"
          style={{
            padding: "1.25rem 1.5rem 2rem",
            background: "var(--surface-solid)",
            borderBottom: "1px solid var(--border)",
            boxShadow: "var(--shadow-lg)"
          }}
        >
          {session ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Entete Utilisateur */}
              <div 
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "0.85rem", 
                  paddingBottom: "1rem", 
                  borderBottom: "1px solid var(--border)" 
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, var(--brand-orange) 0%, var(--brand-blue) 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "0.95rem"
                  }}
                >
                  {getUserInitials(session.user?.name)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--foreground)" }}>
                    {session.user?.name || "Utilisateur"}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    {session.user?.email}
                  </div>
                </div>
              </div>

              {/* Liens de navigation */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <Link 
                  href="/courses" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ padding: "0.6rem 0", fontWeight: 500, color: "var(--foreground)", fontSize: "0.95rem" }}
                >
                  Catalogue des cours
                </Link>

                <Link 
                  href="/dashboard" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ padding: "0.6rem 0", fontWeight: 500, color: "var(--foreground)", fontSize: "0.95rem" }}
                >
                  Mes cours
                </Link>

                <Link 
                  href="/dashboard/profile" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ padding: "0.6rem 0", fontWeight: 500, color: "var(--foreground)", fontSize: "0.95rem" }}
                >
                  Profil & Parametres
                </Link>

                <Link 
                  href="/dashboard/certificates" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ padding: "0.6rem 0", fontWeight: 500, color: "var(--foreground)", fontSize: "0.95rem" }}
                >
                  Mes certificats
                </Link>

                {role === "STUDENT" && (
                  <Link 
                    href="/dashboard/profile" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{ padding: "0.6rem 0", fontWeight: 600, color: "var(--brand-orange)", fontSize: "0.95rem" }}
                  >
                    Devenir formateur
                  </Link>
                )}
              </div>

              {/* Portails specifiques */}
              {(isInstructor || isAdmin) && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", paddingTop: "0.5rem", borderTop: "1px solid var(--border)" }}>
                  {isInstructor && (
                    <Link
                      href="/instructor"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="btn btn-secondary"
                      style={{ 
                        justifyContent: "center", 
                        padding: "0.7rem", 
                        color: "var(--brand-orange)", 
                        borderColor: "rgba(254,145,0,0.3)" 
                      }}
                    >
                      Studio Formateur
                    </Link>
                  )}

                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="btn btn-secondary"
                      style={{ 
                        justifyContent: "center", 
                        padding: "0.7rem", 
                        color: "#c084fc", 
                        borderColor: "rgba(168,85,247,0.35)" 
                      }}
                    >
                      Administration
                    </Link>
                  )}
                </div>
              )}

              {/* Deconnexion */}
              <button 
                onClick={() => { 
                  setIsMobileMenuOpen(false); 
                  signOut(); 
                }} 
                className="btn btn-outline"
                style={{ marginTop: "0.5rem", width: "100%", justifyContent: "center" }}
              >
                Deconnexion
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <Link 
                href="/courses" 
                onClick={() => setIsMobileMenuOpen(false)}
                style={{ padding: "0.5rem 0", fontWeight: 500, color: "var(--foreground)" }}
              >
                Catalogue des cours
              </Link>
              <Link 
                href="/register" 
                onClick={() => setIsMobileMenuOpen(false)}
                style={{ padding: "0.5rem 0", fontWeight: 500, color: "var(--text-muted)" }}
              >
                Devenir formateur
              </Link>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.5rem" }}>
                <Link 
                  href="/login" 
                  className="btn btn-secondary" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  Connexion
                </Link>
                <Link 
                  href="/register" 
                  className="btn btn-primary" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  S inscrire
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}