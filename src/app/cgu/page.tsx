import type { Metadata } from "next";
import LegalPage, {
  LEGAL_CONTACT_EMAIL,
  type LegalSection,
} from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation | Level Up DZ",
};

const sections: LegalSection[] = [
  {
    heading: "Objet",
    paragraphs: [
      "Les présentes Conditions Générales d'Utilisation (CGU) encadrent l'utilisation de la plateforme Level Up DZ, qui propose des formations en ligne dispensées par des formateurs indépendants.",
      "En créant un compte ou en utilisant la plateforme, vous acceptez ces conditions sans réserve.",
    ],
  },
  {
    heading: "Compte utilisateur",
    paragraphs: [
      "Vous devez fournir des informations exactes (nom, adresse e-mail, numéro de téléphone, wilaya) et les maintenir à jour. Votre adresse e-mail doit être vérifiée par le code d'activation envoyé à l'inscription.",
      "Votre compte est strictement personnel. Vous êtes responsable de la confidentialité de votre mot de passe et de toute activité effectuée depuis votre compte. Nous vous conseillons d'activer la double authentification (2FA) depuis votre profil.",
    ],
  },
  {
    heading: "Accès aux formations et licence d'utilisation",
    paragraphs: [
      "L'achat ou l'inscription à une formation vous donne un droit d'accès personnel, non exclusif et non transférable au contenu de cette formation, pour un usage privé uniquement.",
      "Ce droit ne vous donne aucun droit de propriété sur les vidéos, supports ou documents, qui restent la propriété des formateurs ou de Level Up DZ.",
    ],
  },
  {
    heading: "Interdictions : partage, capture et diffusion",
    paragraphs: [
      "Sont strictement interdits : le partage ou la revente de votre compte, l'enregistrement ou la capture d'écran des vidéos, le téléchargement par un moyen non prévu par la plateforme, et la diffusion des contenus sur Telegram, Facebook ou tout autre canal.",
      "Tout contournement des protections techniques de la plateforme est également interdit.",
    ],
  },
  {
    heading: "Filigrane de protection",
    paragraphs: [
      "Pour lutter contre le piratage, le lecteur vidéo affiche en continu votre nom, votre adresse e-mail et votre numéro de téléphone par-dessus la vidéo.",
      "Si une vidéo est diffusée illégalement, ces informations permettent de vous identifier. Vous acceptez cette mesure en utilisant la plateforme.",
    ],
  },
  {
    heading: "Sanctions",
    paragraphs: [
      "En cas de violation de ces CGU, Level Up DZ peut suspendre ou supprimer votre compte immédiatement, sans préavis et sans remboursement, et se réserve le droit d'engager toute action légale.",
    ],
  },
  {
    heading: "Formateurs",
    paragraphs: [
      "Les formateurs garantissent être titulaires des droits sur les contenus qu'ils publient. Chaque cours est soumis à une modération avant sa publication, et peut être refusé ou retiré s'il ne respecte pas les règles de la plateforme.",
      "La commission de la plateforme et les modalités de retrait des gains sont présentées dans l'espace formateur.",
    ],
  },
  {
    heading: "Prix et paiement",
    paragraphs: [
      "Les prix sont indiqués en dinars algériens (DZD). Les paiements par carte EDAHABIA ou CIB sont traités par notre partenaire Chargily Pay : Level Up DZ ne conserve pas vos données bancaires.",
      "Les conditions de remboursement sont détaillées dans notre Politique de remboursement.",
    ],
  },
  {
    heading: "Responsabilité",
    paragraphs: [
      "Level Up DZ s'efforce d'assurer la disponibilité de la plateforme mais ne peut garantir un accès sans interruption. Les contenus pédagogiques sont fournis par les formateurs, qui en sont responsables.",
    ],
  },
  {
    heading: "Modification des CGU",
    paragraphs: [
      "Ces CGU peuvent être modifiées à tout moment. La date de dernière mise à jour figure en haut de cette page. Continuer à utiliser la plateforme après une modification vaut acceptation.",
    ],
  },
  {
    heading: "Droit applicable et contact",
    paragraphs: [
      "Les présentes CGU sont soumises au droit algérien. Pour toute question : " +
        LEGAL_CONTACT_EMAIL +
        ".",
    ],
  },
];

export default function CguPage() {
  return (
    <LegalPage
      title="Conditions Générales d'Utilisation"
      intro="Merci de lire ces conditions avec attention. Elles expliquent les règles à respecter pour utiliser Level Up DZ."
      updatedAt="4 octobre 2026"
      sections={sections}
    />
  );
}