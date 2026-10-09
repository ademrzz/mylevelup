import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/* Images uniquement. Les vidéos passent par /api/upload/video (envoi direct). */

const IMAGE_BUCKET = process.env.SUPABASE_IMAGES_BUCKET || "course-images";

// 4 Mo : limite prudente pour les fonctions serverless (Netlify / Vercel).
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

type Detected = { ext: string; mime: string };

// On vérifie le VRAI type du fichier (signature des premiers octets)
function detectImage(buf: Buffer): Detected | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { ext: "jpg", mime: "image/jpeg" };
  }
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buf.length >= 8 && buf.subarray(0, 8).equals(png)) {
    return { ext: "png", mime: "image/png" };
  }
  if (
    buf.length >= 12 &&
    buf.subarray(0, 4).toString("ascii") === "RIFF" &&
    buf.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return { ext: "webp", mime: "image/webp" };
  }
  return null; // SVG, GIF, HTML déguisé, etc. : refusés
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return new NextResponse("Aucun fichier téléversé", { status: 400 });
    }

    if (file.size > MAX_IMAGE_BYTES) {
      return new NextResponse("Image trop volumineuse. La limite est de 4 Mo.", { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const image = detectImage(buffer);
    if (!image) {
      return new NextResponse("Format non accepté. Images : JPG, PNG, WebP.", { status: 400 });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      console.error("UPLOAD_CONFIG_ERROR: SUPABASE_URL ou clé secrète manquante");
      return new NextResponse("Stockage non configuré.", { status: 500 });
    }

    const storage = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const objectPath = `courses/${Date.now()}_${crypto.randomBytes(8).toString("hex")}.${image.ext}`;

    const { error } = await storage.storage.from(IMAGE_BUCKET).upload(objectPath, buffer, {
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
  } catch (error) {
    console.error("UPLOAD_ERROR:", error);
    return new NextResponse("Erreur interne lors du téléversement.", { status: 500 });
  }
}