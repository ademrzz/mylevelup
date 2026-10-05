import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyChargilySignature } from "@/lib/chargily";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("signature") || "";

    // Verify webhook signature
    if (signature && !verifyChargilySignature(rawBody, signature)) {
      console.warn("⚠️ Invalid Chargily webhook signature rejected");
      return new NextResponse("Invalid signature", { status: 403 });
    }

    const event = JSON.parse(rawBody);
    console.log("⚡ Chargily Webhook Event Received:", event.type);

    if (event.type === "checkout.paid") {
      const checkoutData = event.data;
      const metadata = checkoutData.metadata || {};
      const { userId, courseId } = metadata;

      if (userId && courseId) {
        // Automatically create or update enrollment
        await prisma.enrollment.upsert({
          where: {
            userId_courseId: {
              userId,
              courseId,
            },
          },
          update: {},
          create: {
            userId,
            courseId,
          },
        });

        console.log(`✅ Automated enrollment confirmed for user ${userId} in course ${courseId}`);
      } else {
        console.warn("⚠️ Webhook checkout.paid missing userId or courseId in metadata", metadata);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("CHARGILY_WEBHOOK_ERROR:", error);
    return new NextResponse("Webhook error", { status: 500 });
  }
}
