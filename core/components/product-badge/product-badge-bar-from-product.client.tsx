'use client';

import BadgeBarFromEndpointClient from '~/components/product-badge/badge-bar-from-endpoint.client';

export default function ProductBadgeBarFromProductClient({
  entityId,
  className,
}: {
  entityId: number;
  className?: string;
}) {
  return (
    <BadgeBarFromEndpointClient
      className={className}
      endpoint={`/api/pdp/badges/?entityId=${entityId}`}

    />
  );
}
