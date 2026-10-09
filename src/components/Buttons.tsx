import { motion, type HTMLMotionProps } from 'framer-motion';

type BtnProps = HTMLMotionProps<'button'> & { variant?: 'solid' | 'outline' };

export function PillButton({ variant = 'solid', className = '', children, ...rest }: BtnProps) {
  const base =
    'rounded-full px-8 py-3 text-base font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ooca-slate disabled:opacity-50';
  const styles =
    variant === 'solid'
      ? 'bg-ooca text-white shadow-pill hover:bg-ooca-hover'
      : 'border-2 border-ooca bg-white text-ooca hover:bg-ooca-mint';
  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      className={`${base} ${styles} ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  );
}

export function SocialProof({ text }: { text: string }) {
  return <p className="mt-3 text-xs text-ooca-slate/80">{text}</p>;
}
