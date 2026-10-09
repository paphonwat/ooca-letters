import { useState } from 'react';
import type { Lang } from '../types';

export function Logo() {
  const [logoState, setLogoState] = useState<'loading' | 'loaded' | 'error'>('loading');

  return (
    <div className="relative flex h-12 select-none items-center justify-center" aria-label="ooca">
      <img
        src="/assets/ooca-logo.png"
        alt=""
        aria-hidden="true"
        className={`h-full max-w-40 object-contain ${logoState === 'loaded' ? '' : 'hidden'}`}
        draggable={false}
        onLoad={() => setLogoState('loaded')}
        onError={() => setLogoState('error')}
      />
      {logoState !== 'loaded' && (
        <span className="text-4xl font-bold tracking-tight text-ooca">
          ooc<span className="text-ooca-blue">a</span>
        </span>
      )}
    </div>
  );
}

interface Props { lang: Lang; onLangChange: (l: Lang) => void }

export function Header({ lang, onLangChange }: Props) {
  return (
    <header className="relative flex h-24 items-center justify-center px-6 sm:h-28">
      <Logo />
      <div
        role="group"
        aria-label="Language"
        className="absolute right-6 flex overflow-hidden rounded-full bg-slate-200/80 text-sm font-semibold sm:right-12"
      >
        {(['th', 'en'] as Lang[]).map((l) => (
          <button
            key={l}
            type="button"
            aria-pressed={lang === l}
            onClick={() => onLangChange(l)}
            className={`px-4 py-2 uppercase transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ooca-slate ${
              lang === l ? 'rounded-full bg-ooca text-white' : 'text-ooca-slate/70 hover:text-ooca-slate'
            }`}
          >
            {l}
          </button>
        ))}
      </div>
    </header>
  );
}
