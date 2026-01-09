// app/api/pdp/badges/route.ts
import { NextResponse } from 'next/server';

interface Badge {
  key: string;
  label: string;
  variant: 'neutral' | 'info' | 'success' | 'warning' | 'sale';
  href?: string;
}

interface ProductResponse {
  brand?: { name?: string | null } | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isProductResponse(value: unknown): value is ProductResponse {
  if (!isRecord(value)) return false;

  const brand = value.brand;

  // brand is optional
  if (brand === undefined || brand === null) return true;

  if (!isRecord(brand)) return false;

  const name = brand.name;

  // name is optional
  return name === undefined || name === null || typeof name === 'string';
}

export async function GET(request: Request) {
  const emptyBadges: Badge[] = [];

  const { searchParams } = new URL(request.url);

  const entityIdParam = searchParams.get('entityId');

  if (entityIdParam == null) {
    return NextResponse.json({ error: 'Missing required query param: entityId' }, { status: 400 });
  }

  const entityId = Number(entityIdParam);

  if (Number.isNaN(entityId)) {
    return NextResponse.json({ error: 'entityId must be a number' }, { status: 400 });
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/api/products/${entityId}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    return NextResponse.json({ badges: emptyBadges });
  }

  const json: unknown = await res.json();

  if (!isProductResponse(json)) {
    return NextResponse.json({ badges: emptyBadges });
  }

  const brandName = json.brand?.name?.trim().toLowerCase() ?? '';

  const badges: Badge[] = brandName.includes('planted')
    ? [{ key: 'planted-sale', label: 'SALE', variant: 'sale', href: '/sale' }]
    : [];

  return NextResponse.json({ badges });
}
