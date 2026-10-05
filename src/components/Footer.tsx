import Link from "next/link";
import Image from "next/image";
import logoLong from "@/logo/logolong.png";

export default function Footer() {
  return (
    <footer style={{ backgroundColor: "var(--surface-hover)", borderTop: "1px solid var(--border)" }}>
      <div className="container py-20">
        <div className="flex justify-between" style={{ flexWrap: "wrap", gap: "3rem" }}>
          
          <div style={{ maxWidth: "300px" }}>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image 
                src={logoLong} 
                alt="Level Up DZ Logo" 
                width={160} 
                height={45} 
                style={{ objectFit: "contain" }}
              />
            </Link>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
              Développez vos compétences, construisez votre avenir avec la meilleure plateforme e-learning en Algérie.
            </p>
          </div>

          <div className="flex gap-16">
            <div>
              <h4 style={{ fontWeight: 600, marginBottom: "1.25rem", fontSize: "0.95rem" }}>Plateforme</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <li><Link href="/courses" style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>Tous les cours</Link></li>
                <li><Link href="/categories" style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>Catégories</Link></li>
              </ul>
            </div>

            <div>
              <h4 style={{ fontWeight: 600, marginBottom: "1.25rem", fontSize: "0.95rem" }}>Légal</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <li><Link href="/cgu" style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>Conditions générales</Link></li>
                <li><Link href="/privacy" style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>Confidentialité</Link></li>
                <li><Link href="/refund" style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>Remboursement</Link></li>
              </ul>
            </div>
          </div>

        </div>

        <div className="flex items-center justify-between mt-16 pt-8" style={{ borderTop: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "0.9rem" }}>
          <p>© {new Date().getFullYear()} Level Up DZ. Tous droits réservés.</p>
          <div className="flex gap-4">
            <span>FR</span>
            <span>AR</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
