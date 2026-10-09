"use client";

import { useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

interface VideoUploadInputProps {
  initialUrl?: string;
  name?: string;
  placeholder?: string;
}

const MAX_VIDEO_MB = Number(process.env.NEXT_PUBLIC_MAX_VIDEO_MB || 50);
const ALLOWED_TYPES = ["video/mp4", "video/webm"];

export function VideoUploadInput({
  initialUrl = "",
  name = "videoUrl",
  placeholder = "https://... ou téléversez un fichier MP4",
}: VideoUploadInputProps) {
  const [videoUrl, setVideoUrl] = useState<string>(initialUrl);
  const [uploading, setUploading] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Format non accepté. Utilisez une vidéo MP4 ou WebM.");
      return;
    }

    if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
      setError(`Le fichier vidéo dépasse la limite de ${MAX_VIDEO_MB} Mo.`);
      return;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !anonKey) {
      setError("Configuration du stockage manquante.");
      return;
    }

    setError("");
    setUploading(true);
    setFileName(file.name);

    try {
      // 1. Le serveur vérifie nos droits et fabrique une autorisation d'envoi
      const res = await fetch("/api/upload/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: file.type, size: file.size }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Impossible de préparer l'envoi.");
      }

      const { bucket, path, token } = await res.json();

      // 2. Le navigateur envoie la vidéo DIRECTEMENT à Supabase
      const supabase = createClient(supabaseUrl, anonKey);
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .uploadToSignedUrl(path, token, file, { contentType: file.type });

      if (uploadError) {
        throw new Error(uploadError.message || "Échec de l'envoi de la vidéo.");
      }

      // 3. On garde seulement le chemin dans le formulaire (puis en base)
      setVideoUrl(path);
    } catch (err: any) {
      console.error("Video upload error:", err);
      setError(err.message || "Échec du téléversement de la vidéo.");
      setFileName("");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4, video/webm"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <input
          type="text"
          name={name}
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder={placeholder}
          className="input-field"
          style={{ fontSize: "0.85rem", padding: "0.55rem 0.75rem", flex: 1 }}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="btn btn-outline"
          style={{
            padding: "0.55rem 0.85rem",
            fontSize: "0.8rem",
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            borderColor: "rgba(255,255,255,0.2)",
          }}
        >
          {uploading ? (
            <>
              <div style={{ width: "12px", height: "12px", border: "2px solid white", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
              <span>Envoi...</span>
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <span>Fichier vidéo</span>
            </>
          )}
        </button>
      </div>

      {fileName && !error && !uploading && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.75rem", color: "#34d399" }}>
          <span>✓ Vidéo envoyée : <strong>{fileName}</strong></span>
        </div>
      )}

      {uploading && (
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
          Envoi en cours, ne fermez pas cette page...
        </span>
      )}

      {error && (
        <span style={{ fontSize: "0.75rem", color: "#ef4444" }}>
          {error}
        </span>
      )}
    </div>
  );
}