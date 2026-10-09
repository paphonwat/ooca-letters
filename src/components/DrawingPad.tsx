import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import type { Tool } from '../types';

export interface DrawingPadHandle {
  toDataURL: () => string | undefined;
  isEmpty: () => boolean;
}

interface Props { color: string; size: number; tool: Tool }

/** Transparent canvas layered over the textarea so text and doodles live on the same card. */
export const DrawingPad = forwardRef<DrawingPadHandle, Props>(({ color, size, tool }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const dirty = useRef(false);

  useImperativeHandle(ref, () => ({
    toDataURL: () => (dirty.current ? canvasRef.current?.toDataURL('image/png') : undefined),
    isEmpty: () => !dirty.current,
  }));

  // Size the backing store for crisp lines on HiDPI screens
  useEffect(() => {
    const c = canvasRef.current!;
    const dpr = window.devicePixelRatio || 1;
    const { width, height } = c.getBoundingClientRect();
    c.width = width * dpr;
    c.height = height * dpr;
    const ctx = c.getContext('2d')!;
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    const ctx = e.currentTarget.getContext('2d')!;
    const { x, y } = pos(e);
    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 0.01, y + 0.01); // dot on tap
    ctx.stroke();
    if (tool === 'pen') dirty.current = true;
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = e.currentTarget.getContext('2d')!;
    const { x, y } = pos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const end = () => { drawing.current = false; };

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={start}
      onPointerMove={move}
      onPointerUp={end}
      onPointerCancel={end}
      className={`absolute inset-0 h-full w-full touch-none rounded-2xl ${tool === 'text' ? 'pointer-events-none' : ''}`}
      style={{ cursor: tool === 'eraser' ? 'cell' : tool === 'text' ? 'text' : 'crosshair' }}
    />
  );
});
DrawingPad.displayName = 'DrawingPad';
