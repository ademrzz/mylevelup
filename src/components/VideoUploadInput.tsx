"use client";

import { useState, useRef } from "react";
import * as tus from "tus-js-client";

interface VideoUploadInputProps {
  initialUrl?: string;
  name?: string;
  placeholder?: string;
}

const MAX_VIDEO_MB = Number(process.env.NEXT_PUBLIC_MAX_VIDEO_MB || 5120);
const ALLOWED_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

export function VideoUploadInput({
  initialUrl = "",
  name = "videoUrl",
  placeholder = "https://... ou téléversez un fichier vidéo",
}: VideoUploadInputProps) {
  const [videoUrl, setVideoUrl] = useState<string>(initialUrl);
  const [uploading, setUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [fileName, setFileName] = useState<string>("");
  const [done, setDone] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Format non accepté. Utilisez une vidéo MP4, WebM ou MOV.");
      return;
    }
    if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
      setError(`Le fichier vidéo dépasse la limite de ${MAX_VIDEO_MB} Mo.`);
      return;
    }

    setError("");
    setDone(false);
    setProgress(0);
    setUploading(true);
    setFileName(file.name);

    try {
      // 1. Le serveur vérifie nos droits et prépare l'envoi chez Bunny
      const res = await fetch("/api/upload/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, contentType: file.type, size: file.size }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Impossible de préparer l'envoi.");
      }

      const { libraryId, videoId, expire, signature, endpoint } = await res.json();

      // 2. Le navigateur envoie la vidéo DIRECTEMENT à Bunny, par morceaux
      //    (reprise automatique si la connexion coupe)
      await new Promise<void>((resolve, reject) => {
        const upload = new tus.Upload(file, {
          endpoint,
          retryDelays: [0, 3000, 5000, 10000, 20000, 60000],
          chunkSize: 16 * 1024 * 1024,
          headers: {
            AuthorizationSignature: signature,
            AuthorizationExpire: String(expire),
            VideoId: videoId,
            LibraryId: String(libraryId),
          },
          metadata: { filetype: file.type, title: file.name },
          onError: (err) => reject(err),
          onProgress: (sent, total) => setProgress(Math.round((sent / total) * 100)),
          onSuccess: () => resolve(),
        });
        upload.start();
      });

      // 3. On garde seulement l'identifiant dans le formulaire (puis en base)
      setVideoUrl(`bunny:${videoId}`);
      setDone(true);
    } catch (err: any) {
      console.error("Video upload error:", err);
      setError(err?.message || "Échec du téléversement de la vidéo.");
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
        accept="video/mp4, video/webm, video/quicktime"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
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
              <span>{progress}%</span>
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

      {uploading && (
        <div>
          <div style={{ height: "6px", borderRadius: "3px", background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
            <div style={{ width: `${progress}%`, height: "100%", background: "var(--brand-blue)", transition: "width 0.3s" }} />
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Envoi de {fileName} : {progress}%. Ne fermez pas cette page.
          </span>
        </div>
      )}

      {done && !error && (
        <div style={{ fontSize: "0.75rem", color: "#34d399" }}>
          ✓ Vidéo envoyée : <strong>{fileName}</strong>. Elle sera lisible dans quelques minutes
          (le temps de l&apos;encodage). N&apos;oubliez pas d&apos;enregistrer la leçon.
        </div>
      )}

      {error && (
        <span style={{ fontSize: "0.75rem", color: "#ef4444" }}>
          {error}
        </span>
      )}
    </div>
  );
}