"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CourseSubscribersModal, Subscriber } from "@/components/CourseSubscribersModal";
import { AdminCourseModerationActions } from "@/components/AdminCourseModerationActions";
import { 
  adminDeleteMultipleCourses, 
  adminPublishMultipleCourses, 
  adminUnpublishMultipleCourses 
} from "@/actions/courseModeration";

export interface AdminCourseItem {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  price: number | null;
  isPublished: boolean;
  status: string;
  rejectionReason: string | null;
  createdAt: string;
  instructor: {
    id: string;
    name: string | null;
    email: string | null;
  };
  category: {
    id: string;
    name: string;
  } | null;
  chaptersCount: number;
  lessonsCount: number;
  enrollments: Subscriber[];
}

interface AdminCoursesTableProps {
  initialCourses: AdminCourseItem[];
}

type SortField = "title" | "createdAt" | "instructor" | "price" | "subscribers" | "status";
type SortDirection = "asc" | "desc";

export function AdminCoursesTable({ initialCourses }: AdminCoursesTableProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "PUBLISHED" | "REJECTED" | "DRAFT">("ALL");
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);

  // Sorting state
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Filter & Search
  const filteredCourses = useMemo(() => {
    return initialCourses.filter((course) => {
      // Status filter
      if (statusFilter === "PENDING" && course.status !== "PENDING") return false;
      if (statusFilter === "PUBLISHED" && !course.isPublished) return false;
      if (statusFilter === "REJECTED" && course.status !== "REJECTED") return false;
      if (statusFilter === "DRAFT" && (course.isPublished || course.status === "PENDING" || course.status === "REJECTED")) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = course.title.toLowerCase().includes(query);
        const matchesInstructor = (course.instructor.name || "").toLowerCase().includes(query) || (course.instructor.email || "").toLowerCase().includes(query);
        const matchesCategory = (course.category?.name || "").toLowerCase().includes(query);
        return matchesTitle || matchesInstructor || matchesCategory;
      }

      return true;
    });
  }, [initialCourses, statusFilter, searchQuery]);

  // Sort
  const sortedCourses = useMemo(() => {
    const list = [...filteredCourses];
    list.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "createdAt":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "instructor":
          comparison = (a.instructor.name || "").localeCompare(b.instructor.name || "");
          break;
        case "price":
          comparison = (a.price || 0) - (b.price || 0);
          break;
        case "subscribers":
          comparison = a.enrollments.length - b.enrollments.length;
          break;
        case "status":
          const statusOrder: Record<string, number> = { PENDING: 1, PUBLISHED: 2, DRAFT: 3, REJECTED: 4 };
          const aVal = a.isPublished ? 2 : (statusOrder[a.status] || 5);
          const bVal = b.isPublished ? 2 : (statusOrder[b.status] || 5);
          comparison = aVal - bVal;
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
    return list;
  }, [filteredCourses, sortField, sortDirection]);

  // Pagination calculation
  const totalItems = sortedCourses.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedCourses.slice(start, start + pageSize);
  }, [sortedCourses, currentPage, pageSize]);

  // Reset page when filters change
  function handleFilterChange(newFilter: typeof statusFilter) {
    setStatusFilter(newFilter);
    setCurrentPage(1);
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  }

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection(field === "createdAt" || field === "price" || field === "subscribers" ? "desc" : "asc");
    }
  }

  // Selection
  const allCurrentPageSelected = paginatedCourses.length > 0 && paginatedCourses.every((c) => selectedIds.includes(c.id));
  const someCurrentPageSelected = paginatedCourses.some((c) => selectedIds.includes(c.id)) && !allCurrentPageSelected;

  function toggleSelectAllCurrentPage() {
    const currentPageIds = paginatedCourses.map((c) => c.id);
    if (allCurrentPageSelected) {
      setSelectedIds((prev) => prev.filter((id) => !currentPageIds.includes(id)));
    } else {
      const set = new Set([...selectedIds, ...currentPageIds]);
      setSelectedIds(Array.from(set));
    }
  }

  function toggleSelectOne(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  // Bulk Actions
  async function handleBulkPublish() {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;
    if (!window.confirm(`Publier et mettre en ligne les ${count} formation${count > 1 ? "s" : ""} sélectionnée${count > 1 ? "s" : ""} dans le catalogue ?`)) return;

    setIsBulkActionLoading(true);
    try {
      await adminPublishMultipleCourses(selectedIds);
      setSelectedIds([]);
      router.refresh();
    } catch (err: any) {
      alert(err?.message || "Erreur lors de la publication groupée.");
    } finally {
      setIsBulkActionLoading(false);
    }
  }

  async function handleBulkUnpublish() {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;
    if (!window.confirm(`Retirer ${count} formation${count > 1 ? "s" : ""} du catalogue public et les repasser en brouillon ?`)) return;

    setIsBulkActionLoading(true);
    try {
      await adminUnpublishMultipleCourses(selectedIds);
      setSelectedIds([]);
      router.refresh();
    } catch (err: any) {
      alert(err?.message || "Erreur lors de la dépublication groupée.");
    } finally {
      setIsBulkActionLoading(false);
    }
  }

  async function handleBulkDelete() {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;
    if (!window.confirm(`ATTENTION : Êtes-vous sûr de vouloir supprimer définitivement ${count} formation${count > 1 ? "s" : ""} ?\n\nCette action est irréversible et supprimera également tous les chapitres, leçons et inscriptions associés.`)) return;

    setIsBulkActionLoading(true);
    try {
      await adminDeleteMultipleCourses(selectedIds);
      setSelectedIds([]);
      router.refresh();
    } catch (err: any) {
      alert(err?.message || "Erreur lors de la suppression groupée.");
    } finally {
      setIsBulkActionLoading(false);
    }
  }

  function formatDate(isoString: string) {
    try {
      const date = new Date(isoString);
      const formattedDate = new Intl.DateTimeFormat("fr-DZ", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(date);

      const formattedTime = new Intl.DateTimeFormat("fr-DZ", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);

      return { date: formattedDate, time: formattedTime };
    } catch {
      return { date: "—", time: "" };
    }
  }

  function renderSortIndicator(field: SortField) {
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
      {/* Styles for responsive table/cards and scrollbar */}
      <style>{`
        .table-responsive-wrapper {
          overflow-x: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.2) transparent;
        }
        .table-responsive-wrapper::-webkit-scrollbar {
          height: 6px;
        }
        .table-responsive-wrapper::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.2);
          border-radius: 4px;
        }
        .desktop-table-view {
          display: table;
        }
        .mobile-cards-view {
          display: none;
        }
        @media (max-width: 900px) {
          .desktop-table-view {
            display: none !important;
          }
          .mobile-cards-view {
            display: flex !important;
            flex-direction: column;
            gap: 1rem;
          }
        }
      `}</style>

      {/* Top Filter and Search Bar */}
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
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Rechercher par titre, formateur ou catégorie..."
            value={searchQuery}
            onChange={handleSearchChange}
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
              style={{
                position: "absolute",
                right: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Status Filter Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => handleFilterChange("ALL")}
            style={{
              fontSize: "0.78rem",
              padding: "0.4rem 0.75rem",
              borderRadius: "0.4rem",
              border: statusFilter === "ALL" ? "1px solid var(--brand-blue)" : "1px solid rgba(255,255,255,0.08)",
              background: statusFilter === "ALL" ? "rgba(59,130,246,0.15)" : "transparent",
              color: statusFilter === "ALL" ? "white" : "var(--text-muted)",
              cursor: "pointer",
              fontWeight: statusFilter === "ALL" ? 600 : 400,
            }}
          >
            Tous ({initialCourses.length})
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange("PENDING")}
            style={{
              fontSize: "0.78rem",
              padding: "0.4rem 0.75rem",
              borderRadius: "0.4rem",
              border: statusFilter === "PENDING" ? "1px solid var(--brand-orange)" : "1px solid rgba(255,255,255,0.08)",
              background: statusFilter === "PENDING" ? "rgba(254,145,0,0.15)" : "transparent",
              color: statusFilter === "PENDING" ? "var(--brand-orange)" : "var(--text-muted)",
              cursor: "pointer",
              fontWeight: statusFilter === "PENDING" ? 600 : 400,
            }}
          >
            En attente ({initialCourses.filter((c) => c.status === "PENDING").length})
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange("PUBLISHED")}
            style={{
              fontSize: "0.78rem",
              padding: "0.4rem 0.75rem",
              borderRadius: "0.4rem",
              border: statusFilter === "PUBLISHED" ? "1px solid #34d399" : "1px solid rgba(255,255,255,0.08)",
              background: statusFilter === "PUBLISHED" ? "rgba(52,211,153,0.15)" : "transparent",
              color: statusFilter === "PUBLISHED" ? "#34d399" : "var(--text-muted)",
              cursor: "pointer",
              fontWeight: statusFilter === "PUBLISHED" ? 600 : 400,
            }}
          >
            En ligne ({initialCourses.filter((c) => c.isPublished).length})
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange("REJECTED")}
            style={{
              fontSize: "0.78rem",
              padding: "0.4rem 0.75rem",
              borderRadius: "0.4rem",
              border: statusFilter === "REJECTED" ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.08)",
              background: statusFilter === "REJECTED" ? "rgba(239,68,68,0.15)" : "transparent",
              color: statusFilter === "REJECTED" ? "#ef4444" : "var(--text-muted)",
              cursor: "pointer",
              fontWeight: statusFilter === "REJECTED" ? 600 : 400,
            }}
          >
            Refusés ({initialCourses.filter((c) => c.status === "REJECTED").length})
          </button>
        </div>
      </div>

      {/* Floating Bulk Actions Bar (Publish, Unpublish, Delete) */}
      {selectedIds.length > 0 && (
        <div
          className="glass animate-fade-in"
          style={{
            padding: "0.85rem 1.25rem",
            borderRadius: "0.85rem",
            border: "1px solid rgba(59,130,246,0.35)",
            background: "linear-gradient(135deg, rgba(30,41,59,0.95) 0%, rgba(15,23,42,0.98) 100%)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.75rem",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            position: "sticky",
            top: "80px",
            zIndex: 30,
          }}
        >
          {/* Selected Count */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span
              style={{
                background: "rgba(59,130,246,0.25)",
                color: "#60a5fa",
                fontWeight: 700,
                fontSize: "0.82rem",
                padding: "0.2rem 0.6rem",
                borderRadius: "9999px",
                border: "1px solid rgba(59,130,246,0.4)",
              }}
            >
              {selectedIds.length}
            </span>
            <span style={{ color: "white", fontSize: "0.9rem", fontWeight: 600 }}>
              formation{selectedIds.length > 1 ? "s" : ""} sélectionnée{selectedIds.length > 1 ? "s" : ""}
            </span>
          </div>

          {/* Action Buttons: Publish, Unpublish, Delete, Clear */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            {/* Publish Selected */}
            <button
              type="button"
              onClick={handleBulkPublish}
              disabled={isBulkActionLoading}
              style={{
                background: "#059669",
                color: "white",
                border: "none",
                fontSize: "0.8rem",
                fontWeight: 600,
                padding: "0.45rem 0.85rem",
                borderRadius: "0.4rem",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
              }}
              title="Publier toutes les formations sélectionnées"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
              <span>Publier ({selectedIds.length})</span>
            </button>

            {/* Unpublish Selected */}
            <button
              type="button"
              onClick={handleBulkUnpublish}
              disabled={isBulkActionLoading}
              style={{
                background: "rgba(254,145,0,0.18)",
                color: "var(--brand-orange)",
                border: "1px solid rgba(254,145,0,0.4)",
                fontSize: "0.8rem",
                fontWeight: 600,
                padding: "0.45rem 0.85rem",
                borderRadius: "0.4rem",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
              }}
              title="Retirer les formations sélectionnées du catalogue"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
              <span>Dépublier ({selectedIds.length})</span>
            </button>

            {/* Delete Selected */}
            <button
              type="button"
              onClick={handleBulkDelete}
              disabled={isBulkActionLoading}
              style={{
                background: "#ef4444",
                color: "white",
                border: "none",
                fontSize: "0.8rem",
                fontWeight: 600,
                padding: "0.45rem 0.85rem",
                borderRadius: "0.4rem",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
              }}
              title="Supprimer définitivement les formations sélectionnées"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
              <span>Supprimer ({selectedIds.length})</span>
            </button>

            {/* Deselect All */}
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "var(--text-muted)",
                fontSize: "0.78rem",
                padding: "0.45rem 0.7rem",
                borderRadius: "0.4rem",
                cursor: "pointer",
              }}
            >
              Désélectionner
            </button>
          </div>
        </div>
      )}

      {/* DESKTOP TABLE VIEW */}
      <div className="glass desktop-table-view" style={{ borderRadius: "1.25rem", border: "1px solid var(--border)", overflow: "hidden" }}>
        <div className="table-responsive-wrapper">
          <table style={{ width: "100%", minWidth: "1050px", borderCollapse: "collapse", textAlign: "left", fontSize: "0.88rem" }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "0.82rem" }}>
                {/* Select All Checkbox */}
                <th style={{ padding: "0.75rem 0.5rem 0.75rem 1rem", width: "36px" }}>
                  <input
                    type="checkbox"
                    checked={allCurrentPageSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = someCurrentPageSelected;
                    }}
                    onChange={toggleSelectAllCurrentPage}
                    style={{ cursor: "pointer", width: "15px", height: "15px", accentColor: "#ef4444" }}
                    title="Sélectionner toutes les formations de la page"
                  />
                </th>

                {/* Formation (Sortable) */}
                <th 
                  onClick={() => handleSort("title")}
                  style={{ padding: "0.75rem 0.85rem", fontWeight: 600, cursor: "pointer", userSelect: "none" }}
                >
                  <span>Formation</span>
                  {renderSortIndicator("title")}
                </th>

                {/* Date de création (Sortable) */}
                <th 
                  onClick={() => handleSort("createdAt")}
                  style={{ padding: "0.75rem 0.85rem", fontWeight: 600, cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }}
                >
                  <span>Date de création</span>
                  {renderSortIndicator("createdAt")}
                </th>

                {/* Formateur (Sortable) */}
                <th 
                  onClick={() => handleSort("instructor")}
                  style={{ padding: "0.75rem 0.85rem", fontWeight: 600, cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }}
                >
                  <span>Formateur</span>
                  {renderSortIndicator("instructor")}
                </th>

                {/* Tarif (Sortable) */}
                <th 
                  onClick={() => handleSort("price")}
                  style={{ padding: "0.75rem 0.85rem", fontWeight: 600, cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }}
                >
                  <span>Tarif</span>
                  {renderSortIndicator("price")}
                </th>

                {/* Contenu */}
                <th style={{ padding: "0.75rem 0.85rem", fontWeight: 600, whiteSpace: "nowrap" }}>Contenu</th>

                {/* Inscrits (Sortable) */}
                <th 
                  onClick={() => handleSort("subscribers")}
                  style={{ padding: "0.75rem 0.85rem", fontWeight: 600, cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }}
                >
                  <span>Inscrits</span>
                  {renderSortIndicator("subscribers")}
                </th>

                {/* Statut (Sortable) */}
                <th 
                  onClick={() => handleSort("status")}
                  style={{ padding: "0.75rem 0.85rem", fontWeight: 600, cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }}
                >
                  <span>Statut</span>
                  {renderSortIndicator("status")}
                </th>

                {/* Actions */}
                <th style={{ padding: "0.75rem 1rem", fontWeight: 600, textAlign: "right", whiteSpace: "nowrap" }}>Modération & Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCourses.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                    <div style={{ display: "inline-flex", padding: "0.75rem", borderRadius: "50%", background: "rgba(255,255,255,0.04)", marginBottom: "0.5rem" }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.5 }}>
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                    </div>
                    <div style={{ fontSize: "0.92rem" }}>Aucune formation trouvée avec les critères actuels.</div>
                  </td>
                </tr>
              ) : (
                paginatedCourses.map((c) => {
                  const isSelected = selectedIds.includes(c.id);
                  const isPending = c.status === "PENDING";
                  const isRejected = c.status === "REJECTED";
                  const { date, time } = formatDate(c.createdAt);

                  return (
                    <tr
                      key={c.id}
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        background: isSelected
                          ? "rgba(59, 130, 246, 0.08)"
                          : isPending
                          ? "rgba(254,145,0,0.03)"
                          : undefined,
                        transition: "background 0.15s ease",
                      }}
                    >
                      {/* Checkbox */}
                      <td style={{ padding: "0.75rem 0.5rem 0.75rem 1rem" }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(c.id)}
                          style={{ cursor: "pointer", width: "15px", height: "15px", accentColor: "#ef4444" }}
                        />
                      </td>

                      {/* Course Cover & Title */}
                      <td style={{ padding: "0.75rem 0.85rem", maxWidth: "260px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <div style={{ position: "relative", width: "52px", height: "34px", borderRadius: "0.35rem", overflow: "hidden", flexShrink: 0, background: "#000" }}>
                            {c.imageUrl ? (
                              <Image src={c.imageUrl} alt={c.title} fill style={{ objectFit: "cover" }} />
                            ) : (
                              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "0.65rem" }}>
                                Cours
                              </div>
                            )}
                          </div>
                          <div style={{ minWidth: 0, overflow: "hidden" }}>
                            <Link
                              href={`/courses/${c.id}`}
                              target="_blank"
                              style={{ fontWeight: 600, color: "white", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.25rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "200px" }}
                              className="hover:underline"
                              title={c.title}
                            >
                              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{c.title}</span>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.6, flexShrink: 0 }}>
                                <line x1="7" y1="17" x2="17" y2="7" />
                                <polyline points="7 7 17 7 17 17" />
                              </svg>
                            </Link>
                            <div style={{ fontSize: "0.74rem", color: "var(--brand-blue)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {c.category?.name || "Sans catégorie"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Creation Date */}
                      <td style={{ padding: "0.75rem 0.85rem", whiteSpace: "nowrap" }}>
                        <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#e5e7eb" }}>{date}</div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{time}</div>
                      </td>

                      {/* Instructor info */}
                      <td style={{ padding: "0.75rem 0.85rem", whiteSpace: "nowrap" }}>
                        <div style={{ fontWeight: 600, color: "#e5e7eb", fontSize: "0.82rem" }}>
                          {c.instructor.name || "Inconnu"}
                        </div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis" }} title={c.instructor.email || ""}>
                          {c.instructor.email}
                        </div>
                      </td>

                      {/* Price */}
                      <td style={{ padding: "0.75rem 0.85rem", whiteSpace: "nowrap" }}>
                        <span style={{ fontWeight: 700, color: c.price ? "white" : "#34d399", fontSize: "0.82rem" }}>
                          {c.price ? `${c.price.toLocaleString("fr-DZ")} DZD` : "Gratuit"}
                        </span>
                      </td>

                      {/* Content breakdown */}
                      <td style={{ padding: "0.75rem 0.85rem", color: "var(--text-muted)", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                        {c.chaptersCount} ch. • {c.lessonsCount} leçons
                      </td>

                      {/* Enrollments with Modal */}
                      <td style={{ padding: "0.75rem 0.85rem", whiteSpace: "nowrap" }}>
                        <CourseSubscribersModal
                          courseTitle={c.title}
                          subscribers={c.enrollments}
                        />
                      </td>

                      {/* Status Badge */}
                      <td style={{ padding: "0.75rem 0.85rem", whiteSpace: "nowrap" }}>
                        {c.isPublished ? (
                          <span
                            style={{
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              padding: "0.2rem 0.55rem",
                              borderRadius: "9999px",
                              background: "rgba(52,211,153,0.15)",
                              color: "#34d399",
                              border: "1px solid rgba(52,211,153,0.3)",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.3rem",
                            }}
                          >
                            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#34d399" }}></span>
                            En ligne
                          </span>
                        ) : isPending ? (
                          <span
                            style={{
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              padding: "0.2rem 0.55rem",
                              borderRadius: "9999px",
                              background: "rgba(254,145,0,0.18)",
                              color: "var(--brand-orange)",
                              border: "1px solid rgba(254,145,0,0.4)",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.3rem",
                            }}
                          >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                            En attente
                          </span>
                        ) : isRejected ? (
                          <div>
                            <span
                              style={{
                                fontSize: "0.72rem",
                                fontWeight: 700,
                                padding: "0.2rem 0.55rem",
                                borderRadius: "9999px",
                                background: "rgba(239,68,68,0.15)",
                                color: "#ef4444",
                                border: "1px solid rgba(239,68,68,0.3)",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.3rem",
                              }}
                            >
                              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                              Refusé
                            </span>
                            {c.rejectionReason && (
                              <div style={{ fontSize: "0.7rem", color: "#fca5a5", marginTop: "0.2rem", maxWidth: "160px", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={c.rejectionReason}>
                                « {c.rejectionReason} »
                              </div>
                            )}
                          </div>
                        ) : (
                          <span
                            style={{
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              padding: "0.2rem 0.55rem",
                              borderRadius: "9999px",
                              background: "rgba(255,255,255,0.08)",
                              color: "var(--text-muted)",
                              border: "1px solid rgba(255,255,255,0.15)",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.3rem",
                            }}
                          >
                            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--text-muted)" }}></span>
                            Brouillon
                          </span>
                        )}
                      </td>

                      {/* Moderation & Individual Delete Actions */}
                      <td style={{ padding: "0.75rem 1rem", textAlign: "right", whiteSpace: "nowrap" }}>
                        <AdminCourseModerationActions
                          courseId={c.id}
                          courseTitle={c.title}
                          isPublished={c.isPublished}
                          status={c.status}
                          rejectionReason={c.rejectionReason}
                          onDeleted={() => {
                            setSelectedIds((prev) => prev.filter((id) => id !== c.id));
                          }}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MOBILE CARDS VIEW (Responsive for small screens) */}
      <div className="mobile-cards-view">
        {paginatedCourses.length === 0 ? (
          <div className="glass" style={{ padding: "2.5rem 1rem", textAlign: "center", borderRadius: "1rem", color: "var(--text-muted)" }}>
            Aucune formation trouvée.
          </div>
        ) : (
          paginatedCourses.map((c) => {
            const isSelected = selectedIds.includes(c.id);
            const { date, time } = formatDate(c.createdAt);

            return (
              <div
                key={c.id}
                className="glass"
                style={{
                  borderRadius: "1rem",
                  padding: "1rem",
                  border: isSelected ? "1px solid rgba(59,130,246,0.5)" : "1px solid var(--border)",
                  background: isSelected ? "rgba(59,130,246,0.06)" : undefined,
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                {/* Header: Checkbox + Thumbnail + Title */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelectOne(c.id)}
                    style={{ cursor: "pointer", width: "18px", height: "18px", accentColor: "#ef4444", marginTop: "3px" }}
                  />
                  <div style={{ position: "relative", width: "60px", height: "40px", borderRadius: "0.4rem", overflow: "hidden", flexShrink: 0, background: "#000" }}>
                    {c.imageUrl ? (
                      <Image src={c.imageUrl} alt={c.title} fill style={{ objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "0.65rem" }}>Cours</div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link href={`/courses/${c.id}`} target="_blank" style={{ fontWeight: 700, color: "white", textDecoration: "none", fontSize: "0.95rem" }}>
                      {c.title} ↗
                    </Link>
                    <div style={{ fontSize: "0.75rem", color: "var(--brand-blue)" }}>
                      {c.category?.name || "Sans catégorie"}
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", fontSize: "0.8rem", background: "rgba(255,255,255,0.02)", padding: "0.6rem", borderRadius: "0.5rem" }}>
                  <div>
                    <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.72rem" }}>Formateur</span>
                    <strong style={{ color: "#e5e7eb" }}>{c.instructor.name || "Inconnu"}</strong>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.72rem" }}>Créé le</span>
                    <span style={{ color: "#e5e7eb" }}>{date} ({time})</span>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.72rem" }}>Tarif & Contenu</span>
                    <strong style={{ color: c.price ? "white" : "#34d399" }}>{c.price ? `${c.price} DZD` : "Gratuit"}</strong>
                    <span style={{ color: "var(--text-muted)", marginLeft: "4px" }}>({c.chaptersCount} ch.)</span>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.72rem" }}>Inscrits</span>
                    <CourseSubscribersModal courseTitle={c.title} subscribers={c.enrollments} />
                  </div>
                </div>

                {/* Status + Actions Row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "0.6rem" }}>
                  <div>
                    {c.isPublished ? (
                      <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "0.2rem 0.5rem", borderRadius: "9999px", background: "rgba(52,211,153,0.15)", color: "#34d399", border: "1px solid rgba(52,211,153,0.3)" }}>
                        ● En ligne
                      </span>
                    ) : c.status === "PENDING" ? (
                      <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "0.2rem 0.5rem", borderRadius: "9999px", background: "rgba(254,145,0,0.18)", color: "var(--brand-orange)", border: "1px solid rgba(254,145,0,0.4)" }}>
                        En attente
                      </span>
                    ) : c.status === "REJECTED" ? (
                      <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "0.2rem 0.5rem", borderRadius: "9999px", background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}>
                        Refusé
                      </span>
                    ) : (
                      <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "0.2rem 0.5rem", borderRadius: "9999px", background: "rgba(255,255,255,0.08)", color: "var(--text-muted)" }}>
                        Brouillon
                      </span>
                    )}
                  </div>

                  <AdminCourseModerationActions
                    courseId={c.id}
                    courseTitle={c.title}
                    isPublished={c.isPublished}
                    status={c.status}
                    rejectionReason={c.rejectionReason}
                    onDeleted={() => {
                      setSelectedIds((prev) => prev.filter((id) => id !== c.id));
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* PAGINATION CONTROLS (Optimized for large datasets) */}
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
        {/* Left: Range and Page Size selector */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <span>
            Affichage de <strong>{totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> à{" "}
            <strong>{Math.min(currentPage * pageSize, totalItems)}</strong> sur <strong>{totalItems}</strong> formation{totalItems > 1 ? "s" : ""}
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

        {/* Right: Page Nav Buttons */}
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
            title="Première page"
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
            title="Dernière page"
          >
            »
          </button>
        </div>
      </div>
    </div>
  );
}
