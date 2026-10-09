import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import {
  createChargilyCheckout,
  PaymentNotConfiguredError,
} from "@/lib/chargily";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id;

    if (!userId) {
      return new NextResponse("Veuillez vous connecter pour payer.", { status: 401 });
    }

    let courseId: unknown;
    try {
      ({ courseId } = await req.json());
    } catch {
      return new NextResponse("Requête invalide.", { status: 400 });
    }

    if (typeof courseId !== "string" || courseId === "") {
      return new NextResponse("Cours manquant.", { status: 400 });
    }

    const course = await prisma.course.findUnique({ where: { id: courseId } });

    if (!course || !course.isPublished) {
      return new NextResponse("Cours introuvable.", { status: 404 });
    }

    if (!course.price || course.price <= 0) {
      return new NextResponse("Ce cours est gratuit, aucun paiement nécessaire.", {
        status: 400,
      });
    }

    const existingEnrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (existingEnrollment) {
      return new NextResponse("Vous êtes déjà inscrit à ce cours.", { status: 400 });
    }

    // En production, l'adresse du site est obligatoire (pas de repli sur localhost)
    const appUrl =
      process.env.NEXTAUTH_URL ||
      (process.env.NODE_ENV === "production" ? "" : "http://localhost:3000");
    if (!appUrl) {
      console.error("CHARGILY_CHECKOUT_ERROR: NEXTAUTH_URL manquante");
      return new NextResponse("Paiement indisponible pour le moment.", { status: 503 });
    }

    const base = appUrl.replace(/\/$/, "");
    const successUrl = `${base}/courses/${course.id}/enroll/success`;
    const failureUrl = `${base}/courses/${course.id}/enroll`;

    const { checkoutUrl, isSimulated } = await createChargilyCheckout({
      userId,
      courseId: course.id,
      courseTitle: course.title,
      amount: course.price,
      successUrl,
      failureUrl,
    });

    return NextResponse.json({ checkoutUrl, isSimulated: !!isSimulated });
  } catch (error) {
    if (error instanceof PaymentNotConfiguredError) {
      return new NextResponse("Paiement indisponible pour le moment.", { status: 503 });
    }
    console.error("CHARGILY_CHECKOUT_ERROR:", error);
    // Message volontairement vague : pas de détails techniques pour l'utilisateur
    return new NextResponse("Impossible de lancer le paiement. Réessayez plus tard.", {
      status: 500,
    });
  }
}