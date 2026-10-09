import crypto from "crypto";

/* -------------------------------------------------------------------------- */
/*  Configuration                                                             */
/* -------------------------------------------------------------------------- */

const isProduction = process.env.NODE_ENV === "production";

const CHARGILY_MODE = process.env.CHARGILY_MODE === "live" ? "live" : "test";
const CHARGILY_SECRET_KEY = process.env.CHARGILY_SECRET_KEY || "";
const PLACEHOLDER_KEY = "your_chargily_secret_key_here";

const hasRealKey =
  CHARGILY_SECRET_KEY !== "" && CHARGILY_SECRET_KEY !== PLACEHOLDER_KEY;

/** Simulation de paiement : uniquement en développement local, sans clé Chargily. */
export const isPaymentSimulationEnabled = !isProduction && !hasRealKey;

const CHARGILY_BASE_URL =
  CHARGILY_MODE === "live"
    ? "https://pay.chargily.net/api/v2"
    : "https://pay.chargily.net/test/api/v2";

if (isProduction && !hasRealKey) {
  console.error(
    "[CHARGILY] CHARGILY_SECRET_KEY manquante : les paiements sont désactivés."
  );
}
if (isProduction && hasRealKey && CHARGILY_MODE !== "live") {
  console.warn(
    "[CHARGILY] Mode TEST actif en production : aucun vrai paiement n'est prélevé. " +
      "Mettre CHARGILY_MODE=live avant le lancement public."
  );
}

/** Erreur levée quand le paiement n'est pas configuré en production. */
export class PaymentNotConfiguredError extends Error {
  constructor() {
    super("PAYMENT_NOT_CONFIGURED");
    this.name = "PaymentNotConfiguredError";
  }
}

/* -------------------------------------------------------------------------- */
/*  Création d'un paiement                                                    */
/* -------------------------------------------------------------------------- */

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
  if (!hasRealKey) {
    // 🔒 La simulation n'existe qu'en développement local.
    // En production, sans clé : on refuse, on ne donne JAMAIS le cours.
    if (isProduction) {
      throw new PaymentNotConfiguredError();
    }

    console.warn(
      "⚠️ CHARGILY_SECRET_KEY absente : mode simulation (développement local uniquement)."
    );
    const simulatedUrl = `${successUrl}${
      successUrl.includes("?") ? "&" : "?"
    }checkout_id=test_chk_${Date.now()}&simulated=true`;
    return { checkoutUrl: simulatedUrl, isSimulated: true };
  }

  try {
    const response = await fetch(`${CHARGILY_BASE_URL}/checkouts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CHARGILY_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Math.round(amount),
        currency: "dzd",
        payment_method: "edahabia",
        success_url: successUrl,
        failure_url: failureUrl,
        metadata: { userId, courseId, courseTitle },
      }),
      signal: AbortSignal.timeout(15000), // évite d'attendre indéfiniment
    });

    if (!response.ok) {
      // On journalise côté serveur seulement, jamais renvoyé au navigateur.
      console.error("Chargily API error:", response.status, await response.text());
      throw new Error("CHARGILY_API_ERROR");
    }

    const data = await response.json();
    if (!data?.checkout_url || typeof data.checkout_url !== "string") {
      throw new Error("CHARGILY_INVALID_RESPONSE");
    }
    return { checkoutUrl: data.checkout_url };
  } catch (error) {
    console.error(
      "Failed to create Chargily checkout:",
      error instanceof Error ? error.message : "unknown"
    );
    throw error;
  }
}

/* -------------------------------------------------------------------------- */
/*  Vérification de la signature du webhook                                   */
/* -------------------------------------------------------------------------- */

/**
 * Retourne true UNIQUEMENT si la signature est présente ET correcte.
 * Sans clé configurée ou sans signature : toujours false (jamais d'exception).
 */
export function verifyChargilySignature(
  rawBody: string,
  signature: string
): boolean {
  if (!hasRealKey || !signature) return false;

  try {
    const computed = crypto
      .createHmac("sha256", CHARGILY_SECRET_KEY)
      .update(rawBody)
      .digest("hex");

    const received = Buffer.from(signature, "utf8");
    const expected = Buffer.from(computed, "utf8");

    if (received.length !== expected.length) return false;
    return crypto.timingSafeEqual(received, expected);
  } catch (err) {
    console.error("Signature verification error:", err);
    return false;
  }
}