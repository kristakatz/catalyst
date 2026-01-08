'use client';

import { useEffect, useState } from 'react';
import { BadgeBar, type Badge } from '~/components/product-badge/BadgeBar';


export default function BadgeBarFromEndpoint({
  endpoint,
  className,
}: {
  endpoint: string;
  className?: string;
}) {
  const [badges, setBadges] = useState<Badge[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const res = await fetch(endpoint);

      if (!res.ok) {
        if (!cancelled) setBadges([]);
        return;
      }

      const data = (await res.json()) as { badges?: Badge[] };
      if (!cancelled) setBadges(data.badges ?? []);
    })();

    return () => {
      cancelled = true;
    };
  }, [endpoint]);

  if (badges == null) return null;
  return <BadgeBar badges={badges} className={className} />;
}
