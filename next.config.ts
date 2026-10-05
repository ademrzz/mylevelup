import type { NextConfig } from "next";

// Récupère automatiquement l'adresse Supabase depuis le .env,
// pour ne pas écrire l'identifiant du projet en dur dans le code.
let supabaseHostname: string | null = null;
try {
  if (process.env.SUPABASE_URL) {
    supabaseHostname = new URL(process.env.SUPABASE_URL).hostname;
  }
} catch {
  console.warn("SUPABASE_URL invalide : les images Supabase seront bloquées.");
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      ...(supabaseHostname
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHostname,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;