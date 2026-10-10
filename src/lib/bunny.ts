import crypto from "crypto";

/* Fonctions serveur pour Bunny Stream. Ne JAMAIS importer ce fichier dans un
   composant "use client" : il manipule des clés secrètes. */

const API_BASE = "https://video.bunnycdn.com";
const EMBED_BASE = "https://iframe.mediadelivery.net/embed";

const sha256Hex = (value: string) =>
  crypto.createHash("sha256").update(value).digest("hex");

const isGuid = (value: string) => /^[0-9a-fA-F-]{36}$/.test(value);

function getConfig() {
  const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;
  const apiKey = process.env.BUNNY_STREAM_API_KEY;
  const tokenKey = process.env.BUNNY_STREAM_TOKEN_KEY;
  if (!libraryId || !apiKey || !tokenKey) return null;
  return { libraryId, apiKey, tokenKey };
}

export const isBunnyConfigured = () => getConfig() !== null;

/** Crée une vidéo vide chez Bunny et renvoie son identifiant (GUID). */
export async function createBunnyVideo(title: string): Promise<string> {
  const config = getConfig();
  if (!config) throw new Error("BUNNY_NOT_CONFIGURED");

  const response = await fetch(`${API_BASE}/library/${config.libraryId}/videos`, {
    method: "POST",
    headers: {
      AccessKey: config.apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ title }),
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    console.error("BUNNY_CREATE_VIDEO_ERROR:", response.status, await response.text());
    throw new Error("BUNNY_CREATE_VIDEO_FAILED");
  }

  const data = await response.json();
  if (typeof data?.guid !== "string" || !isGuid(data.guid)) {
    throw new Error("BUNNY_INVALID_RESPONSE");
  }
  return data.guid;
}

/**
 * Autorisation d'envoi temporaire (TUS) : le navigateur envoie la vidéo
 * directement à Bunny, sans jamais voir la clé d'API.
 * Signature = SHA256(libraryId + apiKey + expire + videoId).
 */
export function createTusCredentials(videoId: string, validForSeconds = 6 * 60 * 60) {
  const config = getConfig();
  if (!config) throw new Error("BUNNY_NOT_CONFIGURED");

  const expire = Math.floor(Date.now() / 1000) + validForSeconds;
  const signature = sha256Hex(`${config.libraryId}${config.apiKey}${expire}${videoId}`);

  return {
    libraryId: config.libraryId,
    videoId,
    expire,
    signature,
    endpoint: `${API_BASE}/tusupload`,
  };
}

/**
 * Adresse de lecture signée et temporaire.
 * Token = SHA256(clé de sécurité + videoId + expiration).
 */
export function buildSignedEmbedUrl(videoId: string, validForSeconds = 3 * 60 * 60): string | null {
  const config = getConfig();
  if (!config || !isGuid(videoId)) return null;

  const expires = Math.floor(Date.now() / 1000) + validForSeconds;
  const token = sha256Hex(`${config.tokenKey}${videoId}${expires}`);

  return `${EMBED_BASE}/${config.libraryId}/${videoId}?token=${token}&expires=${expires}`;
}