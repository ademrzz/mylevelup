import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generatePasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = body?.email;
    if (!email || typeof email !== "string") {
      return new NextResponse("Email requis.", { status: 400 });
    }
    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: normalizedEmail,
        },
      },
    });

    // To prevent email enumeration attacks in production, return success even if user not found
    if (!user || !user.email) {
      return NextResponse.json({
        success: true,
        message: "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.",
      });
    }

    // Generate token and send email
    const passwordResetToken = await generatePasswordResetToken(user.email);
    const domain = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetUrl = `${domain}/reset-password?token=${passwordResetToken.token}&email=${encodeURIComponent(user.email)}`;

    await sendPasswordResetEmail(user.email, passwordResetToken.token);

    return NextResponse.json({
      success: true,
      message: "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.",
      // In development mode, provide direct reset link so local testing works without email delivery
      debugResetUrl: resetUrl,
    });
  } catch (error: any) {
    console.error("FORGOT_PASSWORD_ERROR:", error);
    return new NextResponse("Erreur interne du serveur.", { status: 500 });
  }
}
