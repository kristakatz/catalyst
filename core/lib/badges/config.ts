// lib/badges/config.ts
export type BadgeVariant = "neutral" | "info" | "success" | "warning" | "sale";

export type BadgeRuleInput = {
  entityId: number;
  sku?: string | null;
  brandName?: string | null;
  price?: number | null;
  isFreeShippingEligible?: boolean | null;
  isB2BOnly?: boolean | null;
};

export type Badge = {
  key: string;
  label: string;
  variant: BadgeVariant;
  href?: string;
};

export function computeBadges(input: BadgeRuleInput): Badge[] {
  const badges: Badge[] = [];

  // Example rules (edit these freely)
  if (input.isFreeShippingEligible) {
    badges.push({
      key: "free-shipping",
      label: "Ships Free Over $99",
      variant: "info",
      href: "/shipping",
    });
  }

  if (input.isB2BOnly) {
    badges.push({
      key: "b2b-only",
      label: "B2B Only Item",
      variant: "warning",
      href: "/login",
    });
  }

  if (input.brandName?.toLowerCase() === "planted") {
    badges.push({
      key: "planted-brand",
      label: "Planted Exclusive",
      variant: "sale",
    });
  }

  return badges;
}
