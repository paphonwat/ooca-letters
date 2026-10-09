import { motion } from 'framer-motion';
import { FloatingMooca } from './Mooca';
import { PillButton, SocialProof } from './Buttons';
import { Marquee } from './Marquee';
import type { Dict } from '../i18n';
import type { Letter } from '../types';

interface Props { t: Dict; letters: Letter[]; isLoading: boolean; onOpen: () => void }

export function HomeView({ t, letters, isLoading, onOpen }: Props) {
  return (
    <motion.main
      key="home"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="relative isolate flex min-h-[calc(100dvh-6rem)] flex-col sm:min-h-[calc(100dvh-7rem)]"
    >
      <div className="relative z-10 flex w-full flex-col items-center px-6 pt-8 text-center">
        <FloatingMooca variant="sun" className="w-56 sm:w-64" />
        <h1 className="mt-6 text-3xl font-bold sm:text-4xl">{t.title}</h1>
        <p className="mt-3 max-w-2xl text-base font-medium sm:text-lg">{t.subtitle}</p>
        <PillButton onClick={onOpen} disabled={isLoading || letters.length === 0} className="mt-9 px-14 py-3.5 text-lg">
          {t.openCta}
        </PillButton>
        {!isLoading && letters.length === 0 && <p role="status" className="mt-3 text-sm">{t.emptyLetters}</p>}
        <SocialProof text={t.social} />
      </div>
      <Marquee letters={letters} />
    </motion.main>
  );
}
