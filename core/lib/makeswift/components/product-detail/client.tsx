'use client';

import React, {
  Children,
  type ComponentPropsWithoutRef,
  createContext,
  forwardRef,
  isValidElement,
  type PropsWithChildren,
  type ReactNode,
  type Ref,
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

type BadgePlacement = 'UnderTitle';

interface EditableProps {
  summaryText: string | undefined;
  description: { source: DescriptionSource; slot: ReactNode };
  accordions: Exclude<Awaited<VibesProductDetail['accordions']>, undefined>;

  badges: {
    enabled: boolean;
    placement: BadgePlacement;
    slot: ReactNode;
    label: string;
    variant: 'sale' | 'neutral' | 'info' | 'success' | 'warning';
    href: string;
  };
}

type EditablePropsWithoutBadges = Omit<EditableProps, 'badges'>;

const ProductDetailImpl = ({
  summaryText,
  description,
  accordions,
  product: streamableProduct,
  badgeBar,
  ...props
}: Props & EditablePropsWithoutBadges & { badgeBar?: ReactNode }) => {
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
    ): Awaited<ProductDetail['accordions']> =>
      productAccordions != null
        ? mergeSections(productAccordions, accordions, (left, right) => ({
            ...left,
            content: right.content,
          }))
        : undefined,
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
                badgeBar, // ✅ add this
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
};

function hasRenderableSlotContent(node: ReactNode): boolean {
  if (node == null) return false;

  return Children.toArray(node).some((child) => {
    if (typeof child === 'string') return child.trim().length > 0;

    // numbers / elements / fragments count as content
    if (typeof child === 'number') return true;

    return isValidElement(child);
  });
}

export const MakeswiftProductDetail = forwardRef(
  (props: EditableProps, ref: Ref<HTMLDivElement>) => {
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

    // If Makeswift configured a badge via fields (label/variant/href), render that via BadgeBar
    const hasConfiguredLabel = badges.label.trim().length > 0;

    let badgeNode: ReactNode = null;

    if (enabled) {
      if (slotHasContent) {
        badgeNode = slot;
      } else if (hasConfiguredLabel) {
        badgeNode = (
          <BadgeBar
            badges={[
              {
                key: 'makeswift-badge',
                label: badges.label, // ✅ remove this next line if lint forbids `!` (see note below)
                variant: badges.variant,
                href: badges.href,
              },
            ]}
          />
        );
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
