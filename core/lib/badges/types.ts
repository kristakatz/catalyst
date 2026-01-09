export interface Badge {
  key: string;
  label: string;
  variant: 'neutral' | 'info' | 'success' | 'warning' | 'sale';
  href?: string;
}

export interface BadgeRuleContext {
  brandName: string;
}
