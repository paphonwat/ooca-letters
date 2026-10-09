import { motion } from 'framer-motion';
import { Mooca } from './Mooca';
import { PillButton, SocialProof } from './Buttons';
import type { Dict } from '../i18n';
import type { Letter } from '../types';

interface Props { t: Dict; letter: Letter; onHome: () => void; onWrite: () => void }

export function ReadView({ t, letter, onHome, onWrite }: Props) {
  return (
    <motion.main
      key="read"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center px-6 pt-10 text-center"
    >
      <div className="relative">
        <motion.article
          initial={{ opacity: 0, y: 60, rotate: -3, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 120, damping: 16 }}
          className="relative h-72 w-72 rounded-2xl bg-white p-6 shadow-card"
        >
          <p
            className="whitespace-pre-line font-medium leading-normal text-black"
            style={{ fontSize: `${letter.fontSize ?? 14}px` }}
          >
            {letter.text}
          </p>
          {letter.drawing && (
            <img src={letter.drawing} alt="" className="pointer-events-none absolute inset-0 h-full w-full rounded-2xl object-contain" />
          )}
          <span className="absolute bottom-4 right-6 text-sm text-ooca-muted">
            {!letter.author || letter.author === 'Unknow' ? 'บุคคลนิรนาม' : letter.author}
          </span>
        </motion.article>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="absolute -bottom-2 -left-24"
        >
          <Mooca variant="wave" className="w-32" />
        </motion.div>
      </div>

      <h2 className="mt-10 text-3xl font-bold sm:text-4xl">{t.readTitle}</h2>
      <p className="mt-3 max-w-2xl text-base font-medium sm:text-lg">{t.readSubtitle}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <PillButton variant="outline" onClick={onHome}>{t.home}</PillButton>
        <PillButton onClick={onWrite} className="px-12">{t.write}</PillButton>
      </div>
      <SocialProof text={t.social} />
    </motion.main>
  );
}
