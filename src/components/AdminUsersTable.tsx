"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { adminUpdateUserRole, adminDeleteUser } from "@/actions/adminUsers";

export interface AdminUserItem {
  id: string;
  name: string | null;
  email: string | null;
  wilaya: string | null;
  phone: string | null;
  role: string;
  createdAt: string;
  enrollmentsCount: number;
  coursesCount: number;
}

interface AdminUsersTableProps {
  users: AdminUserItem[];
  currentAdminId: string;
}

type UserSortField = "name" | "createdAt" | "role" | "enrollments" | "courses" | "wilaya";
type SortDirection = "asc" | "desc";

export function AdminUsersTable({ users, currentAdminId }: AdminUsersTableProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "STUDENT" | "INSTRUCTOR" | "ADMIN">("ALL");
  const [sortField, setSortField] = useState<UserSortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);

  // Filter
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = (u.name || "").toLowerCase().includes(query);
        const matchesEmail = (u.email || "").toLowerCase().includes(query);
        const matchesWilaya = (u.wilaya || "").toLowerCase().includes(query);
        const matchesPhone = (u.phone || "").toLowerCase().includes(query);
        return matchesName || matchesEmail || matchesWilaya || matchesPhone;
      }
      return true;
    });
  }, [users, roleFilter, searchQuery]);

  // Sort
  const sortedUsers = useMemo(() => {
    const list = [...filteredUsers];
    list.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "name":
          comparison = (a.name || "").localeCompare(b.name || "");
          break;
        case "createdAt":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "role":
          const order: Record<string, number> = { ADMIN: 1, INSTRUCTOR: 2, STUDENT: 3 };
          comparison = (order[a.role] || 4) - (order[b.role] || 4);
          break;
        case "enrollments":
          comparison = a.enrollmentsCount - b.enrollmentsCount;
          break;
        case "courses":
          comparison = a.coursesCount - b.coursesCount;
          break;
        case "wilaya":
          comparison = (a.wilaya || "").localeCompare(b.wilaya || "");
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
    return list;
  }, [filteredUsers, sortField, sortDirection]);

  // Pagination
  const totalItems = sortedUsers.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedUsers.slice(start, start + pageSize);
  }, [sortedUsers, currentPage, pageSize]);

  function handleSort(field: UserSortField) {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection(field === "createdAt" || field === "enrollments" || field === "courses" ? "desc" : "asc");
    }
  }

  async function handleRoleChange(userId: string, newRole: string) {
    setLoadingUserId(userId);
    try {
      await adminUpdateUserRole(userId, newRole);
      router.refresh();
    } catch (err: any) {
      alert(err?.message || "Erreur lors du changement de rôle.");
    } finally {
      setLoadingUserId(null);
    }
  }

  async function handleDeleteUser(userId: string, userName: string, userEmail: string) {
    if (!window.confirm(`Supprimer définitivement le compte de ${userName || userEmail} ?\n\nCette action est irréversible et supprimera également tous ses cours, leçons, avis et inscriptions.`)) return;

    setLoadingUserId(userId);
    try {
      await adminDeleteUser(userId);
      router.refresh();
    } catch (err: any) {
      alert(err?.message || "Erreur lors de la suppression de l'utilisateur.");
    } finally {
      setLoadingUserId(null);
    }
  }

  function renderSortIndicator(field: UserSortField) {
    const isActive = sortField === field;
    return (
      <span style={{ display: "inline-flex", verticalAlign: "middle", marginLeft: "4px", opacity: isActive ? 1 : 0.4 }}>
        {isActive ? (
          sortDirection === "asc" ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15" /></svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
          )
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="7 15 12 20 17 15" /><polyline points="7 9 12 4 17 9" /></svg>
        )}
      </span>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <style>{`
        .users-table-desktop {
          display: table;
        }
        .users-cards-mobile {
          display: none;
        }
        @media (max-width: 900px) {
          .users-table-desktop {
            display: none !important;
          }
          .users-cards-mobile {
            display: flex !important;
            flex-direction: column;
            gap: 1rem;
          }
        }
      `}</style>

      {/* Filter and Search Bar */}
      <div
        className="glass"
        style={{
          padding: "1rem 1.25rem",
          borderRadius: "1rem",
          border: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        {/* Search Input */}
        <div style={{ position: "relative", minWidth: "260px", flex: "1 1 280px" }}>
          <div style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", display: "flex", alignItems: "center" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          </div>
          <input
            type="text"
            placeholder="Rechercher par nom, email, wilaya ou téléphone..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            style={{
              width: "100%",
              padding: "0.55rem 0.85rem 0.55rem 2.35rem",
              borderRadius: "0.5rem",
              background: "rgba(0,0,0,0.4)",
              border: "1px solid var(--border)",
              color: "white",
              fontSize: "0.85rem",
              outline: "none",
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => { setSearchQuery(""); setCurrentPage(1); }}
              style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Role Filter Chips */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => { setRoleFilter("ALL"); setCurrentPage(1); }}
            style={{
              fontSize: "0.78rem",
              padding: "0.4rem 0.75rem",
              borderRadius: "0.4rem",
              border: roleFilter === "ALL" ? "1px solid var(--brand-blue)" : "1px solid rgba(255,255,255,0.08)",
              background: roleFilter === "ALL" ? "rgba(59,130,246,0.15)" : "transparent",
              color: roleFilter === "ALL" ? "white" : "var(--text-muted)",
              cursor: "pointer",
              fontWeight: roleFilter === "ALL" ? 600 : 400,
            }}
          >
            Tous ({users.length})
          </button>
          <button
            type="button"
            onClick={() => { setRoleFilter("STUDENT"); setCurrentPage(1); }}
            style={{
              fontSize: "0.78rem",
              padding: "0.4rem 0.75rem",
              borderRadius: "0.4rem",
              border: roleFilter === "STUDENT" ? "1px solid #34d399" : "1px solid rgba(255,255,255,0.08)",
              background: roleFilter === "STUDENT" ? "rgba(52,211,153,0.15)" : "transparent",
              color: roleFilter === "STUDENT" ? "#34d399" : "var(--text-muted)",
              cursor: "pointer",
              fontWeight: roleFilter === "STUDENT" ? 600 : 400,
            }}
          >
            Étudiants ({users.filter((u) => u.role === "STUDENT").length})
          </button>
          <button
            type="button"
            onClick={() => { setRoleFilter("INSTRUCTOR"); setCurrentPage(1); }}
            style={{
              fontSize: "0.78rem",
              padding: "0.4rem 0.75rem",
              borderRadius: "0.4rem",
              border: roleFilter === "INSTRUCTOR" ? "1px solid var(--brand-orange)" : "1px solid rgba(255,255,255,0.08)",
              background: roleFilter === "INSTRUCTOR" ? "rgba(254,145,0,0.15)" : "transparent",
              color: roleFilter === "INSTRUCTOR" ? "var(--brand-orange)" : "var(--text-muted)",
              cursor: "pointer",
              fontWeight: roleFilter === "INSTRUCTOR" ? 600 : 400,
            }}
          >
            Formateurs ({users.filter((u) => u.role === "INSTRUCTOR").length})
          </button>
          <button
            type="button"
            onClick={() => { setRoleFilter("ADMIN"); setCurrentPage(1); }}
            style={{
              fontSize: "0.78rem",
              padding: "0.4rem 0.75rem",
              borderRadius: "0.4rem",
              border: roleFilter === "ADMIN" ? "1px solid #c084fc" : "1px solid rgba(255,255,255,0.08)",
              background: roleFilter === "ADMIN" ? "rgba(168,85,247,0.15)" : "transparent",
              color: roleFilter === "ADMIN" ? "#c084fc" : "var(--text-muted)",
              cursor: "pointer",
              fontWeight: roleFilter === "ADMIN" ? 600 : 400,
            }}
          >
            Admins ({users.filter((u) => u.role === "ADMIN").length})
          </button>
        </div>
      </div>

      {/* DESKTOP TABLE VIEW */}
      <div className="glass users-table-desktop" style={{ borderRadius: "1.25rem", border: "1px solid var(--border)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", minWidth: "950px", borderCollapse: "collapse", textAlign: "left", fontSize: "0.88rem" }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "0.82rem" }}>
                {/* Utilisateur (Sortable) */}
                <th 
                  onClick={() => handleSort("name")}
                  style={{ padding: "0.75rem 1rem", fontWeight: 600, cursor: "pointer", userSelect: "none" }}
                >
                  <span>Utilisateur</span>
                  {renderSortIndicator("name")}
                </th>

                {/* Wilaya / Contact (Sortable) */}
                <th 
                  onClick={() => handleSort("wilaya")}
                  style={{ padding: "0.75rem 0.85rem", fontWeight: 600, cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }}
                >
                  <span>Wilaya & Contact</span>
                  {renderSortIndicator("wilaya")}
                </th>

                {/* Date d'inscription (Sortable) */}
                <th 
                  onClick={() => handleSort("createdAt")}
                  style={{ padding: "0.75rem 0.85rem", fontWeight: 600, cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }}
                >
                  <span>Date d'inscription</span>
                  {renderSortIndicator("createdAt")}
                </th>

                {/* Inscriptions (Sortable) */}
                <th 
                  onClick={() => handleSort("enrollments")}
                  style={{ padding: "0.75rem 0.85rem", fontWeight: 600, cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }}
                >
                  <span>Inscriptions</span>
                  {renderSortIndicator("enrollments")}
                </th>

                {/* Cours créés (Sortable) */}
                <th 
                  onClick={() => handleSort("courses")}
                  style={{ padding: "0.75rem 0.85rem", fontWeight: 600, cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }}
                >
                  <span>Cours créés</span>
                  {renderSortIndicator("courses")}
                </th>

                {/* Rôle Actuel (Sortable) */}
                <th 
                  onClick={() => handleSort("role")}
                  style={{ padding: "0.75rem 0.85rem", fontWeight: 600, cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }}
                >
                  <span>Rôle Actuel</span>
                  {renderSortIndicator("role")}
                </th>

                {/* Actions */}
                <th style={{ padding: "0.75rem 1rem", fontWeight: 600, textAlign: "right", whiteSpace: "nowrap" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                    Aucun utilisateur trouvé avec les critères actuels.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => {
                  const isCurrentAdmin = u.id === currentAdminId;
                  const isLoading = loadingUserId === u.id;
                  const createdDate = new Date(u.createdAt).toLocaleDateString("fr-DZ", { day: "2-digit", month: "short", year: "numeric" });

                  return (
                    <tr key={u.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.15s ease" }}>
                      {/* Name & Email */}
                      <td style={{ padding: "0.75rem 1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
                          <div
                            style={{
                              width: "34px",
                              height: "34px",
                              borderRadius: "50%",
                              background: u.role === "ADMIN" ? "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)" : u.role === "INSTRUCTOR" ? "var(--brand-orange)" : "rgba(255,255,255,0.08)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 700,
                              color: "white",
                              fontSize: "0.85rem",
                              flexShrink: 0,
                            }}
                          >
                            {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: "white", display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.88rem" }}>
                              {u.name || "Sans nom"}
                              {isCurrentAdmin && (
                                <span style={{ fontSize: "0.68rem", color: "#c084fc", background: "rgba(168,85,247,0.15)", padding: "0.1rem 0.35rem", borderRadius: "4px" }}>
                                  Vous
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{u.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Wilaya / Contact */}
                      <td style={{ padding: "0.75rem 0.85rem", whiteSpace: "nowrap" }}>
                        <div style={{ color: "#e5e7eb", fontSize: "0.82rem" }}>{u.wilaya || "Wilaya non spécifiée"}</div>
                        <div style={{ color: "var(--text-muted)", fontSize: "0.74rem" }}>{u.phone || "Téléphone absent"}</div>
                      </td>

                      {/* Date d'inscription */}
                      <td style={{ padding: "0.75rem 0.85rem", whiteSpace: "nowrap", color: "#e5e7eb", fontSize: "0.82rem" }}>
                        {createdDate}
                      </td>

                      {/* Inscriptions */}
                      <td style={{ padding: "0.75rem 0.85rem", whiteSpace: "nowrap", fontSize: "0.82rem" }}>
                        <strong style={{ color: "white" }}>{u.enrollmentsCount}</strong> cours
                      </td>

                      {/* Cours créés */}
                      <td style={{ padding: "0.75rem 0.85rem", whiteSpace: "nowrap", fontSize: "0.82rem" }}>
                        <strong style={{ color: u.coursesCount > 0 ? "var(--brand-orange)" : "var(--text-muted)" }}>{u.coursesCount}</strong> cours
                      </td>

                      {/* Role Badge */}
                      <td style={{ padding: "0.75rem 0.85rem", whiteSpace: "nowrap" }}>
                        {u.role === "ADMIN" ? (
                          <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "0.2rem 0.55rem", borderRadius: "9999px", background: "rgba(168,85,247,0.15)", color: "#c084fc", border: "1px solid rgba(168,85,247,0.3)", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                            Admin
                          </span>
                        ) : u.role === "INSTRUCTOR" ? (
                          <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "0.2rem 0.55rem", borderRadius: "9999px", background: "rgba(254,145,0,0.15)", color: "var(--brand-orange)", border: "1px solid rgba(254,145,0,0.3)", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
                            Formateur
                          </span>
                        ) : (
                          <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "0.2rem 0.55rem", borderRadius: "9999px", background: "rgba(0,160,220,0.15)", color: "var(--brand-blue)", border: "1px solid rgba(0,160,220,0.3)", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                            Étudiant
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "0.75rem 1rem", textAlign: "right", whiteSpace: "nowrap" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                          {/* Role select */}
                          <select
                            defaultValue={u.role}
                            disabled={isCurrentAdmin || isLoading}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            style={{
                              background: "rgba(0,0,0,0.5)",
                              border: "1px solid var(--border)",
                              color: "white",
                              fontSize: "0.75rem",
                              borderRadius: "0.35rem",
                              padding: "0.25rem 0.5rem",
                              cursor: isCurrentAdmin ? "not-allowed" : "pointer",
                              opacity: isCurrentAdmin ? 0.6 : 1,
                            }}
                          >
                            <option value="STUDENT">Étudiant</option>
                            <option value="INSTRUCTOR">Formateur</option>
                            <option value="ADMIN">Admin</option>
                          </select>

                          {/* Delete button */}
                          {!isCurrentAdmin && (
                            <button
                              type="button"
                              disabled={isLoading}
                              onClick={() => handleDeleteUser(u.id, u.name || "", u.email || "")}
                              style={{
                                background: "rgba(239,68,68,0.08)",
                                border: "1px solid rgba(239,68,68,0.35)",
                                color: "#f87171",
                                padding: "0.25rem 0.5rem",
                                borderRadius: "0.35rem",
                                cursor: "pointer",
                                fontSize: "0.75rem",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.25rem",
                              }}
                              title="Supprimer ce compte"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                              <span>{isLoading ? "..." : "Supprimer"}</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MOBILE CARDS VIEW */}
      <div className="users-cards-mobile">
        {paginatedUsers.length === 0 ? (
          <div className="glass" style={{ padding: "2rem", textAlign: "center", borderRadius: "1rem", color: "var(--text-muted)" }}>
            Aucun utilisateur trouvé.
          </div>
        ) : (
          paginatedUsers.map((u) => {
            const isCurrentAdmin = u.id === currentAdminId;
            const isLoading = loadingUserId === u.id;
            const createdDate = new Date(u.createdAt).toLocaleDateString("fr-DZ", { day: "2-digit", month: "short", year: "numeric" });

            return (
              <div
                key={u.id}
                className="glass"
                style={{
                  borderRadius: "1rem",
                  padding: "1rem",
                  border: "1px solid var(--border)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                {/* Header: Avatar, Name, Email, Role badge */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background: u.role === "ADMIN" ? "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)" : u.role === "INSTRUCTOR" ? "var(--brand-orange)" : "rgba(255,255,255,0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        color: "white",
                        fontSize: "0.85rem",
                        flexShrink: 0,
                      }}
                    >
                      {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: "white", fontSize: "0.9rem" }}>
                        {u.name || "Sans nom"}
                        {isCurrentAdmin && <span style={{ fontSize: "0.7rem", color: "#c084fc", marginLeft: "4px" }}>(Vous)</span>}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{u.email}</div>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      padding: "0.2rem 0.5rem",
                      borderRadius: "9999px",
                      background: u.role === "ADMIN" ? "rgba(168,85,247,0.15)" : u.role === "INSTRUCTOR" ? "rgba(254,145,0,0.15)" : "rgba(0,160,220,0.15)",
                      color: u.role === "ADMIN" ? "#c084fc" : u.role === "INSTRUCTOR" ? "var(--brand-orange)" : "var(--brand-blue)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    {u.role === "ADMIN" ? "Admin" : u.role === "INSTRUCTOR" ? "Formateur" : "Étudiant"}
                  </span>
                </div>

                {/* Info row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", fontSize: "0.78rem", background: "rgba(255,255,255,0.02)", padding: "0.6rem", borderRadius: "0.5rem" }}>
                  <div>
                    <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.7rem" }}>Wilaya & Contact</span>
                    <strong style={{ color: "#e5e7eb" }}>{u.wilaya || "—"}</strong>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>{u.phone || "Pas de tél"}</div>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.7rem" }}>Activité</span>
                    <span style={{ color: "#e5e7eb" }}><strong>{u.enrollmentsCount}</strong> inscrit(s)</span>
                    <span style={{ color: "var(--brand-orange)", display: "block" }}><strong>{u.coursesCount}</strong> créé(s)</span>
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>Inscrit le : </span>
                    <span style={{ color: "#e5e7eb" }}>{createdDate}</span>
                  </div>
                </div>

                {/* Actions row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "0.6rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Rôle :</span>
                    <select
                      defaultValue={u.role}
                      disabled={isCurrentAdmin || isLoading}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      style={{
                        background: "rgba(0,0,0,0.5)",
                        border: "1px solid var(--border)",
                        color: "white",
                        fontSize: "0.75rem",
                        borderRadius: "0.35rem",
                        padding: "0.25rem 0.5rem",
                      }}
                    >
                      <option value="STUDENT">Étudiant</option>
                      <option value="INSTRUCTOR">Formateur</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>

                  {!isCurrentAdmin && (
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleDeleteUser(u.id, u.name || "", u.email || "")}
                      style={{
                        background: "#ef4444",
                        color: "white",
                        border: "none",
                        padding: "0.3rem 0.65rem",
                        borderRadius: "0.35rem",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                      }}
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* PAGINATION CONTROLS */}
      <div
        className="glass"
        style={{
          padding: "0.85rem 1.25rem",
          borderRadius: "0.85rem",
          border: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.75rem",
          fontSize: "0.82rem",
          color: "var(--text-muted)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <span>
            Affichage de <strong>{totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> à{" "}
            <strong>{Math.min(currentPage * pageSize, totalItems)}</strong> sur <strong>{totalItems}</strong> utilisateur{totalItems > 1 ? "s" : ""}
          </span>

          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span>Lignes par page :</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{
                background: "rgba(0,0,0,0.5)",
                border: "1px solid var(--border)",
                color: "white",
                borderRadius: "0.35rem",
                padding: "0.25rem 0.5rem",
                fontSize: "0.8rem",
                cursor: "pointer",
              }}
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(1)}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid var(--border)",
              color: currentPage <= 1 ? "rgba(255,255,255,0.2)" : "white",
              padding: "0.3rem 0.6rem",
              borderRadius: "0.35rem",
              cursor: currentPage <= 1 ? "not-allowed" : "pointer",
              fontSize: "0.78rem",
            }}
          >
            «
          </button>
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid var(--border)",
              color: currentPage <= 1 ? "rgba(255,255,255,0.2)" : "white",
              padding: "0.3rem 0.65rem",
              borderRadius: "0.35rem",
              cursor: currentPage <= 1 ? "not-allowed" : "pointer",
              fontSize: "0.78rem",
            }}
          >
            Précédent
          </button>

          <span style={{ padding: "0 0.5rem", color: "white", fontWeight: 600 }}>
            Page {currentPage} / {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid var(--border)",
              color: currentPage >= totalPages ? "rgba(255,255,255,0.2)" : "white",
              padding: "0.3rem 0.65rem",
              borderRadius: "0.35rem",
              cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
              fontSize: "0.78rem",
            }}
          >
            Suivant
          </button>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(totalPages)}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid var(--border)",
              color: currentPage >= totalPages ? "rgba(255,255,255,0.2)" : "white",
              padding: "0.3rem 0.6rem",
              borderRadius: "0.35rem",
              cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
              fontSize: "0.78rem",
            }}
          >
            »
          </button>
        </div>
      </div>
    </div>
  );
}
