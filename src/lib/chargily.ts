import crypto from "crypto";

const CHARGILY_MODE = process.env.CHARGILY_MODE || "test";
const CHARGILY_SECRET_KEY = process.env.CHARGILY_SECRET_KEY || "";

const CHARGILY_BASE_URL = CHARGILY_MODE === "live"
  ? "https://pay.chargily.net/api/v2"
  : "https://pay.chargily.net/test/api/v2";

interface CreateCheckoutParams {
  userId: string;
  courseId: string;
  courseTitle: string;
  amount: number;
  successUrl: string;
  failureUrl: string;
}

export async function createChargilyCheckout({
  userId,
  courseId,
  courseTitle,
  amount,
  successUrl,
  failureUrl,
}: CreateCheckoutParams): Promise<{ checkoutUrl: string; isSimulated?: boolean }> {
  // If no secret key is set yet, provide an instant test fallback so development and testing works immediately
  if (!CHARGILY_SECRET_KEY || CHARGILY_SECRET_KEY === "your_chargily_secret_key_here") {
    console.warn("⚠️ CHARGILY_SECRET_KEY is not configured in .env. Running in local test simulation mode.");
    
    // Simulate instant success redirect with mock checkout ID
    const simulatedUrl = `${successUrl}${successUrl.includes("?") ? "&" : "?"}checkout_id=test_chk_${Date.now()}&simulated=true`;
    return { checkoutUrl: simulatedUrl, isSimulated: true };
  }

  try {
    const response = await fetch(`${CHARGILY_BASE_URL}/checkouts`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CHARGILY_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Math.round(amount),
        currency: "dzd",
        payment_method: "edahabia", // EDAHABIA / CIB handled automatically by Chargily
        success_url: successUrl,
        failure_url: failureUrl,
        metadata: {
          userId,
          courseId,
          courseTitle,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Chargily API error:", response.status, errorText);
      throw new Error(`Chargily API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return { checkoutUrl: data.checkout_url };
  } catch (error) {
    console.error("Failed to create Chargily checkout:", error);
    throw error;
  }
}

export function verifyChargilySignature(rawBody: string, signature: string): boolean {
  if (!CHARGILY_SECRET_KEY) return true; // In local development without keys

  try {
    const computedSignature = crypto
      .createHmac("sha256", CHARGILY_SECRET_KEY)
      .update(rawBody)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(computedSignature)
    );
  } catch (err) {
    console.error("Signature verification error:", err);
    return false;
  }
}
