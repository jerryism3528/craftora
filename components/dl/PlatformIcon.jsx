import * as Lucide from 'lucide-react';

export default function PlatformIcon({ item, size = 44 }) {
  const Icon = item.icon ? Lucide[item.icon] : null;
  return (
    <span
      className="inline-flex items-center justify-center rounded-xl shrink-0 font-extrabold"
      style={{ width: size, height: size, background: item.color, color: '#fff', fontSize: Math.round(size * 0.32) }}
      aria-hidden="true"
    >
      {Icon ? <Icon style={{ width: size * 0.52, height: size * 0.52 }} /> : item.badge}
    </span>
  );
}
