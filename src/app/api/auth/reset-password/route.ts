import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const { email, token, password } = await req.json();

    if (!email || !token || !password) {
      return new NextResponse("Informations manquantes.", { status: 400 });
    }

    if (password.length < 6) {
      return new NextResponse("Le mot de passe doit contenir au moins 6 caractères.", { status: 400 });
    }

    const identifier = `reset_${email}`;

    // Verify token exists and is valid
    const existingToken = await prisma.verificationToken.findFirst({
      where: {
        identifier,
        token,
      },
    });

    if (!existingToken) {
      return new NextResponse("Lien de réinitialisation invalide ou déjà utilisé.", { status: 400 });
    }

    const hasExpired = new Date(existingToken.expires) < new Date();
    if (hasExpired) {
      await prisma.verificationToken.delete({
        where: { identifier_token: { identifier, token } },
      });
      return new NextResponse("Ce lien a expiré. Veuillez refaire une demande.", { status: 400 });
    }

    // Find target user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return new NextResponse("Utilisateur introuvable.", { status: 404 });
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Delete used reset token
    await prisma.verificationToken.delete({
      where: { identifier_token: { identifier, token } },
    });

    return NextResponse.json({
      success: true,
      message: "Votre mot de passe a été mis à jour avec succès.",
    });
  } catch (error: any) {
    console.error("RESET_PASSWORD_ERROR:", error);
    return new NextResponse("Erreur interne du serveur.", { status: 500 });
  }
}
