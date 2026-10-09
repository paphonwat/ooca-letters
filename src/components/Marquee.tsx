import type { Letter } from '../types';

export function Marquee({ letters }: { letters: Letter[] }) {
  const row = [...letters, ...letters]; // duplicated for seamless loop (-50% translate)
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-44 overflow-hidden opacity-30" aria-hidden>
      <div className="flex w-max animate-marquee gap-4">
        {row.map((l, i) => (
          <div
            key={`${l.id}-${i}`}
            className={`h-32 w-32 shrink-0 whitespace-pre-line rounded-sm bg-[#F8F8F8] p-3 text-[11px] leading-snug text-black/80 ${
              i % 2 ? 'translate-y-4' : ''
            }`}
          >
            {l.text}
          </div>
        ))}
      </div>
    </div>
  );
}
