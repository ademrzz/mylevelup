"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Category } from "@prisma/client";

export function CatalogSearch({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category") || "";
  const currentSearch = searchParams.get("search") || "";

  const [searchTerm, setSearchTerm] = useState(currentSearch);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Live search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only update URL if searchTerm is different from currentSearch
      if (searchTerm !== currentSearch) {
        updateUrl(currentCategory, searchTerm);
      }
    }, 400); // 400ms delay

    return () => clearTimeout(timer);
  }, [searchTerm, currentCategory, currentSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl(currentCategory, searchTerm);
  };

  const handleCategorySelect = (categoryName: string) => {
    setIsCategoryOpen(false);
    updateUrl(categoryName, searchTerm);
  };

  const updateUrl = (category: string, search: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (category) {
      params.set("category", category);
    } else {
      params.delete("category");
    }

    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
  );

  return (
    <div className="catalog-search" style={{ display: 'flex', gap: '1rem', width: '100%', flexWrap: 'wrap' }}>
      {/* Category Dropdown (Scalable for many categories) */}
      <div ref={dropdownRef} style={{ position: 'relative', minWidth: '250px', flex: '1 1 250px' }}>
        <button 
          type="button"
          onClick={() => setIsCategoryOpen(!isCategoryOpen)}
          className="input-field"
          style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1c1c1e', borderColor: 'rgba(255,255,255,0.1)', cursor: 'pointer', textAlign: 'left', color: currentCategory ? 'white' : '#6b7280' }}
        >
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentCategory || "Toutes les catégories"}
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: isCategoryOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>

        {isCategoryOpen && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '0.5rem', backgroundColor: '#1c1c1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', boxShadow: 'var(--shadow-lg)', zIndex: 50, display: 'flex', flexDirection: 'column' }}>
            {/* Category internal search (for when there are many categories) */}
            <div style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <input 
                type="text" 
                placeholder="Chercher une catégorie..." 
                value={categorySearchTerm}
                onChange={(e) => setCategorySearchTerm(e.target.value)}
                style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.25rem', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.875rem', outline: 'none' }}
                onClick={(e) => e.stopPropagation()} // Prevent closing dropdown
              />
            </div>
            
            <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
              <button
                type="button"
                onClick={() => handleCategorySelect("")}
                style={{ width: '100%', textAlign: 'left', padding: '0.75rem 1rem', background: currentCategory === "" ? 'rgba(0,160,220,0.1)' : 'transparent', border: 'none', color: currentCategory === "" ? 'var(--brand-blue)' : 'white', cursor: 'pointer', fontSize: '0.875rem' }}
              >
                Toutes les catégories
              </button>
              {filteredCategories.length === 0 ? (
                <div style={{ padding: '0.75rem 1rem', color: '#6b7280', fontSize: '0.875rem', textAlign: 'center' }}>Aucune catégorie trouvée</div>
              ) : (
                filteredCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleCategorySelect(category.name)}
                    style={{ width: '100%', textAlign: 'left', padding: '0.75rem 1rem', background: currentCategory === category.name ? 'rgba(0,160,220,0.1)' : 'transparent', border: 'none', color: currentCategory === category.name ? 'var(--brand-blue)' : 'white', cursor: 'pointer', fontSize: '0.875rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    {category.name}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Search Input */}
      <form onSubmit={handleSearch} style={{ position: 'relative', flex: '1 1 400px', display: 'flex' }}>
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, paddingLeft: '1rem', display: 'flex', alignItems: 'center', pointerEvents: 'none', color: '#6b7280' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
        <input 
          type="text" 
          placeholder="Rechercher un cours par titre..." 
          className="input-field"
          style={{ width: '100%', paddingLeft: '3rem', backgroundColor: '#1c1c1e', borderColor: 'rgba(255,255,255,0.1)', boxShadow: 'var(--shadow-lg)', borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit" className="btn btn-secondary" style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.1)', borderLeft: 'none', color: 'white' }}>
          Rechercher
        </button>
      </form>
    </div>
  );
}
