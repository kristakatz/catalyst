import type { Badge, BadgeRuleContext } from './types';

interface BadgeRule {
  key: string;
  when: (ctx: BadgeRuleContext) => boolean;
  badge: Omit<Badge, 'key'>;
}

const rules: BadgeRule[] = [
  {
    key: 'planted-sale',
    when: ({ brandName }) => brandName.includes('planted'),
    badge: {
      label: 'SALE',
      variant: 'sale',
      href: '/sale',
    },
  },
];

export function getBadgesForProduct(ctx: BadgeRuleContext): Badge[] {
  return rules
    .filter((rule) => rule.when(ctx))
    .map((rule) => ({ key: rule.key, ...rule.badge }));
}
