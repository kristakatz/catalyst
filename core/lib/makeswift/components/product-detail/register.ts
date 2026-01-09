import {
  Checkbox,
  Group,
  List,
  Select,
  Slot,
  TextArea,
  TextInput,
} from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { DescriptionSource, MakeswiftProductDetail } from './client';

export const COMPONENT_TYPE = 'catalyst-makeswift-product-detail-description';

const description = Group({
  label: 'Description',
  props: {
    source: Select({
      label: 'Source',
      options: [
        { label: 'Catalog (plain text)', value: DescriptionSource.CatalogPlainText },
        { label: 'Catalog (rich text)', value: DescriptionSource.CatalogRichText },
        { label: 'Custom', value: DescriptionSource.Custom },
      ],
      defaultValue: DescriptionSource.CatalogRichText,
    }),
    slot: Slot(),
  },
});

const badges = Group({
  label: 'Badge bar',
  props: {
    enabled: Checkbox({
      label: 'Enable badge bar',
      defaultValue: true,
    }),

    // Optional: keep if you might support other placements later
    placement: Select({
      label: 'Placement',
      options: [{ label: 'Under title', value: 'UnderTitle' }],
      defaultValue: 'UnderTitle',
    }),

    // ✅ Editors manage a list of badges
    items: List({
      label: 'Badges',
      type: Group({
        label: 'Badge',
        props: {
          label: TextInput({ label: 'Badge text', defaultValue: 'SALE' }),
          variant: Select({
            label: 'Style',
            options: [
              { label: 'Sale (cerulean)', value: 'sale' },
              { label: 'Neutral', value: 'neutral' },
              { label: 'Info', value: 'info' },
              { label: 'Success', value: 'success' },
              { label: 'Warning', value: 'warning' },
            ],
            defaultValue: 'sale',
          }),
          href: TextInput({
            label: 'Link (optional)',
            defaultValue: '/sale',
          }),
        },
      }),
      getItemLabel: (b) => b?.label || 'Badge',
    }),

    // Optional: allow editors to fully override with custom content if they want
    slot: Slot(),
  },
});

runtime.registerComponent(MakeswiftProductDetail, {
  type: COMPONENT_TYPE,
  label: 'MakeswiftProductDetail (private)',
  hidden: true,
  props: {
    summaryText: TextArea({
      label: 'Summary',
    }),
    description,
    badges,
    accordions: List({
      label: 'Product info',
      type: Group({
        label: 'Product info section',
        props: {
          title: TextInput({ label: 'Title', defaultValue: 'Section' }),
          content: Slot(),
        },
      }),
      getItemLabel: (section) => section?.title || 'Section',
    }),
  },
});
