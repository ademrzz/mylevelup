"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Recharge la page toutes les quelques secondes (pour attendre la confirmation
 * du paiement par le webhook), puis s'arrête au bout de maxTimes essais.
 */
export default function RefreshOnInterval({
  everyMs = 3000,
  maxTimes = 20,
}: {
  everyMs?: number;
  maxTimes?: number;
}) {
  const router = useRouter();

  useEffect(() => {
    let count = 0;
    const id = setInterval(() => {
      count += 1;
      router.refresh();
      if (count >= maxTimes) clearInterval(id);
    }, everyMs);
    return () => clearInterval(id);
  }, [router, everyMs, maxTimes]);

  return null;
}