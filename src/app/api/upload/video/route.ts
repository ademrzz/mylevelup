import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { VIDEO_BUCKET } from "@/lib/videoStorage";

// Ce route NE reçoit PAS la vidéo : elle vérifie les droits puis fabrique une
// autorisation d'envoi temporaire que le navigateur utilise pour déposer le
// fichier directement dans Supabase (pas de limite de taille côté Netlify).

const ALLOWED_TYPES: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
};

const MAX_VIDEO_MB = Number(process.env.NEXT_PUBLIC_MAX_VIDEO_MB || 50);

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    if (!email) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    // Seuls les formateurs et admins peuvent envoyer des vidéos
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, role: true },
    });
    if (!user || (user.role !== "INSTRUCTOR" && user.role !== "ADMIN")) {
      return new NextResponse("Accès refusé", { status: 403 });
    }

    let body: { contentType?: unknown; size?: unknown };
    try {
      body = await req.json();
    } catch {
      return new NextResponse("Requête invalide.", { status: 400 });
    }

    const ext =
      typeof body.contentType === "string" ? ALLOWED_TYPES[body.contentType] : undefined;
    if (!ext) {
      return new NextResponse("Format non accepté. Vidéos : MP4 ou WebM.", { status: 400 });
    }

    const size = Number(body.size);
    if (!Number.isFinite(size) || size <= 0) {
      return new NextResponse("Taille de fichier invalide.", { status: 400 });
    }
    if (size > MAX_VIDEO_MB * 1024 * 1024) {
      return new NextResponse(`Vidéo trop volumineuse. La limite est de ${MAX_VIDEO_MB} Mo.`, {
        status: 400,
      });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      console.error("VIDEO_UPLOAD_CONFIG_ERROR: SUPABASE_URL ou clé secrète manquante");
      return new NextResponse("Stockage non configuré.", { status: 500 });
    }

    const storage = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    // Chemin aléatoire, rangé par formateur
    const path = `videos/${user.id}/${Date.now()}_${crypto.randomBytes(8).toString("hex")}.${ext}`;

    const { data, error } = await storage.storage
      .from(VIDEO_BUCKET)
      .createSignedUploadUrl(path);

    if (error || !data) {
      console.error("VIDEO_SIGNED_UPLOAD_ERROR:", error?.message);
      return new NextResponse("Impossible de préparer l'envoi.", { status: 500 });
    }

    return NextResponse.json({ bucket: VIDEO_BUCKET, path: data.path, token: data.token });
  } catch (error) {
    console.error("VIDEO_UPLOAD_ERROR:", error);
    return new NextResponse("Erreur interne.", { status: 500 });
  }
}