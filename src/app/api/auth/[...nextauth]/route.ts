import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      })
    ] : []),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
        code: { label: "Code 2FA", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password || !user.email) {
          throw new Error("Aucun utilisateur trouvé avec cet email.");
        }

        if (!user.emailVerified) {
          throw new Error("Veuillez vérifier votre adresse e-mail avant de vous connecter.");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error("Email ou mot de passe incorrect.");
        }

        // If Two-Factor Authentication is enabled for this user, strictly verify the 6-digit code
        if (user.isTwoFactorEnabled) {
          if (!credentials.code) {
            throw new Error("Code de vérification (2FA) requis.");
          }

          const twoFactorToken = await prisma.twoFactorToken.findFirst({
            where: { email: user.email },
          });

          if (!twoFactorToken || twoFactorToken.token !== credentials.code.trim()) {
            throw new Error("Code 2FA incorrect.");
          }

          const hasExpired = new Date(twoFactorToken.expires) < new Date();
          if (hasExpired) {
            throw new Error("Le code 2FA a expiré.");
          }

          // Consume the used token
          await prisma.twoFactorToken.delete({
            where: { id: twoFactorToken.id },
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "development-super-secret-key-12345",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
