import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Catégories | Level Up DZ",
};

type Category = { name: string; emoji: string; description: string };

// ⚠️ Les noms doivent correspondre EXACTEMENT aux catégories enregistrées
// dans ta base de données (sinon le filtre du catalogue ne trouvera rien).
const categories: Category[] = [
  {
    name: "Lycée (BAC)",
    emoji: "🎓",
    description: "Préparez le baccalauréat avec des cours dans vos matières.",
  },
  {
    name: "CEM (BEM)",
    emoji: "📚",
    description: "Révisez le programme du collège et réussissez le BEM.",
  },
  {
    name: "Université",
    emoji: "🏛️",
    description: "Des formations pour accompagner vos études supérieures.",
  },
  {
    name: "Formation Pro",
    emoji: "🛠️",
    description:
      "Pâtisserie, informatique, artisanat : apprenez un métier concret.",
  },
];

export default function CategoriesPage() {
  return (
    <main
      className="container"
      style={{ padding: "48px 20px 80px" }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: 8 }}>Toutes les catégories</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: 32 }}>
        Choisissez votre filière pour découvrir les formations qui vous
        correspondent.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 16,
        }}
      >
        {categories.map((cat) => (
          <Link
            key={cat.name}
            href={`/courses?category=${encodeURIComponent(cat.name)}`}
            style={{
              display: "block",
              padding: 24,
              borderRadius: 16,
              border: "1px solid var(--border)",
              background: "var(--surface-hover)",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: 8 }}>{cat.emoji}</div>
            <h2 style={{ fontSize: "1.15rem", marginBottom: 6 }}>{cat.name}</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
              {cat.description}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}