import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { createChargilyCheckout } from "@/lib/chargily";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { courseId } = body;

    if (!courseId) {
      return new NextResponse("Missing courseId", { status: 400 });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course || !course.isPublished) {
      return new NextResponse("Course not found", { status: 404 });
    }

    if (!course.price || course.price <= 0) {
      return new NextResponse("Course is free, no payment needed", { status: 400 });
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      return new NextResponse("Already enrolled", { status: 400 });
    }

    const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const successUrl = `${appUrl}/courses/${course.id}/enroll/success`;
    const failureUrl = `${appUrl}/courses/${course.id}/enroll`;

    const { checkoutUrl, isSimulated } = await createChargilyCheckout({
      userId,
      courseId: course.id,
      courseTitle: course.title,
      amount: course.price,
      successUrl,
      failureUrl,
    });

    return NextResponse.json({
      checkoutUrl,
      isSimulated: !!isSimulated,
    });
  } catch (error: any) {
    console.error("CHARGILY_CHECKOUT_ERROR:", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}
