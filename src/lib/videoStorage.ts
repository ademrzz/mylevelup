import { createClient } from "@supabase/supabase-js";
import { buildSignedEmbedUrl } from "@/lib/bunny";

/** Ancien bucket PRIVÉ Supabase (vidéos de test déjà envoyées). */
export const VIDEO_BUCKET = process.env.SUPABASE_VIDEOS_BUCKET || "course-videos";

const SIGNED_URL_SECONDS = 4 * 60 * 60;

/**
 * Valeurs possibles dans Lesson.videoUrl :
 *  - "bunny:<identifiant>"  → vidéo Bunny Stream (lecteur signé)
 *  - "videos/..."           → ancienne vidéo du stockage privé Supabase
 *  - autre (https://...)    → adresse directe (anciennes vidéos / démo)
 */
export async function resolveVideoSrc(
  videoUrl: string | null | undefined
): Promise<string | null> {
  if (!videoUrl) return null;

  if (videoUrl.startsWith("bunny:")) {
    return buildSignedEmbedUrl(videoUrl.slice("bunny:".length));
  }

  if (!videoUrl.startsWith("videos/")) return videoUrl;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("VIDEO_CONFIG_ERROR: SUPABASE_URL ou clé secrète manquante");
    return null;
  }

  const client = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await client.storage
    .from(VIDEO_BUCKET)
    .createSignedUrl(videoUrl, SIGNED_URL_SECONDS);

  if (error || !data?.signedUrl) {
    console.error("VIDEO_SIGN_ERROR:", error?.message);
    return null;
  }
  return data.signedUrl;
}