import { NextRequest, NextResponse } from 'next/server';

import { getBadgesForProduct } from '~/lib/badges/config';
import type { Badge } from '~/lib/badges/types';



interface ProductResponse {
  brand?: { name?: string | null } | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isProductResponse(value: unknown): value is ProductResponse {
  if (!isRecord(value)) return false;

  const brand = value.brand;

  if (brand === undefined || brand === null) return true;
  if (!isRecord(brand)) return false;

  const name = brand.name;

  return name === undefined || name === null || typeof name === 'string';
}

function safeJsonParse(text: string): unknown {
  try {
    // JSON.parse returns `any`, but we store it as `unknown`
    const parsed: unknown = JSON.parse(text);
    return parsed;
  } catch {
    return null;
  }
}

function empty(entityId: number): NextResponse {
  return NextResponse.json({ entityId, badges: [] satisfies Badge[] }, { status: 200 });
}

export async function GET(request: NextRequest) {
  let entityId = 0;

  try {
    const { searchParams, origin } = request.nextUrl;

    const entityIdParam = searchParams.get('entityId');

    entityId = Number(entityIdParam);

    if (!Number.isFinite(entityId)) {
      return NextResponse.json({ error: 'entityId must be a number' }, { status: 400 });
    }

    // Preserve locale + auth context when Makeswift iframe loads
    const cookie = request.headers.get('cookie') ?? '';
    const acceptLanguage = request.headers.get('accept-language') ?? '';
    const locale = searchParams.get('locale');

   // IMPORTANT: force canonical trailing slash to match `trailingSlash: true`
      const productUrl = new URL(`${origin}/api/products/${entityId}/`);

      if (locale != null && locale.trim().length > 0) {
      productUrl.searchParams.set('locale', locale);
    } 

    const productRes = await fetch(productUrl.toString(), {
      headers: {
        cookie,
        'accept-language': acceptLanguage,
      },
      cache: 'no-store',
    });

    if (!productRes.ok) return empty(entityId);

    const text = await productRes.text();
    const json = safeJsonParse(text);

    if (!isProductResponse(json)) return empty(entityId);

    const brandName = (json.brand?.name ?? '').trim().toLowerCase();
    const badges = getBadgesForProduct({ brandName });

    return NextResponse.json({ entityId, badges }, { status: 200 });
 } catch (err: unknown) {
  // Never throw from this endpoint — Makeswift iframe should stay resilient.
  console.error('Badges endpoint failed', { entityId }, err);

  return empty(entityId);
}
}
