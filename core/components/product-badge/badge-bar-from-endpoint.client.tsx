'use client';

import { useEffect, useState } from 'react';

import { type Badge, BadgeBar } from '~/components/product-badge/badge-bar';

function isBadge(value: unknown): value is Badge {
  if (typeof value !== 'object' || value === null) return false;

  const isVariant =
    Reflect.get(value, 'variant') === 'neutral' ||
    Reflect.get(value, 'variant') === 'info' ||
    Reflect.get(value, 'variant') === 'success' ||
    Reflect.get(value, 'variant') === 'warning' ||
    Reflect.get(value, 'variant') === 'sale';

  const isHref =
    Reflect.get(value, 'href') === undefined || typeof Reflect.get(value, 'href') === 'string';

  return (
    typeof Reflect.get(value, 'key') === 'string' &&
    typeof Reflect.get(value, 'label') === 'string' &&
    isVariant &&
    isHref
  );
}

function coerceBadges(value: unknown): Badge[] {
  if (!Array.isArray(value)) return [];

  return value.filter(isBadge);
}

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

    const run = async () => {
      try {
        const res = await fetch(endpoint);

        if (!res.ok) {
          if (!cancelled) setBadges([]);

          return;
        }

        const json: unknown = await res.json();

        const nextBadges = coerceBadges(
          typeof json === 'object' && json !== null ? Reflect.get(json, 'badges') : undefined,
        );

        if (!cancelled) setBadges(nextBadges);
      } catch {
        if (!cancelled) setBadges([]);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [endpoint]);

  if (badges == null || badges.length === 0) return null;

  return <BadgeBar badges={badges} className={className} />;
}
