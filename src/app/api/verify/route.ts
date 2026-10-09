import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyWelcome } from "@/lib/notifications";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return new NextResponse("Informations manquantes", { status: 400 });
    }

    const existingToken = await prisma.verificationToken.findFirst({
      where: { identifier: email, token: code },
    });

    if (!existingToken) {
      return new NextResponse("Code invalide ou expiré.", { status: 400 });
    }

    if (new Date() > existingToken.expires) {
      return new NextResponse("Ce code a expiré.", { status: 400 });
    }

    // Update the user
    const verifiedUser = await prisma.user.update({
      where: { email: existingToken.identifier },
      data: { emailVerified: new Date() },
    });

    // Delete the token
    await prisma.verificationToken.delete({
      where: { identifier_token: { identifier: email, token: code } },
    });
    await notifyWelcome(email, verifiedUser.name);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("VERIFY_ERROR", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}
