"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ALGERIAN_WILAYAS } from "@/lib/constants";

export default function RegisterPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [data, setData] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    confirmPassword: "",
    phone: "", 
    wilaya: "", 
    role: "STUDENT",
    image: "" 
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Veuillez sélectionner un fichier image valide (JPG, PNG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("La photo de profil ne doit pas dépasser 5 Mo.");
      return;
    }

    setError("");
    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Échec du téléversement de l'image.");
      }

      const uploadData = await res.json();
      setData((prev) => ({ ...prev, image: uploadData.url }));
    } catch (err: any) {
      setError(err?.message || "Erreur lors du téléversement de la photo.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (data.password !== data.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (data.password.length < 6) {
      setError("Le mot de passe doit comporter au moins 6 caractères.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        // Redirect to the OTP input screen
        router.push(`/verify?email=${encodeURIComponent(data.email)}`);
      } else {
        const text = await res.text();
        setError(text || "Une erreur s'est produite.");
      }
    } catch (err) {
      setError("Erreur de connexion serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container flex flex-col" style={{ minHeight: "calc(100vh - 150px)", padding: "4rem 1rem" }}>
      <div 
        className="glass animate-fade-up" 
        style={{ 
          margin: "auto",
          maxWidth: "520px", 
          width: "100%", 
          padding: "3rem 2.25rem", 
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-lg)"
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "white", marginBottom: "0.5rem" }}>
            Créer un compte
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            Rejoignez la plateforme d'excellence en Algérie.
          </p>
        </div>

        {error && (
          <div style={{ padding: "0.75rem", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", borderRadius: "var(--radius-sm)", marginBottom: "1.5rem", fontSize: "0.9rem", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Avatar Upload Field */}
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", padding: "0.75rem 1rem", background: "rgba(255,255,255,0.02)", borderRadius: "0.75rem", border: "1px solid var(--border)" }}>
            <div 
              style={{ 
                position: "relative", 
                width: "56px", 
                height: "56px", 
                borderRadius: "50%", 
                overflow: "hidden", 
                background: "var(--gradient-orange)", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                flexShrink: 0,
                color: "white",
                fontWeight: 700,
                fontSize: "1.25rem"
              }}
            >
              {data.image ? (
                <Image src={data.image} alt="Avatar" fill style={{ objectFit: "cover" }} />
              ) : data.name ? (
                data.name.charAt(0).toUpperCase()
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              )}
            </div>

            <div style={{ flex: 1 }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "white", display: "block" }}>
                Photo de profil (Optionnelle)
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                {uploadingImage ? "Téléversement..." : data.image ? "✓ Photo sélectionnée" : "JPG, PNG ou WebP (max 5 Mo)"}
              </span>
            </div>

            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageFile(file);
              }}
            />

            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              className="btn btn-outline"
              style={{ padding: "0.4rem 0.85rem", fontSize: "0.8rem", whiteSpace: "nowrap" }}
            >
              {uploadingImage ? "..." : data.image ? "Changer" : "Parcourir"}
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <label style={{ fontSize: "0.9rem", fontWeight: 600, color: "#e5e7eb" }}>Nom et prénom *</label>
            <input 
              type="text" 
              required
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              className="input-field" 
              placeholder="Ex: Yacine Benali"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label style={{ fontSize: "0.9rem", fontWeight: 600, color: "#e5e7eb" }}>Adresse e-mail *</label>
            <input 
              type="email" 
              required
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              className="input-field" 
              placeholder="votre@email.com"
            />
          </div>

          {/* Phone and Wilaya 2-col Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="flex flex-col gap-2">
              <label style={{ fontSize: "0.9rem", fontWeight: 600, color: "#e5e7eb" }}>Numéro de téléphone</label>
              <input 
                type="tel" 
                value={data.phone}
                onChange={(e) => setData({ ...data, phone: e.target.value })}
                className="input-field" 
                placeholder="Ex: 0555123456"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label style={{ fontSize: "0.9rem", fontWeight: 600, color: "#e5e7eb" }}>Wilaya (58 wilayas)</label>
              <select 
                value={data.wilaya}
                onChange={(e) => setData({ ...data, wilaya: e.target.value })}
                className="input-field"
                style={{ cursor: "pointer" }}
              >
                <option value="">Sélectionnez votre Wilaya</option>
                {ALGERIAN_WILAYAS.map((w) => (
                  <option key={w} value={w} style={{ background: "#1c1c1e", color: "white" }}>
                    {w}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label style={{ fontSize: "0.9rem", fontWeight: 600, color: "#e5e7eb" }}>Mot de passe *</label>
            <input 
              type="password" 
              required
              minLength={6}
              value={data.password}
              onChange={(e) => setData({ ...data, password: e.target.value })}
              className="input-field" 
              placeholder="••••••••"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label style={{ fontSize: "0.9rem", fontWeight: 600, color: "#e5e7eb" }}>Confirmer le mot de passe *</label>
            <input 
              type="password" 
              required
              minLength={6}
              value={data.confirmPassword}
              onChange={(e) => setData({ ...data, confirmPassword: e.target.value })}
              className="input-field" 
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || uploadingImage} 
            className="btn btn-primary w-full mt-2"
            style={{ padding: "0.9rem", fontSize: "1.05rem", background: "var(--gradient-orange)" }}
          >
            {loading ? "Création du compte..." : "S'inscrire et recevoir mon code →"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "2rem", fontSize: "0.95rem" }}>
          <span style={{ color: "var(--text-muted)" }}>Déjà un compte ? </span>
          <Link href="/login" style={{ color: "var(--brand-orange)", fontWeight: 600 }}>
            Connectez-vous
          </Link>
        </div>
      </div>
    </div>
  );
}
