"use client";

import { useState, useMemo, useEffect, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Course, Category, User } from "@prisma/client";
import { CourseCard } from "./CourseCard";

type CourseWithRelations = Course & {
  category: Category | null;
  instructor: User;
  chapters: { _count: { lessons: number } }[];
};

interface CourseCatalogFilterProps {
  initialCourses: CourseWithRelations[];
  categories: Category[];
  ratingsMap: Record<string, { averageRating: number; totalReviews: number }>;
}

export function CourseCatalogFilter({
  initialCourses,
  categories,
  ratingsMap,
}: CourseCatalogFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // URL state initialization
  const initialCategory = searchParams.get("category") || "";
  const initialSearch = searchParams.get("search") || "";
  const initialPrice = searchParams.get("price") || "all";
  const initialSort = searchParams.get("sort") || "recent";

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedPrice, setSelectedPrice] = useState(initialPrice);
  const [selectedSort, setSelectedSort] = useState(initialSort);

  // Synchronize state if URL changes externally
  useEffect(() => {
    setSearchTerm(searchParams.get("search") || "");
    setSelectedCategory(searchParams.get("category") || "");
    setSelectedPrice(searchParams.get("price") || "all");
    setSelectedSort(searchParams.get("sort") || "recent");
  }, [searchParams]);

  // Sync state to URL with debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.set("search", searchTerm.trim());
      if (selectedCategory) params.set("category", selectedCategory);
      if (selectedPrice && selectedPrice !== "all") params.set("price", selectedPrice);
      if (selectedSort && selectedSort !== "recent") params.set("sort", selectedSort);

      const queryString = params.toString();
      const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;

      startTransition(() => {
        router.replace(targetUrl, { scroll: false });
      });
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm, selectedCategory, selectedPrice, selectedSort, pathname, router]);

  // Client-side filtering and sorting for instant responsiveness
  const filteredCourses = useMemo(() => {
    let list = [...initialCourses];

    // Filter by search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter((c) => {
        const titleMatch = c.title?.toLowerCase().includes(q);
        const descMatch = c.description?.toLowerCase().includes(q);
        const instructorMatch = c.instructor?.name?.toLowerCase().includes(q);
        const categoryMatch = c.category?.name?.toLowerCase().includes(q);
        return titleMatch || descMatch || instructorMatch || categoryMatch;
      });
    }

    // Filter by Category
    if (selectedCategory) {
      list = list.filter((c) => c.category?.name === selectedCategory);
    }

    // Filter by Price
    if (selectedPrice === "free") {
      list = list.filter((c) => !c.price || c.price === 0);
    } else if (selectedPrice === "tier1") {
      // Under 3000 DZD
      list = list.filter((c) => (c.price || 0) > 0 && (c.price || 0) < 3000);
    } else if (selectedPrice === "tier2") {
      // 3000 DZD and up
      list = list.filter((c) => (c.price || 0) >= 3000);
    }

    // Sort
    list.sort((a, b) => {
      if (selectedSort === "rating") {
        const ratingA = ratingsMap[a.id]?.averageRating || 0;
        const ratingB = ratingsMap[b.id]?.averageRating || 0;
        if (ratingB !== ratingA) return ratingB - ratingA;
        return (ratingsMap[b.id]?.totalReviews || 0) - (ratingsMap[a.id]?.totalReviews || 0);
      }
      if (selectedSort === "price_asc") {
        return (a.price || 0) - (b.price || 0);
      }
      if (selectedSort === "price_desc") {
        return (b.price || 0) - (a.price || 0);
      }
      // "recent" by default
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return list;
  }, [initialCourses, searchTerm, selectedCategory, selectedPrice, selectedSort, ratingsMap]);

  const hasActiveFilters = !!(
    searchTerm.trim() ||
    selectedCategory ||
    selectedPrice !== "all" ||
    selectedSort !== "recent"
  );

  const resetAllFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedPrice("all");
    setSelectedSort("recent");
  };

  return (
    <div>
      {/* Controls Container */}
      <div
        className="glass"
        style={{
          padding: "1.5rem",
          borderRadius: "1rem",
          marginBottom: "2rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
        }}
      >
        {/* Top Row: Search Input + Sorting */}
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
          {/* Live Search Bar */}
          <div style={{ position: "relative", flex: "1 1 320px" }}>
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                paddingLeft: "1rem",
                display: "flex",
                alignItems: "center",
                pointerEvents: "none",
                color: "#9ca3af",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>

            <input
              type="text"
              placeholder="Rechercher par titre, formateur, mots-clés..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
              style={{
                width: "100%",
                paddingLeft: "2.75rem",
                paddingRight: searchTerm ? "2.5rem" : "1rem",
                backgroundColor: "rgba(0,0,0,0.35)",
                borderColor: "rgba(255,255,255,0.12)",
                height: "2.75rem",
              }}
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  right: "0.75rem",
                  margin: "auto 0",
                  height: "1.5rem",
                  width: "1.5rem",
                  background: "rgba(255,255,255,0.1)",
                  border: "none",
                  borderRadius: "50%",
                  color: "#d1d5db",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.75rem",
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
              Trier par :
            </span>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="input-field"
              style={{
                backgroundColor: "rgba(0,0,0,0.35)",
                borderColor: "rgba(255,255,255,0.12)",
                height: "2.75rem",
                padding: "0 1rem",
                cursor: "pointer",
                color: "white",
              }}
            >
              <option value="recent">⚡ Plus récents (Nouveautés)</option>
              <option value="rating">⭐ Mieux notés</option>
              <option value="price_asc">🏷️ Prix croissant</option>
              <option value="price_desc">💎 Prix décroissant</option>
            </select>
          </div>
        </div>

        {/* Second Row: Category Filter Pills */}
        <div>
          <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginBottom: "0.5rem", fontWeight: 500 }}>
            Catégories :
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            <button
              type="button"
              onClick={() => setSelectedCategory("")}
              style={{
                padding: "0.35rem 0.85rem",
                borderRadius: "9999px",
                fontSize: "0.8125rem",
                fontWeight: 600,
                border: "1px solid",
                cursor: "pointer",
                transition: "all 0.15s ease",
                backgroundColor: selectedCategory === "" ? "var(--brand-blue)" : "rgba(255,255,255,0.05)",
                borderColor: selectedCategory === "" ? "var(--brand-blue)" : "rgba(255,255,255,0.1)",
                color: selectedCategory === "" ? "#ffffff" : "#9ca3af",
              }}
            >
              Toutes les matières ({initialCourses.length})
            </button>

            {categories.map((cat) => {
              const count = initialCourses.filter((c) => c.category?.id === cat.id).length;
              const isSelected = selectedCategory === cat.name;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(isSelected ? "" : cat.name)}
                  style={{
                    padding: "0.35rem 0.85rem",
                    borderRadius: "9999px",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    border: "1px solid",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    backgroundColor: isSelected ? "var(--brand-blue)" : "rgba(255,255,255,0.05)",
                    borderColor: isSelected ? "var(--brand-blue)" : "rgba(255,255,255,0.1)",
                    color: isSelected ? "#ffffff" : "#9ca3af",
                  }}
                >
                  {cat.name} <span style={{ opacity: 0.6, fontSize: "0.75rem" }}>({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Third Row: Price Filter Segmented Buttons */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", paddingTop: "0.5rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginRight: "0.25rem" }}>
              Tarifs :
            </span>
            {[
              { id: "all", label: "Tous les prix" },
              { id: "free", label: "Gratuit" },
              { id: "tier1", label: "< 3 000 DZD" },
              { id: "tier2", label: "≥ 3 000 DZD" },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPrice(p.id)}
                style={{
                  padding: "0.3rem 0.75rem",
                  borderRadius: "0.375rem",
                  fontSize: "0.8125rem",
                  border: "1px solid",
                  cursor: "pointer",
                  backgroundColor: selectedPrice === p.id ? "rgba(0, 160, 220, 0.2)" : "transparent",
                  borderColor: selectedPrice === p.id ? "var(--brand-blue)" : "rgba(255,255,255,0.1)",
                  color: selectedPrice === p.id ? "white" : "#9ca3af",
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetAllFilters}
              style={{
                background: "none",
                border: "none",
                color: "#38bdf8",
                fontSize: "0.8125rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              <span>↺</span> Réinitialiser tous les filtres
            </button>
          )}
        </div>
      </div>

      {/* Active Results Summary */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", padding: "0 0.25rem" }}>
        <div style={{ fontSize: "0.9375rem", color: "#d1d5db" }}>
          {filteredCourses.length === 1 ? (
            <span><strong>1</strong> cours trouvé</span>
          ) : (
            <span><strong>{filteredCourses.length}</strong> cours trouvés</span>
          )}
          {selectedCategory && (
            <span style={{ color: "var(--text-muted)", marginLeft: "0.5rem" }}>
              dans « {selectedCategory} »
            </span>
          )}
        </div>
      </div>

      {/* Course Cards Grid */}
      {filteredCourses.length === 0 ? (
        <div
          className="glass"
          style={{
            padding: "3.5rem 2rem",
            borderRadius: "1rem",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <div
            style={{
              width: "4rem",
              height: "4rem",
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6b7280",
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "white", margin: 0 }}>
            Aucun cours ne correspond à vos critères
          </h3>
          <p style={{ color: "var(--text-muted)", maxWidth: "28rem", margin: 0, fontSize: "0.875rem" }}>
            Essayez de modifier vos filtres de prix, votre catégorie ou d'utiliser d'autres termes de recherche.
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="btn btn-secondary"
              style={{ marginTop: "0.5rem" }}
            >
              Afficher tous les cours
            </button>
          )}
        </div>
      ) : (
        <div className="catalog-list">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              rating={ratingsMap[course.id]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
