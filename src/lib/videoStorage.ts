import { createClient } from "@supabase/supabase-js";

/** Nom du bucket PRIVÉ qui contient les vidéos de cours. */
export const VIDEO_BUCKET = process.env.SUPABASE_VIDEOS_BUCKET || "course-videos";

/** Durée de validité d'un lien de lecture (4 h : assez pour une vidéo longue). */
const SIGNED_URL_SECONDS = 4 * 60 * 60;

/**
 * Les nouvelles vidéos sont enregistrées sous forme de chemin ("videos/...").
 * Les anciennes (https://..., /uploads/...) restent des adresses directes.
 */
const isStoragePath = (value: string) => value.startsWith("videos/");

/** Transforme la valeur stockée en base en adresse lisible par le navigateur. */
export async function resolveVideoSrc(
  videoUrl: string | null | undefined
): Promise<string | null> {
  if (!videoUrl) return null;
  if (!isStoragePath(videoUrl)) return videoUrl;

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