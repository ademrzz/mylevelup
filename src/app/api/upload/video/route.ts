import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import {
  createBunnyVideo,
  createTusCredentials,
  isBunnyConfigured,
} from "@/lib/bunny";

// Cette route NE reçoit PAS la vidéo : elle vérifie les droits, crée la vidéo
// chez Bunny et renvoie une autorisation d'envoi temporaire. Le navigateur
// envoie ensuite le fichier directement à Bunny (reprise automatique).

const ALLOWED_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const MAX_VIDEO_MB = Number(process.env.NEXT_PUBLIC_MAX_VIDEO_MB || 5120);

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
      select: { role: true },
    });
    if (!user || (user.role !== "INSTRUCTOR" && user.role !== "ADMIN")) {
      return new NextResponse("Accès refusé", { status: 403 });
    }

    let body: { fileName?: unknown; contentType?: unknown; size?: unknown };
    try {
      body = await req.json();
    } catch {
      return new NextResponse("Requête invalide.", { status: 400 });
    }

    if (typeof body.contentType !== "string" || !ALLOWED_TYPES.includes(body.contentType)) {
      return new NextResponse("Format non accepté. Vidéos : MP4, WebM ou MOV.", { status: 400 });
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

    if (!isBunnyConfigured()) {
      console.error("VIDEO_UPLOAD_CONFIG_ERROR: variables BUNNY_STREAM_* manquantes");
      return new NextResponse("Stockage vidéo non configuré.", { status: 500 });
    }

    const rawTitle = typeof body.fileName === "string" ? body.fileName : "";
    const title = rawTitle.replace(/[\u0000-\u001f]/g, "").trim().slice(0, 120) || "Vidéo sans titre";

    const videoId = await createBunnyVideo(title);
    return NextResponse.json(createTusCredentials(videoId));
  } catch (error) {
    console.error("VIDEO_UPLOAD_ERROR:", error instanceof Error ? error.message : error);
    return new NextResponse("Impossible de préparer l'envoi.", { status: 500 });
  }
}