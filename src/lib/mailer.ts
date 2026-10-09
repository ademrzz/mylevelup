import { Resend } from "resend";

/* -------------------------------------------------------------------------- */
/*  Configuration                                                             */
/* -------------------------------------------------------------------------- */

const isProduction = process.env.NODE_ENV === "production";

// Client créé uniquement si une clé existe : l'app ne plante plus au chargement.
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// "onboarding@resend.dev" = offre gratuite (n'envoie qu'à l'email du compte Resend).
// En production, utilise une adresse d'un domaine vérifié : EMAIL_FROM_ADDRESS.
const SENDER_EMAIL = process.env.EMAIL_FROM_ADDRESS || "onboarding@resend.dev";

if (!resend && isProduction) {
  console.error("[MAILER] RESEND_API_KEY manquante : aucun email ne sera envoyé.");
}

/* -------------------------------------------------------------------------- */
/*  Utilitaires                                                               */
/* -------------------------------------------------------------------------- */

/** Échappe les caractères HTML pour empêcher toute injection dans les emails. */
const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/** URL de base du site. Obligatoire en production (pas de repli sur localhost). */
const getBaseUrl = (): string | null => {
  const url = process.env.NEXTAUTH_URL;
  if (url) return url.replace(/\/$/, "");
  return isProduction ? null : "http://localhost:3000";
};

/**
 * Affichage console UNIQUEMENT en développement.
 * En production, ne jamais écrire codes OTP, liens ou emails dans les logs.
 */
const devLog = (message: string) => {
  if (!isProduction) console.log(`\n${message}\n`);
};

/* -------------------------------------------------------------------------- */
/*  Gabarit et envoi                                                          */
/* -------------------------------------------------------------------------- */

const emailLayout = (title: string, titleColor: string, content: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
    <h2 style="color: ${titleColor}; text-align: center;">${title}</h2>
    ${content}
  </div>
`;

const codeBlock = (token: string) => `
  <div style="background: #f5f5f7; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
    <strong style="font-size: 32px; letter-spacing: 5px; color: #1d1d1f;">${escapeHtml(token)}</strong>
  </div>
`;

type DeliverParams = {
  to: string;
  fromName: string;
  subject: string;
  html: string;
};

/** Envoi centralisé : gère l'absence de clé, les erreurs et les logs de façon sûre. */
async function deliver({ to, fromName, subject, html }: DeliverParams) {
  if (!resend) {
    // Développement sans clé : le code est affiché par devLog dans le terminal.
    return isProduction ? null : { id: "dev-local" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `${fromName} <${SENDER_EMAIL}>`,
      to,
      subject,
      html,
    });

    if (error) {
      // On ne journalise que le message, jamais le contenu de l'email.
      console.error("[MAILER] Erreur Resend :", error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error(
      "[MAILER] Échec d'envoi :",
      err instanceof Error ? err.message : "erreur inconnue"
    );
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/*  Emails                                                                    */
/* -------------------------------------------------------------------------- */

export const sendVerificationEmail = async (email: string, token: string) => {
  devLog(`✉️ [EMAIL OTP] Code de vérification pour ${email} : ${token}`);

  return deliver({
    to: email,
    fromName: "Level Up DZ",
    subject: "Code d'activation de votre compte",
    html: emailLayout(
      "Bienvenue sur Level Up DZ!",
      "#fe9100",
      `
        <p style="color: #333; font-size: 16px;">Veuillez utiliser le code suivant pour activer votre compte. Ce code expirera dans 15 minutes.</p>
        ${codeBlock(token)}
        <p style="color: #86868b; font-size: 14px; text-align: center;">Si vous n'avez pas demandé ce code, ignorez cet e-mail.</p>
      `
    ),
  });
};

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  devLog(`🔒 [2FA OTP] Code pour ${email} : ${token}`);

  return deliver({
    to: email,
    fromName: "Level Up DZ Security",
    subject: "Code de vérification (2FA)",
    html: emailLayout(
      "Vérification de sécurité",
      "#00a0dc",
      `
        <p style="color: #333; font-size: 16px;">Quelqu'un essaie de se connecter à votre compte. Veuillez utiliser le code suivant pour confirmer votre identité.</p>
        ${codeBlock(token)}
        <p style="color: #86868b; font-size: 14px; text-align: center;">Ce code expirera dans 10 minutes.</p>
      `
    ),
  });
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    console.error("[MAILER] NEXTAUTH_URL manquante : email de réinitialisation non envoyé.");
    return null;
  }

  const resetLink = `${baseUrl}/reset-password?token=${encodeURIComponent(
    token
  )}&email=${encodeURIComponent(email)}`;

  devLog(`🔑 [PASSWORD RESET] Lien pour ${email} : ${resetLink}`);

  return deliver({
    to: email,
    fromName: "Level Up DZ",
    subject: "Réinitialisation de votre mot de passe",
    html: emailLayout(
      "Réinitialisation de mot de passe",
      "#fe9100",
      `
        <p style="color: #333; font-size: 16px;">Vous avez demandé à réinitialiser votre mot de passe pour Level Up DZ.</p>
        <p style="color: #555; font-size: 14px;">Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe sécurisé :</p>
        <div style="text-align: center; margin: 25px 0;">
          <a href="${escapeHtml(resetLink)}" style="background: linear-gradient(135deg, #fe9100 0%, #ff6b00 100%); color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 15px; box-shadow: 0 4px 14px rgba(254,145,0,0.3);">
            Réinitialiser mon mot de passe
          </a>
        </div>
        <p style="color: #86868b; font-size: 13px; line-height: 1.4; text-align: center;">Ce lien expirera dans 1 heure. Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet e-mail en toute sécurité.</p>
      `
    ),
  });
};
/* -------------------------------------------------------------------------- */
/*  Email de notification générique (événements de la plateforme)             */
/* -------------------------------------------------------------------------- */

export type NotificationEmail = {
  to: string;
  subject: string;
  title: string;
  /** Couleur du titre (hex). Par défaut : orange Level Up DZ. */
  color?: string;
  /** Texte brut : il est échappé automatiquement. */
  intro: string;
  /** Lignes d'information supplémentaires (texte brut, échappé). */
  details?: string[];
  /** Bouton optionnel : `path` est relatif au site (ex. "/dashboard"). */
  cta?: { label: string; path: string };
};

export const sendNotificationEmail = async ({
  to,
  subject,
  title,
  color = "#fe9100",
  intro,
  details = [],
  cta,
}: NotificationEmail) => {
  const baseUrl = getBaseUrl();
  const ctaUrl = cta && baseUrl ? `${baseUrl}${cta.path}` : null;

  devLog(`📨 [NOTIFICATION] ${subject} → ${to}`);

  const detailsHtml = details
    .map(
      (line) =>
        `<p style="color: #555; font-size: 14px; margin: 6px 0;">${escapeHtml(line)}</p>`
    )
    .join("");

  const buttonHtml =
    cta && ctaUrl
      ? `<div style="text-align: center; margin: 25px 0;">
          <a href="${escapeHtml(ctaUrl)}" style="background: ${color}; color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 15px;">
            ${escapeHtml(cta.label)}
          </a>
        </div>`
      : "";

  return deliver({
    to,
    fromName: "Level Up DZ",
    subject,
    html: emailLayout(
      escapeHtml(title),
      color,
      `
        <p style="color: #333; font-size: 16px; line-height: 1.5;">${escapeHtml(intro)}</p>
        ${detailsHtml}
        ${buttonHtml}
        <p style="color: #86868b; font-size: 12px; text-align: center; margin-top: 24px;">Level Up DZ — Développez vos compétences, construisez votre avenir.</p>
      `
    ),
  });
};