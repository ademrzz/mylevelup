"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function DashboardSidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Mes Cours", icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
      </svg>
    )},
    { href: "/dashboard/profile", label: "Mon Profil", icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    )},
    { href: "/dashboard/certificates", label: "Certificats", icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="8" r="7"></circle>
        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
      </svg>
    )}
  ];

  return (
    <aside className="dashboard-sidebar">
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, paddingLeft: '1rem', marginBottom: '1rem', color: 'white' }}>Tableau de bord</h2>
      <nav>
        {links.map(link => {
          const isActive = pathname === link.href;
          return (
            <Link 
              key={link.href} 
              href={link.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                background: isActive ? 'rgba(0,160,220,0.1)' : 'transparent',
                color: isActive ? 'var(--brand-blue)' : 'var(--text-muted)',
                fontWeight: isActive ? 600 : 500,
                transition: 'all 0.2s ease'
              }}
            >
              {link.icon}
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
