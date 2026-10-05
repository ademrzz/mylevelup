import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export interface PayoutRecord {
  id: string;
  instructorId: string;
  amount: number;
  method: string; // 'CCP' | 'BARIDIMOB'
  accountDetails: string;
  accountName: string;
  status: string; // 'PENDING' | 'PAID' | 'REJECTED'
  txReference?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
  instructorName?: string;
  instructorEmail?: string;
}

/**
 * Calculates instructor's gross sales, net earnings, paid payouts, and available withdrawable balance
 */
export async function getInstructorFinancials(instructorId: string, platformRate = 0.20) {
  // Fetch instructor's courses with enrollments
  const courses = await prisma.course.findMany({
    where: { instructorId },
    include: {
      enrollments: true,
    },
  });

  let totalGross = 0;
  let totalPaidSales = 0;

  for (const c of courses) {
    const enrolls = c.enrollments.length;
    const price = c.price || 0;
    totalGross += enrolls * price;
    if (price > 0) {
      totalPaidSales += enrolls;
    }
  }

  const teacherNetEarned = totalGross * (1 - platformRate);

  // Fetch all payouts for this instructor
  const payouts = await getInstructorPayouts(instructorId);

  // Total already paid or currently pending
  let totalPaidOut = 0;
  let totalPending = 0;

  for (const p of payouts) {
    if (p.status === "PAID") {
      totalPaidOut += p.amount;
    } else if (p.status === "PENDING") {
      totalPending += p.amount;
    }
  }

  const availableBalance = Math.max(0, teacherNetEarned - totalPaidOut - totalPending);

  return {
    totalGross,
    totalPaidSales,
    teacherNetEarned,
    totalPaidOut,
    totalPending,
    availableBalance,
  };
}

/**
 * Creates a new payout request
 */
export async function createPayoutRequest(
  instructorId: string,
  amount: number,
  method: string,
  accountDetails: string,
  accountName: string
): Promise<string> {
  const id = `payout_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

  await prisma.$executeRawUnsafe(
    `INSERT INTO PayoutRequest (id, instructorId, amount, method, accountDetails, accountName, status, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    id,
    instructorId,
    amount,
    method,
    accountDetails,
    accountName
  );

  return id;
}

/**
 * Retrieves all payout requests for a given instructor
 */
export async function getInstructorPayouts(instructorId: string): Promise<PayoutRecord[]> {
  try {
    const rows = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM PayoutRequest WHERE instructorId = ? ORDER BY createdAt DESC`,
      instructorId
    );
    return rows.map((r) => ({
      id: r.id,
      instructorId: r.instructorId,
      amount: Number(r.amount),
      method: r.method,
      accountDetails: r.accountDetails,
      accountName: r.accountName,
      status: r.status,
      txReference: r.txReference,
      rejectionReason: r.rejectionReason,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  } catch (e) {
    console.error("GET_INSTRUCTOR_PAYOUTS_ERROR:", e);
    return [];
  }
}

/**
 * Retrieves all payout requests across all instructors for Admin view
 */
export async function getAllPayoutRequests(): Promise<PayoutRecord[]> {
  try {
    const rows = await prisma.$queryRawUnsafe<any[]>(
      `SELECT p.*, u.name as instructorName, u.email as instructorEmail 
       FROM PayoutRequest p
       LEFT JOIN User u ON p.instructorId = u.id
       ORDER BY p.createdAt DESC`
    );
    return rows.map((r) => ({
      id: r.id,
      instructorId: r.instructorId,
      amount: Number(r.amount),
      method: r.method,
      accountDetails: r.accountDetails,
      accountName: r.accountName,
      status: r.status,
      txReference: r.txReference,
      rejectionReason: r.rejectionReason,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      instructorName: r.instructorName || "Enseignant",
      instructorEmail: r.instructorEmail || "",
    }));
  } catch (e) {
    console.error("GET_ALL_PAYOUTS_ERROR:", e);
    return [];
  }
}

/**
 * Updates payout status (Admin approves or rejects)
 */
export async function updatePayoutStatus(
  payoutId: string,
  status: "PAID" | "REJECTED",
  txReference?: string,
  rejectionReason?: string
) {
  await prisma.$executeRawUnsafe(
    `UPDATE PayoutRequest 
     SET status = ?, txReference = ?, rejectionReason = ?, updatedAt = CURRENT_TIMESTAMP
     WHERE id = ?`,
    status,
    txReference || null,
    rejectionReason || null,
    payoutId
  );
}
