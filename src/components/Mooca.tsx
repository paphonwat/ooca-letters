import { useState } from 'react';
import { motion } from 'framer-motion';

type Variant = 'sun' | 'wave' | 'phone' | 'face';

interface Props {
  variant?: Variant;
  className?: string;
  /** Replace with the real Mooca asset: e.g. <img src="/mooca-sun.png" /> */
  src?: string;
  alt?: string;
}

const ASSET_BY_VARIANT: Partial<Record<Variant, string>> = {
  sun: '/assets/mooca.png',
  phone: '/assets/mooca-create.png',
  wave: '/assets/mooca-read.png',
};

/**
 * Placeholder Mooca mascot (SVG). Pass `src` to swap in the official
 * illustration from the CI sheet without touching any view code.
 */
export function Mooca({ variant = 'sun', className = 'w-52', src, alt = 'Mooca' }: Props) {
  const [failedAsset, setFailedAsset] = useState<string>();
  const asset = src ?? ASSET_BY_VARIANT[variant];

  if (asset && failedAsset !== asset) {
    return (
      <img
        src={asset}
        alt={alt}
        className={className}
        draggable={false}
        onError={() => setFailedAsset(asset)}
      />
    );
  }

  const happy = variant !== 'sun';
  return (
    <svg viewBox="0 0 240 220" className={className} role="img" aria-label={alt}>
      {/* body */}
      <ellipse cx="120" cy="170" rx="30" ry="38" fill="#fff" stroke="#D3DDF0" strokeWidth="3" />
      {/* cloud head */}
      <g fill="#fff" stroke="#D3DDF0" strokeWidth="3">
        <circle cx="85" cy="90" r="42" />
        <circle cx="125" cy="68" r="48" />
        <circle cx="160" cy="95" r="40" />
        <rect x="70" y="90" width="110" height="42" rx="21" />
      </g>
      <g fill="#fff"><circle cx="85" cy="90" r="40" /><circle cx="125" cy="68" r="46" /><circle cx="160" cy="95" r="38" /><rect x="72" y="92" width="106" height="38" rx="19" /></g>
      {/* face */}
      {happy ? (
        <g stroke="#2F5FBF" strokeWidth="3" fill="none" strokeLinecap="round">
          <path d="M100 95 q6 -8 12 0" /><path d="M140 95 q6 -8 12 0" /><path d="M118 108 q8 8 16 0" />
        </g>
      ) : (
        <g fill="#2F5FBF"><circle cx="105" cy="98" r="5" /><circle cx="148" cy="98" r="5" /><path d="M120 108 q6 6 12 0" stroke="#2F5FBF" strokeWidth="3" fill="none" strokeLinecap="round" /></g>
      )}
      <circle cx="92" cy="110" r="8" fill="#FBD5D5" opacity=".8" /><circle cx="162" cy="110" r="8" fill="#FBD5D5" opacity=".8" />
      {/* scarf */}
      <path d="M92 132 q28 14 56 0 l4 14 q-32 14 -64 0z" fill="#F5A623" />
      {/* held item */}
      {variant === 'sun' && (
        <g>
          <circle cx="180" cy="150" r="30" fill="#FFEB5A" stroke="#F5A623" strokeWidth="3" />
          <circle cx="172" cy="148" r="5" fill="#F5A623" opacity=".6" /><circle cx="190" cy="148" r="5" fill="#F5A623" opacity=".6" />
        </g>
      )}
      {variant === 'phone' && <rect x="112" y="150" width="18" height="30" rx="4" fill="#F5A623" />}
      {variant === 'wave' && <circle cx="52" cy="150" r="22" fill="#FFEB5A" stroke="#F5A623" strokeWidth="3" />}
    </svg>
  );
}

export function FloatingMooca(props: Props) {
  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <Mooca {...props} />
    </motion.div>
  );
}
