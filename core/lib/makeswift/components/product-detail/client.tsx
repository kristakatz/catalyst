'use client';

import React, {
  Children,
  type ComponentPropsWithoutRef,
  createContext,
  forwardRef,
  isValidElement,
  type PropsWithChildren,
  type ReactNode,
  useCallback,
  useContext,
} from 'react';

import { Stream, type Streamable } from '@/vibes/soul/lib/streamable';
import { ProductDetail, ProductDetailSkeleton } from '@/vibes/soul/sections/product-detail';
import { BadgeBar } from '~/components/product-badge/badge-bar';
import ProductBadgeBarFromProductClient from '~/components/product-badge/product-badge-bar-from-product.client';
import { mergeSections } from '~/lib/makeswift/utils/merge-sections';

type VibesProductDetailProps = ComponentPropsWithoutRef<typeof ProductDetail>;
type VibesProductDetail = Exclude<Awaited<VibesProductDetailProps['product']>, null>;

export type ProductDetail = VibesProductDetail & {
  plainTextDescription?: string;
};

export type Props = Omit<VibesProductDetailProps, 'product'> & {
  product: Streamable<ProductDetail>;
  productId: number; // ✅ add this
};

const PropsContext = createContext<Props | null>(null);

export const PropsContextProvider = ({ value, children }: PropsWithChildren<{ value: Props }>) => (
  <PropsContext.Provider value={value}>{children}</PropsContext.Provider>
);

export const DescriptionSource = {
  CatalogPlainText: 'CatalogPlainText',
  CatalogRichText: 'CatalogRichText',
  Custom: 'Custom',
} as const;

type DescriptionSource = (typeof DescriptionSource)[keyof typeof DescriptionSource];

type BadgeVariant = 'sale' | 'neutral' | 'info' | 'success' | 'warning';
type BadgePlacement = 'UnderTitle';

interface EditableProps {
  summaryText: string | undefined;
  description: { source: DescriptionSource; slot: ReactNode };
  accordions: Exclude<Awaited<VibesProductDetail['accordions']>, undefined>;

  badges: {
    enabled: boolean;
    placement: BadgePlacement;
    items: Array<{
      label: string;
      variant: BadgeVariant;
      href: string;
    }>;
    slot: ReactNode;
  };
}

type EditablePropsWithoutBadges = Omit<EditableProps, 'badges'>;

function hasRenderableSlotContent(node: ReactNode | undefined): boolean {
  if (node == null) return false;

  return Children.toArray(node).some((child) => {
    if (typeof child === 'string') return child.trim().length > 0;
    if (typeof child === 'number') return true;

    if (isValidElement<{ children?: ReactNode }>(child)) {
      return hasRenderableSlotContent(child.props.children);
    }

    return false;
  });
}

function ProductDetailImpl({
  summaryText,
  description,
  accordions,
  product: streamableProduct,
  badgeBar,
  ...props
}: Props & EditablePropsWithoutBadges & { badgeBar?: ReactNode }) {
  const getProductDescription = useCallback(
    (product: ProductDetail): ProductDetail['description'] => {
      switch (description.source) {
        case DescriptionSource.CatalogPlainText:
          return product.plainTextDescription;

        case DescriptionSource.CatalogRichText:
          return product.description;

        case DescriptionSource.Custom:
          return description.slot;
      }
    },
    [description.source, description.slot],
  );

  const getProductAccordions = useCallback(
    (
      productAccordions: Awaited<ProductDetail['accordions']>,
    ): Awaited<ProductDetail['accordions']> => {
      if (productAccordions === undefined) return undefined;

      return mergeSections(productAccordions, accordions, (left, right) => ({
        ...left,
        content: right.content,
      }));
    },
    [accordions],
  );

  return (
    <Stream fallback={<ProductDetailSkeleton />} value={streamableProduct}>
      {(product) => (
        <Stream fallback={<ProductDetailSkeleton />} value={product.accordions}>
          {(productAccordions) => (
            <ProductDetail
              {...{
                ...props,
                badgeBar,
                product: {
                  ...product,
                  summary: summaryText,
                  description: getProductDescription(product),
                  accordions: getProductAccordions(productAccordions),
                },
              }}
            />
          )}
        </Stream>
      )}
    </Stream>
  );
}

export const MakeswiftProductDetail = forwardRef<HTMLDivElement, EditableProps>(
  function MakeswiftProductDetail(props, ref) {
    const passedProps = useContext(PropsContext);

    if (passedProps == null) {
      // eslint-disable-next-line no-console
      console.error('No context provided for MakeswiftProductDetail');

      return <p ref={ref}>There was an error rendering the product detail.</p>;
    }

    const ctx = passedProps;

    // Don't forward badges into ProductDetailImpl
    const { badges, ...editable } = props;

    const enabled = badges.enabled;

    const slot = badges.slot;
    const slotHasContent = hasRenderableSlotContent(slot);

    const configuredItems = badges.items;

    const normalizedBadges = configuredItems
      .filter((b) => b.label.trim().length > 0)
      .map((b, index) => ({
        key: `makeswift-${index}-${b.label}`,
        label: b.label,
        variant: b.variant,
        href: b.href.trim().length > 0 ? b.href : undefined,
      }));

    let badgeNode: ReactNode = null;

    if (enabled) {
      if (slotHasContent) {
        badgeNode = slot;
      } else if (normalizedBadges.length > 0) {
        badgeNode = <BadgeBar badges={normalizedBadges} />;
      } else {
        badgeNode = <ProductBadgeBarFromProductClient entityId={ctx.productId} />;
      }
    }

    return (
      <div className="flex flex-col gap-3" ref={ref}>
        <ProductDetailImpl {...{ ...ctx, ...editable, badgeBar: badgeNode }} />
      </div>
    );
  },
);
