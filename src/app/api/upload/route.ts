import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { createClient } from "@supabase/supabase-js";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

/* -------------------------------------------------------------------------- */
/*  Réglages                                                                  */
/* -------------------------------------------------------------------------- */

const IMAGE_BUCKET = process.env.SUPABASE_IMAGES_BUCKET || "course-images";

// 4 Mo : les fonctions Vercel refusent (à ma connaissance) les requêtes
// d'environ 4,5 Mo ou plus. Au-delà, il faudra un envoi direct vers le stockage.
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

/* -------------------------------------------------------------------------- */
/*  Détection du vrai type de fichier (on ne fait PAS confiance au navigateur) */
/* -------------------------------------------------------------------------- */

type Detected = { ext: string; mime: string };

function detectImage(buf: Buffer): Detected | null {
  // JPEG
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { ext: "jpg", mime: "image/jpeg" };
  }
  // PNG
  const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buf.length >= 8 && buf.subarray(0, 8).equals(pngSignature)) {
    return { ext: "png", mime: "image/png" };
  }
  // WebP
  if (
    buf.length >= 12 &&
    buf.subarray(0, 4).toString("ascii") === "RIFF" &&
    buf.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return { ext: "webp", mime: "image/webp" };
  }
  return null; // SVG, GIF, HTML déguisé, etc. : refusés
}

function detectVideo(buf: Buffer): Detected | null {
  // MP4 : "ftyp" aux octets 4 à 8
  if (buf.length >= 12 && buf.subarray(4, 8).toString("ascii") === "ftyp") {
    return { ext: "mp4", mime: "video/mp4" };
  }
  // WebM
  if (
    buf.length >= 4 &&
    buf[0] === 0x1a &&
    buf[1] === 0x45 &&
    buf[2] === 0xdf &&
    buf[3] === 0xa3
  ) {
    return { ext: "webm", mime: "video/webm" };
  }
  return null;
}

/* -------------------------------------------------------------------------- */
/*  Client de stockage (côté serveur uniquement)                              */
/* -------------------------------------------------------------------------- */

function getStorageClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

const randomName = (ext: string) =>
  `${Date.now()}_${crypto.randomBytes(8).toString("hex")}.${ext}`;

/* -------------------------------------------------------------------------- */
/*  Route POST                                                                */
/* -------------------------------------------------------------------------- */

export async function POST(req: Request) {
  try {
    // 1. Il faut être connecté
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    if (!email) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    // 2. Lire le fichier envoyé
    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return new NextResponse("Aucun fichier téléversé", { status: 400 });
    }

    // Refus rapide avant de lire le fichier en mémoire
    if (file.size > MAX_VIDEO_BYTES) {
      return new NextResponse("Fichier trop volumineux.", { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // 3. Quel est le VRAI type du fichier ?
    const image = detectImage(buffer);
    const video = image ? null : detectVideo(buffer);

    if (!image && !video) {
      return new NextResponse(
        "Format non accepté. Images : JPG, PNG, WebP. Vidéos : MP4, WebM.",
        { status: 400 }
      );
    }

    /* ----------------------------- IMAGES ---------------------------------- */
    if (image) {
      if (buffer.length > MAX_IMAGE_BYTES) {
        return new NextResponse("Image trop volumineuse. La limite est de 4 Mo.", {
          status: 400,
        });
      }

      const storage = getStorageClient();
      if (!storage) {
        console.error("UPLOAD_CONFIG_ERROR: SUPABASE_URL ou clé secrète manquante");
        return new NextResponse("Stockage non configuré.", { status: 500 });
      }

      const objectPath = `courses/${randomName(image.ext)}`;
      const { error } = await storage.storage
        .from(IMAGE_BUCKET)
        .upload(objectPath, buffer, {
          contentType: image.mime,
          upsert: false,
          cacheControl: "31536000",
        });

      if (error) {
        console.error("UPLOAD_STORAGE_ERROR:", error.message);
        return new NextResponse("Erreur interne lors du téléversement.", { status: 500 });
      }

      const { data } = storage.storage.from(IMAGE_BUCKET).getPublicUrl(objectPath);

      return NextResponse.json({
        url: data.publicUrl,
        fileType: "image",
        originalName: file.name,
        size: file.size,
      });
    }

    /* ----------------------------- VIDÉOS ---------------------------------- */
    // Provisoire : les vidéos restent sur le disque local en développement.
    // Elles seront gérées par un service vidéo sécurisé (tâche 8).
    if (process.env.NODE_ENV === "production") {
      return new NextResponse(
        "Le téléversement de vidéos n'est pas encore disponible en ligne.",
        { status: 501 }
      );
    }

    // Seuls les formateurs et admins peuvent envoyer des vidéos
    const user = await prisma.user.findUnique({
      where: { email },
      select: { role: true },
    });
    if (!user || (user.role !== "INSTRUCTOR" && user.role !== "ADMIN")) {
      return new NextResponse("Accès refusé", { status: 403 });
    }

    if (buffer.length > MAX_VIDEO_BYTES) {
      return new NextResponse("Vidéo trop volumineuse. La limite est de 100 Mo.", {
        status: 400,
      });
    }

    const safeName = `vid_${randomName(video!.ext)}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "videos");
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, safeName), buffer);

    return NextResponse.json({
      url: `/uploads/videos/${safeName}`,
      fileType: "video",
      originalName: file.name,
      size: file.size,
    });
  } catch (error) {
    console.error("UPLOAD_ERROR:", error);
    return new NextResponse("Erreur interne lors du téléversement.", { status: 500 });
  }
}