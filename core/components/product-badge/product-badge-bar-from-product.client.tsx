'use client';

import { useEffect, useState } from 'react';

import { type Badge, BadgeBar } from '~/components/product-badge/badge-bar';

interface BadgesResponse {
  badges: Badge[];
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isBadgeVariant(value: unknown): value is Badge['variant'] {
  return (
    value === 'neutral' ||
    value === 'info' ||
    value === 'success' ||
    value === 'warning' ||
    value === 'sale'
  );
}

function isBadge(value: unknown): value is Badge {
  if (!isObject(value)) return false;

  const key = Reflect.get(value, 'key');
  const label = Reflect.get(value, 'label');
  const variant = Reflect.get(value, 'variant');
  const href = Reflect.get(value, 'href');

  if (typeof key !== 'string') return false;

  if (typeof label !== 'string') return false;

  if (!isBadgeVariant(variant)) return false;

  if (href !== undefined && typeof href !== 'string') return false;

  return true;
}

function isBadgesResponse(value: unknown): value is BadgesResponse {
  if (!isObject(value)) return false;

  const badges = Reflect.get(value, 'badges');

  if (!Array.isArray(badges)) return false;

  return badges.every(isBadge);
}

export default function ProductBadgeBarFromProduct({ entityId }: { entityId: number }) {
  const [badges, setBadges] = useState<Badge[] | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const setBadgesIfActive = (next: Badge[]) => {
      if (controller.signal.aborted) return;

      setBadges(next);
    };

    void (async () => {
      const res = await fetch(`/api/pdp/badges?entityId=${entityId}`, {
        signal: controller.signal,
      });

      if (!res.ok) {
        setBadgesIfActive([]);

        return;
      }

      const json: unknown = await res.json();

      if (!isBadgesResponse(json)) {
        setBadgesIfActive([]);

        return;
      }

      setBadgesIfActive(json.badges);
    })().catch(() => {
      setBadgesIfActive([]);
    });

    return () => {
      controller.abort();
    };
  }, [entityId]);

  if (badges === null) return null;

  return <BadgeBar badges={badges} />;
}
