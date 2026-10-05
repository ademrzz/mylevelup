export default function Home() {
  return (
    <div style={{ position: "relative", overflow: "hidden" }}>
      {/* Subtle Background Glows for Apple-like vibe */}
      <div 
        style={{
          position: "absolute",
          top: "-20%",
          left: "-10%",
          width: "50%",
          height: "60%",
          background: "radial-gradient(circle, rgba(254,145,0,0.08) 0%, transparent 70%)",
          zIndex: -1,
        }}
      />
      <div 
        style={{
          position: "absolute",
          bottom: "-10%",
          right: "-10%",
          width: "60%",
          height: "60%",
          background: "radial-gradient(circle, rgba(0,160,220,0.06) 0%, transparent 70%)",
          zIndex: -1,
        }}
      />

      <div className="container py-20 flex flex-col items-center justify-center text-center animate-fade-up" style={{ minHeight: "80vh" }}>
        <div 
          className="delay-100"
          style={{
            padding: "0.5rem 1rem",
            background: "var(--surface-hover)",
            borderRadius: "var(--radius-full)",
            fontSize: "0.9rem",
            fontWeight: 600,
            color: "var(--brand-orange)",
            marginBottom: "2rem",
            border: "1px solid var(--border)",
            display: "inline-block",
            animationFillMode: "both"
          }}
        >
          Nouveau — Apprenez avec les meilleurs experts
        </div>
        
        <h1 
          className="delay-200"
          style={{ 
            fontSize: "clamp(3rem, 6vw, 5rem)", 
            lineHeight: 1.1, 
            letterSpacing: "-0.04em",
            maxWidth: "900px",
            marginBottom: "1.5rem"
          }}
        >
          Développez vos compétences, <br />
          <span className="text-gradient">construisez votre avenir.</span>
        </h1>
        
        <p 
          className="delay-200"
          style={{ 
            fontSize: "1.25rem", 
            color: "var(--text-muted)", 
            maxWidth: "600px",
            marginBottom: "3rem",
            lineHeight: 1.6
          }}
        >
          Level Up DZ est la plateforme de référence en Algérie pour maîtriser la pâtisserie, 
          le design, et bien plus. Apprenez à votre rythme, où que vous soyez.
        </p>
        
        <div className="flex items-center justify-center gap-4 delay-200" style={{ flexWrap: "wrap" }}>
          <button className="btn btn-primary" style={{ padding: "1rem 2rem", fontSize: "1.1rem" }}>
            Explorer les formations
          </button>
          <button className="btn btn-secondary" style={{ padding: "1rem 2rem", fontSize: "1.1rem" }}>
            Voir le catalogue
          </button>
        </div>

        {/* Abstract mockup representation below hero */}
        <div 
          className="mt-16 w-full glass delay-200"
          style={{
            height: "400px",
            borderRadius: "1.5rem",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-lg)",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-muted)"
          }}
        >
          <span style={{ fontSize: "1.5rem", fontWeight: 600, opacity: 0.5 }}>
            Aperçu de la plateforme
          </span>
        </div>
      </div>
    </div>
  );
}
