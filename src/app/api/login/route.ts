import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { generateTwoFactorToken } from "@/lib/tokens";
import { sendTwoFactorTokenEmail } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return new NextResponse("Informations manquantes", { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password || !user.email) {
      return new NextResponse("Email ou mot de passe incorrect.", { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return new NextResponse("Email ou mot de passe incorrect.", { status: 401 });
    }

    if (!user.emailVerified) {
      return new NextResponse("Veuillez vérifier votre adresse e-mail avant de vous connecter.", { status: 403 });
    }

    // Only send 2FA token if the user has specifically enabled Two-Factor Authentication
    if (user.isTwoFactorEnabled) {
      const twoFactorToken = await generateTwoFactorToken(user.email);
      await sendTwoFactorTokenEmail(user.email, twoFactorToken.token);
      return NextResponse.json({ success: true, twoFactorRequired: true });
    }

    // Standard user login: No 2FA required
    return NextResponse.json({ success: true, twoFactorRequired: false });
  } catch (error: any) {
    console.error("LOGIN_ERROR", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}
