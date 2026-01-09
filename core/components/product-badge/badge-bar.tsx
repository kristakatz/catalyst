import { Link } from '~/components/link';
import type { Badge } from '~/lib/badges/types';


function badgeClasses(variant: Badge['variant']) {
  switch (variant) {
    case 'sale':
      return 'bg-sky-600 text-white ring-sky-500/40';

    case 'info':
      return 'bg-blue-50 text-blue-700 ring-blue-200';

    case 'success':
      return 'bg-green-50 text-green-700 ring-green-200';

    case 'warning':
      return 'bg-amber-50 text-amber-800 ring-amber-200';

    default:
      return 'bg-gray-50 text-gray-700 ring-gray-200';
  }
}

export function BadgeBar({ badges, className }: { badges: Badge[]; className?: string }) {
  if (!badges.length) return null;

  return (
    <div className={['flex flex-wrap gap-1.5', className].filter(Boolean).join(' ')}>
      {badges.map((b) => {
        const pill = (
          <span
            className={[
              'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium leading-4 ring-1 ring-inset',
              badgeClasses(b.variant),
            ].join(' ')}
          >
            {b.label}
          </span>
        );

        return b.href ? (
          <Link className="no-underline hover:opacity-90" href={b.href} key={b.key}>
            {pill}
          </Link>
        ) : (
          <span key={b.key}>{pill}</span>
        );
      })}
    </div>
  );
}
