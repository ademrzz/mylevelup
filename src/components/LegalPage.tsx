// Gabarit commun des pages légales (CGU, confidentialité, remboursement).
// Composant serveur : pas besoin de "use client".

// ⚠️ À remplacer par ta vraie adresse de contact.
export const LEGAL_CONTACT_EMAIL = "contact@levelupdz.com";

export type LegalSection = {
  heading: string;
  paragraphs: string[];
};

type LegalPageProps = {
  title: string;
  intro?: string;
  updatedAt: string;
  sections: LegalSection[];
};

export default function LegalPage({
  title,
  intro,
  updatedAt,
  sections,
}: LegalPageProps) {
  return (
    <main
      style={{
        maxWidth: 820,
        margin: "0 auto",
        padding: "48px 20px 80px",
        lineHeight: 1.7,
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: 8 }}>{title}</h1>
      <p style={{ opacity: 0.6, fontSize: "0.9rem", marginBottom: 24 }}>
        Dernière mise à jour : {updatedAt}
      </p>

      {intro && (
        <p
          style={{
            padding: "16px 20px",
            borderRadius: 12,
            border: "1px solid var(--border, #e5e5e7)",
            background: "var(--surface, #f5f5f7)",
            marginBottom: 32,
          }}
        >
          {intro}
        </p>
      )}

      {sections.map((section, index) => (
        <section key={section.heading} style={{ marginBottom: 28 }}>
          <h2
            style={{
              fontSize: "1.25rem",
              marginBottom: 10,
              color: "var(--brand-orange, #fe9100)",
            }}
          >
            {index + 1}. {section.heading}
          </h2>
          {section.paragraphs.map((text, i) => (
            <p key={i} style={{ marginBottom: 10 }}>
              {text}
            </p>
          ))}
        </section>
      ))}

      <p style={{ marginTop: 40, opacity: 0.7 }}>
        Une question ? Écrivez-nous à {LEGAL_CONTACT_EMAIL}.
      </p>
    </main>
  );
}