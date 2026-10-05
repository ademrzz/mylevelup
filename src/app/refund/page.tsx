import type { Metadata } from "next";
import LegalPage, {
  LEGAL_CONTACT_EMAIL,
  type LegalSection,
} from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Politique de remboursement | Level Up DZ",
};

const sections: LegalSection[] = [
  {
    heading: "Principe général",
    paragraphs: [
      "Les formations de Level Up DZ sont des contenus numériques dont l'accès est immédiat après paiement. Pour cette raison, aucun remboursement n'est accordé dès lors que vous avez commencé à visionner une vidéo de la formation.",
    ],
  },
  {
    heading: "Cas où un remboursement est possible",
    paragraphs: [
      "Incident technique vérifié : si un problème de la plateforme vous empêche réellement de suivre la formation et que notre équipe ne peut pas le résoudre.",
      "Erreur de paiement : double paiement pour la même formation, ou montant débité différent du prix affiché.",
      "Formation non accessible : vous avez payé mais l'accès à la formation n'a pas été débloqué.",
    ],
  },
  {
    heading: "Cas où aucun remboursement n'est accordé",
    paragraphs: [
      "Changement d'avis après avoir commencé à regarder la formation, contenu ne correspondant pas à vos attentes alors que la description du cours était claire, ou compte suspendu à cause d'une violation des Conditions Générales d'Utilisation.",
    ],
  },
  {
    heading: "Comment faire une demande",
    paragraphs: [
      "Écrivez-nous à " +
        LEGAL_CONTACT_EMAIL +
        " en indiquant l'adresse e-mail de votre compte, le nom de la formation, la date du paiement et une description du problème (avec une capture d'écran si possible).",
      "Nous examinons chaque demande et vous répondons dans les meilleurs délais.",
    ],
  },
  {
    heading: "Modalités de remboursement",
    paragraphs: [
      "Lorsqu'un remboursement est accordé, il est effectué par le même moyen que le paiement initial. Les délais dépendent ensuite de votre banque ou de votre prestataire de paiement.",
    ],
  },
];

export default function RefundPage() {
  return (
    <LegalPage
      title="Politique de remboursement"
      intro="Nous voulons que vous soyez satisfait de votre achat, tout en protégeant le travail de nos formateurs. Voici les règles, expliquées simplement."
      updatedAt="4 octobre 2026"
      sections={sections}
    />
  );
}