import { NextRequest, NextResponse } from 'next/server';

type BadgeVariant = 'neutral' | 'info' | 'success' | 'warning' | 'sale';
type Badge = { key: string; label: string; variant: BadgeVariant; href?: string };

export async function GET(request: NextRequest) {
  const entityId = request.nextUrl.searchParams.get('entityId');

  if (!entityId) {
    return NextResponse.json({ badges: [] });
  }

  // Reuse your existing product API
  const productRes = await fetch(`${request.nextUrl.origin}/api/products/${entityId}`, {
    cache: 'no-store',
  });

  if (!productRes.ok) {
    return NextResponse.json({ badges: [] });
  }

  const product = await productRes.json();
  const brandName = (product?.brand?.name ?? '').toString().trim().toLowerCase();

  const badges: Badge[] =
    brandName === 'planted'
      ? [{ key: 'planted-sale', label: 'Sale', variant: 'sale', href: '/sale' }]
      : [];

  return NextResponse.json({ badges });
}
