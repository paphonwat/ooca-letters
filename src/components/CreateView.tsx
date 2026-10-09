import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Eraser, Pencil, Type } from 'lucide-react';
import { Mooca } from './Mooca';
import { PillButton, SocialProof } from './Buttons';
import { DrawingPad, type DrawingPadHandle } from './DrawingPad';
import type { Dict } from '../i18n';
import type { Letter, Tool } from '../types';

const COLORS = ['#F5A623', '#2F7FED', '#264648', '#000000'];
const PEN_SIZES = [14, 8, 3];
const ERASER_SIZES = [28, 16, 6];
const TEXT_SIZES = [30, 22, 16];

interface Props { t: Dict; onHome: () => void; onSend: (l: Omit<Letter, 'id'>) => void | Promise<void>; isSaving: boolean }

export function CreateView({ t, onHome, onSend, isSaving }: Props) {
  const [text, setText] = useState('');
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[3]);
  const [penSize, setPenSize] = useState(PEN_SIZES[1]);
  const [eraserSize, setEraserSize] = useState(ERASER_SIZES[1]);
  const [textSize, setTextSize] = useState(TEXT_SIZES[1]);
  const [tool, setTool] = useState<Tool>('pen');
  const padRef = useRef<DrawingPadHandle>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const sizeOptions = tool === 'text' ? TEXT_SIZES : tool === 'eraser' ? ERASER_SIZES : PEN_SIZES;
  const selectedSize = tool === 'text' ? textSize : tool === 'eraser' ? eraserSize : penSize;

  const setSelectedSize = (nextSize: number) => {
    if (tool === 'text') setTextSize(nextSize);
    else if (tool === 'eraser') setEraserSize(nextSize);
    else setPenSize(nextSize);
  };

  const chooseTool = (nextTool: Tool) => {
    setTool(nextTool);
    if (nextTool === 'text') textareaRef.current?.focus();
    else textareaRef.current?.blur();
  };

  // B selects the brush, E the eraser, and T the text editor.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (document.activeElement === textareaRef.current || tag === 'INPUT' || e.ctrlKey || e.metaKey || e.altKey) return;

      const shortcuts: Record<string, Tool> = { b: 'pen', e: 'eraser', t: 'text' };
      const nextTool = shortcuts[e.key.toLowerCase()];
      if (nextTool) {
        e.preventDefault();
        chooseTool(nextTool);
        return;
      }

      if (tag === 'TEXTAREA') return;
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const canSend = text.trim().length > 0 || !(padRef.current?.isEmpty() ?? true);
  const [, force] = useState(0); // re-evaluate canSend after drawing

  const send = () => {
    void onSend({
      text: text.trim(),
      author: name.trim() || 'บุคคลนิรนาม',
      fontSize: textSize,
      drawing: padRef.current?.toDataURL(),
    });
  };

  const ToolBtn = ({ id, label, k, Icon }: { id: Tool; label: string; k: string; Icon: typeof Pencil }) => (
    <button
      type="button"
      aria-label={label}
      aria-pressed={tool === id}
      title={label}
      onClick={() => chooseTool(id)}
      className={`relative flex h-11 w-11 items-center justify-center rounded-full text-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-ooca-slate ${
        tool === id ? 'bg-ooca ring-4 ring-ooca/30' : 'bg-ooca/80 hover:bg-ooca'
      }`}
    >
      <Icon size={20} />
      <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[9px] font-semibold text-ooca-slate">{k}</span>
    </button>
  );

  return (
    <motion.main
      key="create"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="mx-auto flex max-w-xl flex-col items-center px-6 pt-6"
    >
      <h2 className="text-3xl font-bold sm:text-4xl">{t.createTitle}</h2>

      <div className="relative mt-8 flex items-start justify-center gap-6">
        {/* left: colors */}
        <div className="flex flex-col gap-3 pt-3" role="radiogroup" aria-label="Color">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={color === c}
              aria-label={c}
              onClick={() => { setColor(c); chooseTool('pen'); }}
              style={{ backgroundColor: c }}
              className={`h-8 w-8 rounded-full transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ooca-slate ${
                color === c ? 'scale-110 ring-2 ring-ooca ring-offset-2' : ''
              }`}
            />
          ))}
        </div>

        {/* center card */}
        <div className="relative h-72 w-72 rounded-2xl bg-white shadow-card">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setTool('text')}
            placeholder={t.placeholder}
            maxLength={140}
            aria-label={t.placeholder}
            className="absolute inset-0 h-full w-full resize-none rounded-2xl bg-transparent p-6 pb-10 leading-normal outline-none placeholder:text-ooca-muted"
            style={{ color, fontSize: `${textSize}px` }}
          />
          <div
            onPointerUp={() => force((n) => n + 1)}
            className={`absolute inset-0 ${tool === 'text' ? 'pointer-events-none' : ''}`}
          >
            <DrawingPad ref={padRef} color={color} size={tool === 'eraser' ? eraserSize : penSize} tool={tool} />
          </div>
          <span className="pointer-events-none absolute bottom-4 right-6 text-sm text-ooca-muted">{name.trim() || 'บุคคลนิรนาม'}</span>
        </div>

        {/* right: tools */}
        <div className="flex flex-col items-center gap-3">
          <ToolBtn id="pen" label={t.pen} k="B" Icon={Pencil} />
          <ToolBtn id="eraser" label={t.eraser} k="E" Icon={Eraser} />
          <ToolBtn id="text" label={t.textTool} k="T" Icon={Type} />
          <div className="mt-1 flex flex-col items-center gap-3 rounded-full bg-ooca/90 px-2.5 py-3" role="radiogroup" aria-label={`${tool} size`}>
            {sizeOptions.map((s, index) => (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={selectedSize === s}
                aria-label={`${s}px`}
                onClick={() => setSelectedSize(s)}
                className="flex h-4 w-4 items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
              >
                <span
                  className={`block rounded-full bg-white transition ${selectedSize === s ? 'ring-2 ring-white/60 ring-offset-1 ring-offset-ooca' : ''}`}
                  style={{ width: 4 + (sizeOptions.length - index) * 2, height: 4 + (sizeOptions.length - index) * 2 }}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="absolute -bottom-6 -left-20 hidden sm:block">
          <Mooca variant="phone" className="w-28" />
        </div>
      </div>

      {/* name + actions */}
      <label htmlFor="author" className="mt-14 text-lg font-semibold">
        {t.nameLabel} <span className="font-normal text-ooca-muted">{t.optional}</span>
      </label>
      <input
        id="author"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="บุคคลนิรนาม"
        maxLength={24}
        className="mt-2 w-full rounded-md border border-slate-300 bg-white py-2.5 text-center text-ooca-slate outline-none placeholder:text-ooca-muted focus:border-ooca focus:ring-2 focus:ring-ooca/30"
      />
      <div className="mt-4 flex w-full gap-3">
        <PillButton variant="outline" onClick={onHome} className="flex-1 px-4">{t.home}</PillButton>
        <PillButton onClick={send} disabled={!canSend || isSaving} className="flex-[1.5]">{isSaving ? t.sending : t.send}</PillButton>
      </div>
      <SocialProof text={t.social} />
    </motion.main>
  );
}
