import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyChargilySignature } from "@/lib/chargily";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("signature") || "";

    // 🔒 La signature est OBLIGATOIRE : sans elle (ou si elle est fausse), on refuse.
    if (!verifyChargilySignature(rawBody, signature)) {
      console.warn("⚠️ Webhook Chargily rejeté : signature absente ou invalide");
      return new NextResponse("Invalid signature", { status: 403 });
    }

    let event: any;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return new NextResponse("Invalid JSON", { status: 400 });
    }

    // Seuls les paiements confirmés nous intéressent
    if (event?.type !== "checkout.paid") {
      return NextResponse.json({ received: true });
    }

    const data = event.data ?? {};
    const userId = data.metadata?.userId;
    const courseId = data.metadata?.courseId;

    if (typeof userId !== "string" || typeof courseId !== "string") {
      console.warn("⚠️ checkout.paid sans userId/courseId valides");
      return NextResponse.json({ received: true });
    }

    // Le cours et l'utilisateur existent-ils vraiment ?
    const [course, user] = await Promise.all([
      prisma.course.findUnique({
        where: { id: courseId },
        select: { id: true, price: true },
      }),
      prisma.user.findUnique({ where: { id: userId }, select: { id: true } }),
    ]);

    if (!course || !user) {
      console.warn(`⚠️ Paiement reçu pour un cours ou utilisateur inconnu (${courseId}, ${userId})`);
      return NextResponse.json({ received: true });
    }

    // Le montant payé couvre-t-il le prix actuel du cours ?
    const paidAmount = Number(data.amount);
    const expectedAmount = Math.round(course.price ?? 0);
    if (!Number.isFinite(paidAmount) || paidAmount < expectedAmount) {
      // À vérifier à la main : on n'inscrit PAS automatiquement.
      console.error(
        `PAYMENT_AMOUNT_MISMATCH: payé=${data.amount} attendu=${expectedAmount} cours=${courseId} user=${userId}`
      );
      return NextResponse.json({ received: true });
    }

    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId, courseId } },
      update: {},
      create: { userId, courseId },
    });

    console.log(`✅ Inscription confirmée : user ${userId}, cours ${courseId}`);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("CHARGILY_WEBHOOK_ERROR:", error);
    return new NextResponse("Webhook error", { status: 500 });
  }
}