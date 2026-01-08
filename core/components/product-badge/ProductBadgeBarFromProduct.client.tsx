'use client';

import { useEffect, useState } from 'react';
import { BadgeBar, type Badge } from '~/components/product-badge/BadgeBar';

type ProductResponse = {
  brand?: { name?: string | null } | null;
};

export default function ProductBadgeBarFromProduct({ entityId }: { entityId: number }) {
  const [badges, setBadges] = useState<Badge[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const res = await fetch(`/api/products/${entityId}`);
      if (!res.ok) {
        if (!cancelled) setBadges([]);
        return;
      }

      const product = (await res.json()) as ProductResponse;
      const brandName = product?.brand?.name?.trim().toLowerCase() ?? '';

      const computed: Badge[] = brandName.includes('planted')
        ? [{ key: 'planted-sale', label: 'SALE', variant: 'sale', href: '/sale' }]
        : [];

      if (!cancelled) setBadges(computed);
    })();

    return () => {
      cancelled = true;
    };
  }, [entityId]);

  if (badges == null) return null;
  return <BadgeBar badges={badges} />;

}
