import { useEffect } from 'react';
import { motion } from 'framer-motion';

interface Props { onDone: () => void; durationMs?: number }

/** OPENING view: blurred backdrop, envelope scales up, flap opens, then hands off to READ. */
export function EnvelopeModal({ onDone, durationMs = 1900 }: Props) {
  // Auto-advance as a fallback; the envelope is also clickable to skip ahead.
  useEffect(() => {
    const id = setTimeout(onDone, durationMs);
    return () => clearTimeout(id);
  }, [onDone, durationMs]);

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-center justify-center bg-ooca-slate/40 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label="Opening letter"
    >
      <motion.button
        type="button"
        onClick={onDone}
        className="relative flex w-[min(80vw,395px)] items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
        initial={{ scale: 0.6, y: 40, opacity: 0 }}
        animate={{ scale: [0.6, 1, 1.25], y: [40, 0, 0], opacity: 1 }}
        transition={{ duration: 1.6, times: [0, 0.35, 1], ease: 'easeInOut' }}
        aria-label="Open letter"
      >
        <img src="/assets/envelope.png" alt="" className="h-auto w-full" draggable={false} />
      </motion.button>
    </motion.div>
  );
}
