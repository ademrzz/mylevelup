import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { HomeHero3DShowcase } from "@/components/HomeHero3DShowcase";

export default async function Home() {
  // Fetch up to 3 featured published courses from database
  let featuredCourses: any[] = [];
  try {
    featuredCourses = await prisma.course.findMany({
      where: { isPublished: true },
      take: 3,
      include: {
        instructor: true,
        category: true,
        chapters: {
          include: {
            lessons: true,
          },
        },
        enrollments: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (e) {
    // Graceful fallback if database query is unavailable
    featuredCourses = [];
  }

  // Fallback showcase courses if none are currently published
  const sampleCourses = [
    {
      id: "demo-patisserie",
      title: "Masterclass Pâtisserie Fine & Gâteaux Traditionnels Algériens",
      instructor: { name: "Chef Amira K." },
      category: { name: "Pâtisserie & Cuisine" },
      price: 4500,
      chaptersCount: 6,
      lessonsCount: 28,
      rating: 4.9,
      studentsCount: 380,
      imageUrl: null,
    },
    {
      id: "demo-design",
      title: "Design Graphique & Identité Visuelle : De Débutant à Pro",
      instructor: { name: "Yacine Benali" },
      category: { name: "Design & Création" },
      price: 5200,
      chaptersCount: 5,
      lessonsCount: 22,
      rating: 4.8,
      studentsCount: 290,
      imageUrl: null,
    },
    {
      id: "demo-dev",
      title: "Développement Web Moderne avec Next.js & React en Algérie",
      instructor: { name: "Mehdi Touati" },
      category: { name: "Tech & Programmation" },
      price: 6000,
      chaptersCount: 8,
      lessonsCount: 36,
      rating: 5.0,
      studentsCount: 420,
      imageUrl: null,
    },
  ];

  return (
    <div style={{ position: "relative", overflow: "hidden" }}>
      {/* Dynamic Background Mesh Glows */}
      <div 
        style={{
          position: "absolute",
          top: "-15%",
          left: "15%",
          width: "55%",
          height: "55%",
          background: "radial-gradient(circle, rgba(254,145,0,0.08) 0%, transparent 70%)",
          zIndex: -1,
          pointerEvents: "none",
        }}
      />
      <div 
        style={{
          position: "absolute",
          top: "40%",
          right: "-10%",
          width: "50%",
          height: "60%",
          background: "radial-gradient(circle, rgba(0,160,220,0.07) 0%, transparent 70%)",
          zIndex: -1,
          pointerEvents: "none",
        }}
      />

      {/* ============================================================ */}
      {/* 1. HERO SECTION WITH 3D INTERACTIVE PLATFORM SHOWCASE */}
      {/* ============================================================ */}
      <section style={{ padding: "4rem 1.5rem 5rem 1.5rem", textAlign: "center" }}>
        <div className="container" style={{ maxWidth: "1200px", margin: "0 auto" }}>
          
          {/* Top Pill Badge */}
          <div 
            style={{
              padding: "0.45rem 1.15rem",
              background: "rgba(254, 145, 0, 0.08)",
              borderRadius: "9999px",
              fontSize: "0.85rem",
              fontWeight: 700,
              color: "var(--brand-orange)",
              marginBottom: "1.75rem",
              border: "1px solid rgba(254, 145, 0, 0.28)",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              boxShadow: "0 2px 10px rgba(254,145,0,0.1)"
            }}
          >
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--brand-orange)", display: "inline-block" }} />
            <span>Plateforme N°1 d'E-Learning Professionnel en Algérie</span>
          </div>
          
          {/* Main Headline */}
          <h1 
            style={{ 
              fontSize: "clamp(2.75rem, 5.5vw, 4.75rem)", 
              lineHeight: 1.12, 
              letterSpacing: "-0.04em",
              maxWidth: "920px",
              margin: "0 auto 1.5rem auto",
              fontWeight: 800,
              color: "white"
            }}
          >
            Développez vos compétences, <br />
            <span className="text-gradient">construisez votre avenir.</span>
          </h1>
          
          {/* Subtitle */}
          <p 
            style={{ 
              fontSize: "clamp(1.05rem, 2vw, 1.25rem)", 
              color: "#9ca3af", 
              maxWidth: "680px",
              margin: "0 auto 2.5rem auto",
              lineHeight: 1.6
            }}
          >
            Level Up DZ est la plateforme de référence en Algérie pour maîtriser la pâtisserie, 
            le design, le développement web et bien plus. Apprenez à votre rythme, où que vous soyez.
          </p>
          
          {/* The 2 Meaningful Differentiated Action Buttons */}
          <div 
            style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              gap: "1rem", 
              flexWrap: "wrap",
              marginBottom: "3rem" 
            }}
          >
            {/* Primary Action Button: Explore Catalog */}
            <Link 
              href="/courses" 
              className="btn btn-primary" 
              style={{ 
                padding: "0.9rem 2.25rem", 
                fontSize: "1.05rem",
                fontWeight: 700,
                background: "var(--gradient-orange)",
                border: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.6rem",
                boxShadow: "0 6px 25px rgba(254,145,0,0.35)",
                textDecoration: "none"
              }}
            >
              <span>Explorer le catalogue</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>

            {/* Secondary Action Button: Become Teacher / Register */}
            <Link 
              href="/dashboard/profile" 
              className="btn btn-secondary" 
              style={{ 
                padding: "0.9rem 2rem", 
                fontSize: "1.05rem",
                fontWeight: 600,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "white",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.55rem",
                textDecoration: "none"
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand-orange)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
              <span>Devenir formateur</span>
            </Link>
          </div>

          {/* Quick Categories Filter Chips */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "3rem" }}>
            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginRight: "0.25rem" }}>Populaire :</span>
            {[
              { label: "Pâtisserie", href: "/courses" },
              { label: "Design Graphique", href: "/courses" },
              { label: "Développement Web", href: "/courses" },
              { label: "Marketing Digital", href: "/courses" },
              { label: "Artisanat", href: "/courses" },
            ].map((chip, idx) => (
              <Link
                key={idx}
                href={chip.href}
                style={{
                  fontSize: "0.78rem",
                  padding: "0.3rem 0.75rem",
                  borderRadius: "9999px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#d1d5db",
                  textDecoration: "none",
                  transition: "all 0.15s ease",
                }}
                className="hover:border-white/30 hover:text-white"
              >
                {chip.label}
              </Link>
            ))}
          </div>

          {/* 3D Interactive Animated Platform Showcase */}
          <HomeHero3DShowcase />

        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. TRUST PROOF & METRICS STRIP */}
      {/* ============================================================ */}
      <section style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", background: "rgba(255,255,255,0.015)", padding: "2.5rem 1.5rem" }}>
        <div className="container" style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div 
            style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", 
              gap: "2rem",
              textAlign: "center"
            }}
          >
            {/* Stat 1 */}
            <div>
              <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "white", marginBottom: "0.25rem" }}>
                69 <span style={{ color: "var(--brand-orange)" }}>Wilayas</span>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", margin: 0 }}>
                Accessible partout en Algérie sur mobile & PC
              </p>
            </div>

            {/* Stat 2 */}
            <div>
              <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "white", marginBottom: "0.25rem" }}>
                100% <span style={{ color: "#34d399" }}>DZD</span>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", margin: 0 }}>
                Paiement local via BaridiMob & EDAHABIA / CIB
              </p>
            </div>

            {/* Stat 3 */}
            <div>
              <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "white", marginBottom: "0.25rem" }}>
                Certificats <span style={{ color: "var(--brand-blue)" }}>PDF</span>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", margin: 0 }}>
                Attestations téléchargeables avec identifiant unique
              </p>
            </div>

            {/* Stat 4 */}
            <div>
              <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "white", marginBottom: "0.25rem" }}>
                Accès <span style={{ color: "#c084fc" }}>À vie</span>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", margin: 0 }}>
                Révisez vos cours et vidéos 24h/24 sans limite
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. DOMAINES & CATÉGORIES POPULAIRES */}
      {/* ============================================================ */}
      <section style={{ padding: "5rem 1.5rem" }}>
        <div className="container" style={{ maxWidth: "1200px", margin: "0 auto" }}>
          
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <span style={{ fontSize: "0.82rem", color: "var(--brand-orange)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "0.35rem" }}>
              Explorez par passion & métier
            </span>
            <h2 style={{ fontSize: "2.25rem", fontWeight: 800, color: "white", margin: 0 }}>
              Domaines d'expertise les plus demandés
            </h2>
          </div>

          <div 
            style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", 
              gap: "1.5rem" 
            }}
          >
            {[
              {
                title: "Pâtisserie & Arts Culinaires",
                desc: "Gâteaux traditionnels algériens, viennoiseries, entremets modernes et techniques de chefs.",
                tag: "Populaire en Algérie",
                iconColor: "var(--brand-orange)",
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a5 5 0 0 0-5 5c0 2.76 2.24 5 5 5s5-2.24 5-5a5 5 0 0 0-5-5z" /><path d="M19 17v4H5v-4" /><path d="M2 17h20" /></svg>
                )
              },
              {
                title: "Design Graphique & 3D",
                desc: "Photoshop, Illustrator, Blender, identités visuelles pour marques et création de packaging.",
                tag: "Haute demande",
                iconColor: "var(--brand-blue)",
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>
                )
              },
              {
                title: "Développement Web & Tech",
                desc: "HTML, CSS, React, Next.js, bases de données et conception de plateformes web complètes.",
                tag: "Carrière & Freelance",
                iconColor: "#34d399",
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
                )
              },
              {
                title: "E-Commerce & Vente Locale",
                desc: "Lancer sa boutique en ligne en Algérie, gestion des stocks, livraison 69 wilayas et publicité.",
                tag: "Entrepreneuriat",
                iconColor: "#f59e0b",
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
                )
              },
              {
                title: "Marketing Digital & Réseaux Sociaux",
                desc: "Création de contenu Instagram & TikTok, Meta Ads, gestion de communauté et branding.",
                tag: "Indispensable",
                iconColor: "#c084fc",
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" /></svg>
                )
              },
              {
                title: "Artisanat, Couture & Décoration",
                desc: "Savoir-faire traditionnel algérien, confection artisanale, résine époxy et broderie.",
                tag: "Projets à domicile",
                iconColor: "#f43f5e",
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><line x1="20" y1="4" x2="8.12" y2="15.88" /><line x1="14.47" y1="14.48" x2="20" y2="20" /><line x1="8.12" y1="8.12" x2="12" y2="12" /></svg>
                )
              },
            ].map((cat, idx) => (
              <Link 
                key={idx}
                href="/courses"
                className="glass"
                style={{
                  borderRadius: "1.25rem",
                  padding: "1.75rem",
                  border: "1px solid var(--border)",
                  textDecoration: "none",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
                    <div 
                      style={{ 
                        width: "48px", 
                        height: "48px", 
                        borderRadius: "0.75rem", 
                        background: "rgba(255,255,255,0.04)", 
                        border: "1px solid rgba(255,255,255,0.08)",
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center",
                        color: cat.iconColor,
                      }}
                    >
                      {cat.icon}
                    </div>

                    <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "0.2rem 0.55rem", borderRadius: "9999px", background: "rgba(255,255,255,0.06)", color: "var(--text-muted)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      {cat.tag}
                    </span>
                  </div>

                  <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "white", margin: "0 0 0.5rem 0" }}>
                    {cat.title}
                  </h3>

                  <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", lineHeight: 1.5, margin: 0 }}>
                    {cat.desc}
                  </p>
                </div>

                <div style={{ marginTop: "1.5rem", display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--brand-orange)", fontSize: "0.85rem", fontWeight: 600 }}>
                  <span>Découvrir les formations</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. FORMATIONS EN VEDETTE (DYNAMIQUES DEPUIS LA BASE) */}
      {/* ============================================================ */}
      <section style={{ padding: "4rem 1.5rem 5rem 1.5rem", background: "rgba(0,0,0,0.25)" }}>
        <div className="container" style={{ maxWidth: "1200px", margin: "0 auto" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem", marginBottom: "3rem" }}>
            <div>
              <span style={{ fontSize: "0.82rem", color: "var(--brand-orange)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "0.35rem" }}>
                Top Sélections
              </span>
              <h2 style={{ fontSize: "2.25rem", fontWeight: 800, color: "white", margin: 0 }}>
                Formations recommandées pour vous
              </h2>
            </div>

            <Link 
              href="/courses" 
              style={{ 
                color: "var(--brand-orange)", 
                fontSize: "0.92rem", 
                fontWeight: 600, 
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem"
              }}
              className="hover:underline"
            >
              <span>Voir tout le catalogue ({featuredCourses.length > 0 ? "En ligne" : "Disponible"})</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
            </Link>
          </div>

          <div 
            style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", 
              gap: "2rem" 
            }}
          >
            {(featuredCourses.length > 0 ? featuredCourses : sampleCourses).map((course: any, idx: number) => {
              const chaptersTotal = course.chapters ? course.chapters.length : (course.chaptersCount || 0);
              const lessonsTotal = course.chapters 
                ? course.chapters.reduce((sum: number, ch: any) => sum + (ch.lessons ? ch.lessons.length : 0), 0)
                : (course.lessonsCount || 0);

              return (
                <div 
                  key={course.id || idx}
                  className="glass"
                  style={{
                    borderRadius: "1.25rem",
                    overflow: "hidden",
                    border: "1px solid var(--border)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    transition: "transform 0.2s ease, border-color 0.2s ease",
                  }}
                >
                  <div>
                    {/* Course Image / Mockup banner */}
                    <div 
                      style={{ 
                        position: "relative", 
                        height: "190px", 
                        width: "100%", 
                        background: "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                      }}
                    >
                      {course.imageUrl ? (
                        <Image src={course.imageUrl} alt={course.title} fill style={{ objectFit: "cover" }} />
                      ) : (
                        <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
                          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.5, marginBottom: "0.5rem" }}>
                            <polygon points="5 3 19 12 5 21 5 3" />
                          </svg>
                          <div style={{ fontSize: "0.8rem", fontWeight: 600 }}>Formation Vidéo HD</div>
                        </div>
                      )}

                      {/* Category Badge overlay */}
                      <span 
                        style={{ 
                          position: "absolute", 
                          top: "1rem", 
                          left: "1rem", 
                          background: "rgba(0,0,0,0.75)", 
                          backdropFilter: "blur(6px)",
                          color: "white", 
                          fontSize: "0.75rem", 
                          fontWeight: 700, 
                          padding: "0.25rem 0.65rem", 
                          borderRadius: "9999px",
                          border: "1px solid rgba(255,255,255,0.15)"
                        }}
                      >
                        {course.category?.name || "Formation"}
                      </span>
                    </div>

                    {/* Content padding */}
                    <div style={{ padding: "1.5rem" }}>
                      <div style={{ fontSize: "0.8rem", color: "var(--brand-orange)", fontWeight: 600, marginBottom: "0.35rem" }}>
                        Formateur : {course.instructor?.name || "Expert Certifié"}
                      </div>

                      <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "white", lineHeight: 1.35, margin: "0 0 0.75rem 0" }}>
                        {course.title}
                      </h3>

                      <div style={{ display: "flex", alignItems: "center", gap: "1rem", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                        <span>{chaptersTotal} chapitres</span>
                        <span>•</span>
                        <span>{lessonsTotal} leçons</span>
                        <span>•</span>
                        <span style={{ color: "#34d399", fontWeight: 600 }}>69 Wilayas</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Price & Link */}
                  <div 
                    style={{ 
                      padding: "1rem 1.5rem", 
                      borderTop: "1px solid var(--border)", 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "space-between",
                      background: "rgba(255,255,255,0.01)" 
                    }}
                  >
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Tarif unique</span>
                      <strong style={{ fontSize: "1.15rem", color: "white" }}>
                        {course.price ? `${course.price.toLocaleString("fr-DZ")} DZD` : "Gratuit"}
                      </strong>
                    </div>

                    <Link 
                      href={course.id && !course.id.startsWith("demo-") ? `/courses/${course.id}` : "/courses"}
                      className="btn btn-outline"
                      style={{ fontSize: "0.85rem", padding: "0.45rem 1rem", borderColor: "rgba(254,145,0,0.4)", color: "var(--brand-orange)" }}
                    >
                      Détails du cours →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. POURQUOI CHOISIR LEVEL UP DZ (AVANTAGES CONCRETS) */}
      {/* ============================================================ */}
      <section style={{ padding: "5rem 1.5rem" }}>
        <div className="container" style={{ maxWidth: "1200px", margin: "0 auto" }}>
          
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <span style={{ fontSize: "0.82rem", color: "var(--brand-orange)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "0.35rem" }}>
              L'excellence à l'algérienne
            </span>
            <h2 style={{ fontSize: "2.25rem", fontWeight: 800, color: "white", margin: 0 }}>
              Pourquoi des milliers d'élèves choisissent Level Up DZ
            </h2>
          </div>

          <div 
            style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", 
              gap: "2rem" 
            }}
          >
            {/* Feature 1 */}
            <div className="glass" style={{ padding: "2rem", borderRadius: "1.25rem", border: "1px solid var(--border)" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "0.75rem", background: "rgba(254,145,0,0.12)", color: "var(--brand-orange)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
              </div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "white", marginBottom: "0.5rem" }}>
                Paiement 100% Local Sécurisé
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.5, margin: 0 }}>
                Inscrivez-vous directement en Dinars avec <strong>BaridiMob</strong>, compte CCP ou carte EDAHABIA / CIB sans tracas de devises étrangères.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass" style={{ padding: "2rem", borderRadius: "1.25rem", border: "1px solid var(--border)" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "0.75rem", background: "rgba(52,211,153,0.12)", color: "#34d399", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
              </div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "white", marginBottom: "0.5rem" }}>
                Formateurs Experts du Métier
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.5, margin: 0 }}>
                Des professionnels actifs en Algérie qui partagent des compétences concrètes, immédiatement applicables sur le marché du travail.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass" style={{ padding: "2rem", borderRadius: "1.25rem", border: "1px solid var(--border)" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "0.75rem", background: "rgba(0,160,220,0.12)", color: "var(--brand-blue)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></svg>
              </div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "white", marginBottom: "0.5rem" }}>
                Certificat Officiel Vérifiable
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.5, margin: 0 }}>
                Obtenez à la fin de chaque cours une attestation de réussite officielle avec identifiant unique pour enrichir votre CV et profil LinkedIn.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="glass" style={{ padding: "2rem", borderRadius: "1.25rem", border: "1px solid var(--border)" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "0.75rem", background: "rgba(192,132,252,0.12)", color: "#c084fc", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
              </div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "white", marginBottom: "0.5rem" }}>
                Plateforme Fluide & Vidéos HD
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.5, margin: 0 }}>
                Lecteur vidéo ultra-rapide optimisé pour les connexions algériennes, reprise automatique de lecture et suivi pas à pas de votre progression.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. TÉMOIGNAGES CLIENTS & RETOURS D'EXPÉRIENCE */}
      {/* ============================================================ */}
      <section style={{ padding: "4rem 1.5rem 5rem 1.5rem", background: "rgba(255,255,255,0.015)" }}>
        <div className="container" style={{ maxWidth: "1200px", margin: "0 auto" }}>
          
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <span style={{ fontSize: "0.82rem", color: "var(--brand-orange)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "0.35rem" }}>
              Témoignages
            </span>
            <h2 style={{ fontSize: "2.25rem", fontWeight: 800, color: "white", margin: 0 }}>
              Ce que disent nos apprenants
            </h2>
          </div>

          <div 
            style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", 
              gap: "2rem" 
            }}
          >
            {/* Review 1 */}
            <div className="glass" style={{ padding: "2rem", borderRadius: "1.25rem", border: "1px solid var(--border)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <p style={{ color: "#e5e7eb", fontSize: "0.95rem", lineHeight: 1.6, fontStyle: "italic", marginBottom: "1.5rem" }}>
                « Grâce à la masterclass de pâtisserie sur Level Up DZ, j'ai pu perfectionner mes gâteaux traditionnels et lancer ma propre activité de commandes à domicile à Alger. Le paiement BaridiMob était super simple ! »
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--brand-orange)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "white" }}>
                  YM
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: "white", fontSize: "0.9rem" }}>Yasmina M.</div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>Apprenante • Alger</div>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="glass" style={{ padding: "2rem", borderRadius: "1.25rem", border: "1px solid var(--border)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <p style={{ color: "#e5e7eb", fontSize: "0.95rem", lineHeight: 1.6, fontStyle: "italic", marginBottom: "1.5rem" }}>
                « Enfin une vraie plateforme e-learning pensée pour nous en Algérie ! Des cours clairs, pas de blabla inutile, et j'ai téléchargé mon certificat directement après avoir terminé le dernier chapitre. Bravo à l'équipe. »
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--brand-blue)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "white" }}>
                  KB
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: "white", fontSize: "0.9rem" }}>Karim B.</div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>Étudiant en Design • Oran</div>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="glass" style={{ padding: "2rem", borderRadius: "1.25rem", border: "1px solid var(--border)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <p style={{ color: "#e5e7eb", fontSize: "0.95rem", lineHeight: 1.6, fontStyle: "italic", marginBottom: "1.5rem" }}>
                « En tant qu'enseignant, pouvoir publier mes formations et recevoir les inscriptions de toute l'Algérie est une opportunité formidable. Le tableau de bord et le suivi des élèves sont extrêmement bien conçus. »
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#059669", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "white" }}>
                  ST
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: "white", fontSize: "0.9rem" }}>Sofiane T.</div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>Formateur Web • Constantine</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 7. PRE-FOOTER CALL TO ACTION */}
      {/* ============================================================ */}
      <section style={{ padding: "6rem 1.5rem" }}>
        <div className="container" style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div 
            className="glass"
            style={{
              borderRadius: "2rem",
              padding: "4rem 2.5rem",
              border: "1px solid rgba(254,145,0,0.35)",
              background: "linear-gradient(135deg, rgba(254,145,0,0.06) 0%, rgba(0,160,220,0.06) 100%)",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 25px 60px rgba(0,0,0,0.5)"
            }}
          >
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, color: "white", marginBottom: "1rem", lineHeight: 1.2 }}>
              Prêt à propulser votre carrière ou votre passion ?
            </h2>
            <p style={{ color: "#9ca3af", fontSize: "1.1rem", maxWidth: "600px", margin: "0 auto 2.5rem auto", lineHeight: 1.6 }}>
              Créez votre compte gratuitement dès aujourd'hui et commencez à apprendre avec les meilleurs spécialistes en Algérie.
            </p>

            <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
              <Link 
                href="/register" 
                className="btn btn-primary"
                style={{
                  padding: "0.95rem 2.5rem",
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  background: "var(--gradient-orange)",
                  textDecoration: "none",
                  boxShadow: "0 6px 20px rgba(254,145,0,0.4)"
                }}
              >
                Créer mon compte gratuit
              </Link>
              <Link 
                href="/courses" 
                className="btn btn-outline"
                style={{
                  padding: "0.95rem 2rem",
                  fontSize: "1.05rem",
                  fontWeight: 600,
                  textDecoration: "none"
                }}
              >
                Parcourir les formations
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
