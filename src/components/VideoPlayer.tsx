"use client";

import { useEffect, useRef, useState } from "react";

interface VideoPlayerProps {
  url?: string | null;
  user?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  };
  poster?: string | null;
}

const BUNNY_EMBED_PREFIX = "https://iframe.mediadelivery.net/embed/";

export function VideoPlayer({ url, user, poster }: VideoPlayerProps) {
  const [watermarkPos, setWatermarkPos] = useState({ top: 20, left: 20 });
  const [videoError, setVideoError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Clean fallback if url is missing or placeholder
  const defaultFallback = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
  const effectiveUrl = (!url || url === "placeholder" || url.includes("example.com"))
    ? defaultFallback
    : url;

  // Vidéo Bunny Stream (lecteur intégré, adresse signée par le serveur)
  const isBunnyEmbed = effectiveUrl.startsWith(BUNNY_EMBED_PREFIX);

  // Dynamic bouncing watermark logic
  useEffect(() => {
    let animationFrameId: number;
    let x = 20;
    let y = 20;
    let dx = 0.35; // Gentle readable drift
    let dy = 0.25;

    const animate = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const watermarkWidth = 180;
        const watermarkHeight = 60;

        if (x + watermarkWidth >= rect.width || x <= 10) dx = -dx;
        if (y + watermarkHeight >= rect.height || y <= 10) dy = -dy;

        x += dx;
        y += dy;

        setWatermarkPos({ top: Math.max(10, y), left: Math.max(10, x) });
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Suivi du plein écran (on met en plein écran le CONTENEUR, pas la vidéo,
  // pour que le filigrane reste visible)
  useEffect(() => {
    const onChange = () =>
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      el.requestFullscreen?.();
    }
  };

  const showWatermark = !!user && (isBunnyEmbed || !videoError);

  return (
    <div
      ref={containerRef}
      className="video-player-container relative w-full aspect-video bg-black overflow-hidden rounded-xl border border-[var(--border)]"
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: isFullscreen ? 'auto' : '16/9',
        height: isFullscreen ? '100%' : undefined,
        backgroundColor: '#000000',
        overflow: 'hidden',
        borderRadius: isFullscreen ? 0 : '0.75rem',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
      }}
    >
      {isBunnyEmbed ? (
        <>
          {/* Lecteur Bunny. Pas de "allowfullscreen" : le plein écran passe par
              notre bouton, qui garde le filigrane à l'écran. */}
          <iframe
            key={effectiveUrl}
            src={effectiveUrl}
            title="Lecteur vidéo"
            allow="autoplay; encrypted-media; picture-in-picture"
            style={{ width: '100%', height: '100%', border: 0 }}
          />
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              zIndex: 40,
              background: 'rgba(0,0,0,0.55)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: '0.4rem',
              padding: '0.35rem 0.6rem',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            {isFullscreen ? "Quitter" : "Plein écran"}
          </button>
        </>
      ) : !videoError ? (
        <video
          key={effectiveUrl}
          src={effectiveUrl}
          controls
          controlsList="nodownload"
          playsInline
          onError={() => setVideoError(true)}
          onContextMenu={(e) => e.preventDefault()} // Disable right click
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          poster={poster || undefined}
        />
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', background: '#0a0a0c', padding: '2rem', textAlign: 'center' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '1rem', opacity: 0.6, color: 'var(--brand-orange)' }}>
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p style={{ color: 'white', fontWeight: 600, marginBottom: '0.5rem' }}>Flux vidéo temporairement indisponible</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '360px', marginBottom: '1rem' }}>
            Impossible de charger le fichier vidéo. Veuillez réessayer ou contacter le support.
          </p>
          <button
            onClick={() => setVideoError(false)}
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem', padding: '0.5rem 1.25rem' }}
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Dynamic Watermark Overlay (Anti-Piracy) */}
      {showWatermark && (
        <div
          className="watermark-overlay"
          style={{
            position: 'absolute',
            top: `${watermarkPos.top}px`,
            left: `${watermarkPos.left}px`,
            color: 'rgba(255, 255, 255, 0.28)',
            fontSize: '0.8rem',
            fontWeight: 700,
            textShadow: '0 1px 3px rgba(0,0,0,0.8)',
            pointerEvents: 'none', // Critical so it doesn't block video controls
            zIndex: 30,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            lineHeight: 1.2,
            letterSpacing: '0.02em',
            transition: 'top 0.1s linear, left 0.1s linear'
          }}
        >
          <span>{user?.name || "Étudiant"}</span>
          <span>{user?.email || ""}</span>
          {user?.phone && <span>{user.phone}</span>}
        </div>
      )}
    </div>
  );
}