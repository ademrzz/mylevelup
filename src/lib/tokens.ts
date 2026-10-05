import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export const generateVerificationToken = async (email: string) => {
  // Generate a 6-digit code
  const token = crypto.randomInt(100000, 999999).toString();
  const expires = new Date(new Date().getTime() + 15 * 60 * 1000); // Expires in 15 mins

  const existingToken = await prisma.verificationToken.findFirst({
    where: { identifier: email }
  });

  if (existingToken) {
    await prisma.verificationToken.delete({
      where: { identifier_token: { identifier: email, token: existingToken.token } }
    });
  }

  const verificationToken = await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    }
  });

  return verificationToken;
};

export const generateTwoFactorToken = async (email: string) => {
  const token = crypto.randomInt(100000, 999999).toString();
  const expires = new Date(new Date().getTime() + 10 * 60 * 1000); // Expires in 10 mins

  const existingToken = await prisma.twoFactorToken.findFirst({
    where: { email }
  });

  if (existingToken) {
    await prisma.twoFactorToken.delete({
      where: { id: existingToken.id }
    });
  }

  const twoFactorToken = await prisma.twoFactorToken.create({
    data: {
      email,
      token,
      expires,
    }
  });

  return twoFactorToken;
};

export const generatePasswordResetToken = async (email: string) => {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiration
  const identifier = `reset_${email}`;

  const existingToken = await prisma.verificationToken.findFirst({
    where: { identifier },
  });

  if (existingToken) {
    await prisma.verificationToken.delete({
      where: { identifier_token: { identifier, token: existingToken.token } },
    });
  }

  const passwordResetToken = await prisma.verificationToken.create({
    data: {
      identifier,
      token,
      expires,
    },
  });

  return passwordResetToken;
};

