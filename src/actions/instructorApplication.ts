"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitInstructorApplication(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Non autorisé. Veuillez vous connecter.");
  }

  const userId = (session.user as any).id;
  const specialty = (formData.get("specialty") as string)?.trim();
  const bio = (formData.get("bio") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const wilaya = (formData.get("wilaya") as string)?.trim();
  const portfolioUrl = (formData.get("portfolioUrl") as string)?.trim();

  if (!specialty || specialty.length < 3) {
    throw new Error("Veuillez préciser votre spécialité ou domaine d'enseignement.");
  }
  if (!bio || bio.length < 10) {
    throw new Error("Veuillez décrire brièvement vos compétences ou expérience (au moins 10 caractères).");
  }
  if (!phone || phone.length < 8) {
    throw new Error("Veuillez fournir un numéro de téléphone valide.");
  }

  // Update user's phone & wilaya if empty
  await prisma.user.update({
    where: { id: userId },
    data: {
      phone: phone || undefined,
      wilaya: wilaya || undefined,
    },
  });

  // Upsert application
  await prisma.instructorApplication.upsert({
    where: { userId },
    update: {
      specialty,
      bio,
      phone,
      wilaya: wilaya || null,
      portfolioUrl: portfolioUrl || null,
      status: "PENDING",
      rejectionReason: null,
      updatedAt: new Date(),
    },
    create: {
      userId,
      specialty,
      bio,
      phone,
      wilaya: wilaya || null,
      portfolioUrl: portfolioUrl || null,
      status: "PENDING",
    },
  });

  revalidatePath("/dashboard/profile");
  revalidatePath("/admin/users");
  revalidatePath("/admin");
  return { success: true };
}

export async function cancelInstructorApplication() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Non autorisé.");
  }

  const userId = (session.user as any).id;
  await prisma.instructorApplication.deleteMany({
    where: { userId, status: "PENDING" },
  });

  revalidatePath("/dashboard/profile");
  revalidatePath("/admin/users");
  return { success: true };
}

export async function approveInstructorApplication(applicationId: string) {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;
  if (userRole !== "ADMIN") {
    throw new Error("Seul un administrateur peut valider une candidature formateur.");
  }

  const app = await prisma.instructorApplication.findUnique({
    where: { id: applicationId },
  });
  if (!app) {
    throw new Error("Candidature introuvable.");
  }

  await prisma.$transaction([
    prisma.instructorApplication.update({
      where: { id: applicationId },
      data: {
        status: "APPROVED",
        rejectionReason: null,
        reviewedAt: new Date(),
      },
    }),
    prisma.user.update({
      where: { id: app.userId },
      data: {
        role: "INSTRUCTOR",
      },
    }),
  ]);

  revalidatePath("/admin/users");
  revalidatePath("/admin");
  revalidatePath("/dashboard/profile");
  return { success: true };
}

export async function rejectInstructorApplication(applicationId: string, reason: string) {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;
  if (userRole !== "ADMIN") {
    throw new Error("Seul un administrateur peut rejeter une candidature formateur.");
  }

  await prisma.instructorApplication.update({
    where: { id: applicationId },
    data: {
      status: "REJECTED",
      rejectionReason: reason || "Profil incomplet ou ne répondant pas aux critères requis.",
      reviewedAt: new Date(),
    },
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin");
  revalidatePath("/dashboard/profile");
  return { success: true };
}
