// app/api/pdp/badges/route.ts
import { NextResponse } from 'next/server';

import { computeBadges } from './config';

/**
 * Replace this with your existing Catalyst/Storefront GraphQL fetch helper if you have one.
 * This is intentionally "simple endpoint" style.
 */
async function fetchProductForBadges(entityId: number) {
  // Minimal shape for rule evaluation. Implement with Storefront GraphQL query.
  // In a real project you’d call BC Storefront GraphQL API and map the response.
  return {
    entityId,
    sku: null as string | null,
    brandName: null as string | null,
    price: null as number | null,
    isFreeShippingEligible: true as boolean | null,
    isB2BOnly: false as boolean | null,
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const entityIdStr = searchParams.get('entityId');

  if (!entityIdStr) {
    return NextResponse.json({ error: 'Missing required query param: entityId' }, { status: 400 });
  }

  const entityId = Number(entityIdStr);

  if (!Number.isFinite(entityId)) {
    return NextResponse.json({ error: 'entityId must be a number' }, { status: 400 });
  }

  const product = await fetchProductForBadges(entityId);
  const badges = computeBadges(product);

  return NextResponse.json({ entityId, badges }, { status: 200 });
}
