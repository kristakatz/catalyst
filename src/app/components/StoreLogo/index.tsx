import Image from 'next/image';

import { getStoreSettings } from '@client';

export const StoreLogo = async () => {
  const settings = await getStoreSettings();

  if (!settings) {
    return null;
  }

  const { logoV2: logo, storeName } = settings;

  if (logo.__typename === 'StoreTextLogo') {
    return <span className="text-2xl font-black">{logo.text}</span>;
  }

  return (
    <Image
      alt={logo.image.altText ? logo.image.altText : storeName}
      height={32}
      priority
      src={logo.image.url}
      width={155}
    />
  );
};
