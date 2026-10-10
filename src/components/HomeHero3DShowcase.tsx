"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export function HomeHero3DShowcase() {
  const [rotateX, setRotateX] = useState(6);
  const [rotateY, setRotateY] = useState(-8);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse tilt tracking
  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within element
    const y = e.clientY - rect.top;  // y position within element

    // Calculate rotation (-12 to 12 degrees)
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotX = ((y - centerY) / centerY) * -10;
    const rotY = ((x - centerX) / centerX) * 12;

    setRotateX(rotX);
    setRotateY(rotY);
  }

  function handleMouseLeave() {
    setIsHovered(false);
    // Smooth reset to gentle aesthetic default isometric angle
    setRotateX(6);
    setRotateY(-8);
  }

  return (
    <div 
      style={{ 
        perspective: "1200px", 
        width: "100%", 
        maxWidth: "1050px", 
        margin: "2rem auto 0 auto",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          width: "100%",
          transformStyle: "preserve-3d",
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transition: isHovered ? "transform 0.08s ease-out" : "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
          position: "relative",
          cursor: "pointer",
        }}
      >
        {/* Ambient 3D Spotlight Behind Platform */}
        <div 
          style={{
            position: "absolute",
            inset: "-15px",
            background: "radial-gradient(ellipse at 50% 50%, rgba(254,145,0,0.18) 0%, rgba(0,160,220,0.12) 50%, transparent 80%)",
            filter: "blur(40px)",
            transform: "translateZ(-30px)",
            borderRadius: "2rem",
            pointerEvents: "none",
          }}
        />

        {/* MAIN CONSOLE CARD (The Core Glass Platform) */}
        <div
          className="glass"
          style={{
            borderRadius: "1.5rem",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            background: "linear-gradient(135deg, rgba(22, 27, 34, 0.95) 0%, rgba(13, 17, 23, 0.98) 100%)",
            boxShadow: "0 30px 70px rgba(0, 0, 0, 0.7), 0 0 40px rgba(254, 145, 0, 0.08)",
            overflow: "hidden",
            transform: "translateZ(0px)",
            position: "relative",
          }}
        >
          {/* Top Window Bar */}
          <div 
            style={{ 
              padding: "0.85rem 1.25rem", 
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "rgba(255, 255, 255, 0.02)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#f59e0b", display: "inline-block" }} />
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "0.75rem", fontFamily: "monospace" }}>
                levelup.dz/courses/patisserie-algerienne/learn
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.72rem", background: "rgba(52,211,153,0.15)", color: "#34d399", padding: "0.2rem 0.55rem", borderRadius: "9999px", fontWeight: 700, border: "1px solid rgba(52,211,153,0.3)" }}>
                ● En direct 1080p HD
              </span>
            </div>
          </div>

          {/* Main Visual Display (Video Player Mockup) */}
          <div 
            style={{ 
              height: "380px", 
              position: "relative", 
              background: "linear-gradient(180deg, #090d16 0%, #030712 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {/* Background Pattern Grid */}
            <div 
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
                opacity: 0.6,
              }}
            />

            {/* Platform Central Video Simulation Content */}
            <div style={{ textAlign: "center", zIndex: 2, padding: "2rem" }}>
              <div 
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "50%",
                  background: "var(--gradient-orange)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1.25rem auto",
                  boxShadow: "0 0 35px rgba(254,145,0,0.5)",
                  transition: "transform 0.2s ease",
                  transform: isHovered ? "scale(1.1)" : "scale(1)",
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1" style={{ marginLeft: "4px" }}>
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>

              <span style={{ fontSize: "0.8rem", color: "var(--brand-orange)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Leçon 03 • Techniques Avancées
              </span>
              <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "white", margin: "0.35rem 0 0.5rem 0" }}>
                Maîtrise du Façonnage & Pâte Traditionnelle
              </h2>
              <p style={{ color: "#9ca3af", fontSize: "0.95rem", maxWidth: "480px", margin: "0 auto" }}>
                Apprenez les gestes professionnels des meilleurs artisans pâtissiers d'Algérie pas à pas.
              </p>
            </div>

            {/* Bottom Timeline Bar */}
            <div 
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "0.85rem 1.5rem",
                background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                zIndex: 3,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1, marginRight: "1.5rem" }}>
                <span style={{ fontSize: "0.78rem", color: "white", fontWeight: 600 }}>14:20 / 22:45</span>
                <div style={{ flex: 1, height: "4px", background: "rgba(255,255,255,0.2)", borderRadius: "2px", overflow: "hidden" }}>
                  <div style={{ width: "62%", height: "100%", background: "var(--brand-orange)", borderRadius: "2px" }} />
                </div>
              </div>
              <span style={{ fontSize: "0.75rem", color: "#d1d5db" }}>Qualité auto (HD)</span>
            </div>
          </div>
        </div>

        {/* FLOATING 3D CARD 1 (Top Left: Instructor badge) */}
        <div
          className="glass hidden-mobile"
          style={{
            position: "absolute",
            top: "-25px",
            left: "-30px",
            padding: "0.85rem 1.15rem",
            borderRadius: "1rem",
            border: "1px solid rgba(254,145,0,0.35)",
            background: "rgba(20, 24, 33, 0.95)",
            transform: "translateZ(55px)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            zIndex: 10,
          }}
        >
          <div 
            style={{ 
              width: "42px", 
              height: "42px", 
              borderRadius: "50%", 
              background: "var(--gradient-orange)",
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              color: "white", 
              fontWeight: 800,
              fontSize: "1rem",
              boxShadow: "0 4px 12px rgba(254,145,0,0.4)"
            }}
          >
            AK
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "white" }}>Chef Amira K.</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#34d399" stroke="#34d399" strokeWidth="1"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--brand-orange)", fontWeight: 600 }}>
              Artisane Certifiée • 4.9 ★ (380 avis)
            </span>
          </div>
        </div>

        {/* FLOATING 3D CARD 2 (Bottom Right: Algerian Payments) */}
        <div
          className="glass hidden-mobile"
          style={{
            position: "absolute",
            bottom: "-25px",
            right: "-25px",
            padding: "0.85rem 1.25rem",
            borderRadius: "1rem",
            border: "1px solid rgba(52,211,153,0.35)",
            background: "rgba(20, 24, 33, 0.95)",
            transform: "translateZ(75px)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            gap: "0.85rem",
            zIndex: 10,
          }}
        >
          <div 
            style={{ 
              width: "38px", 
              height: "38px", 
              borderRadius: "0.6rem", 
              background: "rgba(52,211,153,0.15)",
              border: "1px solid rgba(52,211,153,0.3)",
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              color: "#34d399" 
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "white" }}>
              BaridiMob & EDAHABIA / CIB
            </div>
            <span style={{ fontSize: "0.75rem", color: "#34d399", fontWeight: 600 }}>
              Paiement 100% en Dinars (DZD) sécurisé
            </span>
          </div>
        </div>

        {/* FLOATING 3D BADGE 3 (Top Right: Official Certificate) */}
        <div
          className="glass hidden-mobile"
          style={{
            position: "absolute",
            top: "20%",
            right: "-40px",
            padding: "0.65rem 1rem",
            borderRadius: "0.75rem",
            border: "1px solid rgba(0,160,220,0.35)",
            background: "rgba(15, 23, 42, 0.95)",
            transform: "translateZ(65px)",
            boxShadow: "0 15px 30px rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            zIndex: 10,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand-blue)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="7" />
            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
          </svg>
          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "white" }}>
            Certificat Officiel Vérifiable
          </span>
        </div>

        {/* FLOATING 3D BADGE 4 (Bottom Left: 69 Wilayas) */}
        <div
          className="glass hidden-mobile"
          style={{
            position: "absolute",
            bottom: "20%",
            left: "-35px",
            padding: "0.65rem 1rem",
            borderRadius: "0.75rem",
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(15, 23, 42, 0.95)",
            transform: "translateZ(45px)",
            boxShadow: "0 15px 30px rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            gap: "0.55rem",
            zIndex: 10,
          }}
        >
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#34d399", display: "inline-block" }} />
          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "white" }}>
            69 Wilayas en Algérie
          </span>
        </div>
      </div>
    </div>
  );
}
