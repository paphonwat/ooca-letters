import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { EnvelopeModal } from './components/EnvelopeModal';
import { ReadView } from './components/ReadView';
import { CreateView } from './components/CreateView';
import { ThankYouModal } from './components/ThankYouModal';
import { AdminView } from './components/AdminView';
import { dict } from './i18n';
import { pickRandom } from './data';
import type { Lang, Letter, View } from './types';

const lettersApiUrl = `${(import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')}/api/letters`;

export default function App() {
  const isAdminRoute = window.location.pathname === '/admin' || window.location.pathname === '/admin/';
  const [view, setView] = useState<View>('HOME');
  const [lang, setLang] = useState<Lang>('th');
  const [letters, setLetters] = useState<Letter[]>([]);
  const [current, setCurrent] = useState<Letter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [apiError, setApiError] = useState<'load' | 'save' | null>(null);

  const t = useMemo(
    () => ({ ...dict[lang], social: dict[lang].social.replace('{count}', String(letters.length)) }),
    [lang, letters.length],
  );

  useEffect(() => {
    if (isAdminRoute) return;
    const controller = new AbortController();

    fetch(lettersApiUrl, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Failed to load letters');
        return response.json() as Promise<Letter[]>;
      })
      .then(setLetters)
      .catch(() => {
        if (!controller.signal.aborted) setApiError('load');
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [isAdminRoute]);

  const openLetter = () => {
    if (!letters.length) return;
    setCurrent((prev) => pickRandom(letters, prev?.id));
    setView('OPENING');
  };

  const finishOpening = useCallback(() => setView('READ'), []);
  const goHome = useCallback(() => setView('HOME'), []);

  const sendLetter = async (letter: Omit<Letter, 'id'>) => {
    setIsSaving(true);
    setApiError(null);
    try {
      const response = await fetch(lettersApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(letter),
      });
      if (!response.ok) throw new Error('Failed to save letter');

      const savedLetter = (await response.json()) as Letter;
      setLetters((prev) => [savedLetter, ...prev]);
      setCurrent(savedLetter);
      setView('THANK_YOU');
    } catch {
      setApiError('save');
    } finally {
      setIsSaving(false);
    }
  };

  // The page behind a modal stays mounted so the blur shows the previous screen (as in the mockups)
  const background: View = view === 'OPENING' || view === 'THANK_YOU' ? (view === 'OPENING' ? 'HOME' : 'CREATE') : view;

  if (isAdminRoute) return <AdminView />;

  return (
    <div className="relative min-h-full overflow-hidden">
      <Header lang={lang} onLangChange={setLang} />

      {apiError && (
        <p role="alert" className="mx-auto mt-3 max-w-xl px-6 text-center text-sm text-red-700">
          {apiError === 'load' ? t.databaseLoadError : t.databaseSaveError}
        </p>
      )}

      <AnimatePresence mode="wait">
        {background === 'HOME' && <HomeView t={t} letters={letters} isLoading={isLoading} onOpen={openLetter} />}
        {background === 'READ' && current && <ReadView t={t} letter={current} onHome={goHome} onWrite={() => setView('CREATE')} />}
        {background === 'CREATE' && <CreateView t={t} onHome={goHome} onSend={sendLetter} isSaving={isSaving} />}
      </AnimatePresence>

      <AnimatePresence>
        {view === 'OPENING' && <EnvelopeModal key="env" onDone={finishOpening} />}
        {view === 'THANK_YOU' && <ThankYouModal key="thanks" t={t} onDone={goHome} />}
      </AnimatePresence>
    </div>
  );
}
