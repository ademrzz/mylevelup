import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    // 🔒 Le rôle n'est volontairement PAS lu depuis la requête : sinon n'importe qui
    // pourrait s'inscrire en ADMIN. Tout nouveau compte est STUDENT ; on devient
    // formateur via une candidature validée par un admin.
    const { name, email, password, confirmPassword, phone, wilaya, image } = await req.json();

    if (!name || !email || !password) {
      return new NextResponse("Champs obligatoires manquants.", { status: 400 });
    }

    if (confirmPassword && password !== confirmPassword) {
      return new NextResponse("Les mots de passe ne correspondent pas.", { status: 400 });
    }

    if (password.length < 6) {
      return new NextResponse("Le mot de passe doit comporter au moins 6 caractères.", { status: 400 });
    }

    const exist = await prisma.user.findUnique({
      where: { email },
    });

    if (exist) {
      return new NextResponse("Email already exists", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        wilaya: wilaya || null,
        role: "STUDENT",
        image: image || null,
      },
    });

    // Generate and send 6-digit OTP
    const verificationToken = await generateVerificationToken(email);
    await sendVerificationEmail(verificationToken.identifier, verificationToken.token);

    return NextResponse.json({ success: true, email: user.email });
  } catch (error: any) {
    console.error("REGISTER_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}