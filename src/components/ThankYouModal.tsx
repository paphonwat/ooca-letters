import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mooca } from './Mooca';
import type { Dict } from '../i18n';

interface Props { t: Dict; onDone: () => void; durationMs?: number }

export function ThankYouModal({ t, onDone, durationMs = 2400 }: Props) {
  useEffect(() => {
    const id = setTimeout(onDone, durationMs);
    return () => clearTimeout(id);
  }, [onDone, durationMs]);

  return (
    <motion.div
      className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-ooca-slate/40 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="alertdialog"
      aria-live="polite"
      aria-label={t.thanks}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0, rotate: -6 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 14 }}
      >
        <Mooca variant="sun" className="w-44" />
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mt-4 text-3xl font-bold text-white drop-shadow"
      >
        {t.thanks}
      </motion.p>
    </motion.div>
  );
}
