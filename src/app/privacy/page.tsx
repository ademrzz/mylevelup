import type { Metadata } from "next";
import LegalPage, {
  LEGAL_CONTACT_EMAIL,
  type LegalSection,
} from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Politique de confidentialité | Level Up DZ",
};

const sections: LegalSection[] = [
  {
    heading: "Données que nous collectons",
    paragraphs: [
      "À l'inscription et dans votre profil : nom, adresse e-mail, numéro de téléphone, wilaya et photo de profil (facultative).",
      "Pendant l'utilisation : les formations auxquelles vous êtes inscrit, votre progression, vos avis et vos paiements (montant, date, statut).",
      "Votre mot de passe n'est jamais stocké en clair : il est transformé de façon irréversible (hachage) avant d'être enregistré.",
    ],
  },
  {
    heading: "Pourquoi nous les utilisons",
    paragraphs: [
      "Pour créer et sécuriser votre compte, vous donner accès à vos formations, traiter vos paiements, suivre votre progression, délivrer vos certificats et vous envoyer les e-mails nécessaires (code d'activation, code 2FA, réinitialisation du mot de passe).",
      "Nous n'envoyons pas de publicité et nous ne vendons pas vos données.",
    ],
  },
  {
    heading: "Le filigrane vidéo",
    paragraphs: [
      "Pendant la lecture d'une vidéo, votre nom, votre adresse e-mail et votre numéro de téléphone sont affichés par-dessus l'image. Cette mesure sert uniquement à dissuader le piratage et à identifier l'origine d'une fuite éventuelle.",
      "Ces informations ne sont visibles que sur votre propre écran pendant la lecture.",
    ],
  },
  {
    heading: "Partenaires qui traitent des données",
    paragraphs: [
      "Chargily Pay traite les paiements par carte EDAHABIA et CIB. Vos données bancaires sont saisies chez le prestataire de paiement et ne sont pas conservées par Level Up DZ.",
      "Resend est utilisé pour l'envoi des e-mails transactionnels. Notre hébergeur et notre prestataire de stockage conservent les données techniques nécessaires au fonctionnement du site.",
    ],
  },
  {
    heading: "Cookies",
    paragraphs: [
      "Nous utilisons uniquement les cookies nécessaires au fonctionnement du site, notamment le cookie de session qui vous maintient connecté.",
    ],
  },
  {
    heading: "Durée de conservation",
    paragraphs: [
      "Vos données sont conservées tant que votre compte est actif. Vous pouvez demander la suppression de votre compte à tout moment ; certaines informations (par exemple les traces de paiement) peuvent être conservées plus longtemps lorsque la loi l'exige.",
    ],
  },
  {
    heading: "Vos droits",
    paragraphs: [
      "Vous pouvez accéder à vos données, les corriger (depuis votre page de profil) ou demander leur suppression. Pour toute demande, écrivez-nous à " +
        LEGAL_CONTACT_EMAIL +
        ".",
      "Le traitement des données personnelles est encadré en Algérie par la loi n° 18-07 relative à la protection des personnes physiques dans le traitement des données à caractère personnel.",
    ],
  },
  {
    heading: "Sécurité",
    paragraphs: [
      "Nous mettons en œuvre des mesures raisonnables pour protéger vos données : mots de passe hachés, vérification de l'e-mail, double authentification optionnelle et liens de réinitialisation à durée limitée. Aucun système n'étant infaillible, nous vous recommandons un mot de passe unique et robuste.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Politique de confidentialité"
      intro="Nous collectons le minimum de données nécessaire au fonctionnement de la plateforme, et nous expliquons ici lesquelles et pourquoi."
      updatedAt="4 octobre 2026"
      sections={sections}
    />
  );
}