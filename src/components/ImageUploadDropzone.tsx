"use client";

import { useState, useRef } from "react";
import Image from "next/image";

interface ImageUploadDropzoneProps {
  initialUrl?: string | null;
  name?: string;
}

export function ImageUploadDropzone({
  initialUrl = "",
  name = "imageUrl",
}: ImageUploadDropzoneProps) {
  const [currentUrl, setCurrentUrl] = useState<string>(initialUrl || "");
  const [preview, setPreview] = useState<string>(initialUrl || "");
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Veuillez sélectionner un fichier image valide (JPG, PNG, WebP).");
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setError("La taille du fichier ne doit pas dépasser 4 Mo.");
      return;
    }

    setError("");
    setUploading(true);

    // Instant local preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Erreur de téléversement.");
      }

      const data = await res.json();
      setCurrentUrl(data.url);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Impossible de téléverser l'image.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {/* Hidden input to pass the final URL in form submissions */}
      <input type="hidden" name={name} value={currentUrl} />

      {/* Hidden file input */}
      <input 
        ref={fileInputRef}
        type="file" 
        accept="image/png, image/jpeg, image/webp" 
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {/* Dropzone Container */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        style={{
          border: "2px dashed var(--border)",
          borderRadius: "0.75rem",
          padding: preview ? "1rem" : "2rem 1.5rem",
          textAlign: "center",
          background: "rgba(255, 255, 255, 0.02)",
          cursor: "pointer",
          transition: "all 0.2s ease",
          position: "relative",
          overflow: "hidden"
        }}
        className="hover:border-white/30"
      >
        {preview ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ position: "relative", width: "100%", height: "180px", borderRadius: "0.5rem", overflow: "hidden", border: "1px solid var(--border)", background: "#000" }}>
              <Image 
                src={preview} 
                alt="Aperçu de la couverture" 
                fill 
                style={{ objectFit: "cover" }} 
              />
              {uploading && (
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "0.9rem", fontWeight: 600 }}>
                  Téléversement en cours...
                </div>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem" }}>
              <span style={{ color: "#34d399", fontWeight: 600 }}>
                {uploading ? "Traitement..." : "✓ Photo prête"}
              </span>
              <span style={{ color: "var(--text-muted)" }}>•</span>
              <span style={{ color: "var(--brand-blue)", textDecoration: "underline", fontWeight: 500 }}>
                Cliquer pour changer de photo
              </span>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(254, 145, 0, 0.1)", color: "var(--brand-orange)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.25rem" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </div>
            <p style={{ margin: 0, fontSize: "0.95rem", color: "#e5e7eb", fontWeight: 600 }}>
              {uploading ? "Téléversement..." : "Cliquez ou glissez une photo ici"}
            </p>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Fichiers JPG, PNG ou WebP jusqu'à 5 Mo
            </span>
          </div>
        )}
      </div>

      {error && (
        <span style={{ fontSize: "0.8rem", color: "#ef4444" }}>
          {error}
        </span>
      )}
    </div>
  );
}
