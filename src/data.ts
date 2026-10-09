import type { Letter } from './types';

export const SEED_LETTERS: Letter[] = [
  { id: '1', text: 'วันนี้เหนื่อยก็พักก่อนนะ', author: 'Unknow' },
  { id: '2', text: 'อย่าลืมใจดีกับตัวเองด้วยล่ะ :)', author: 'Unknow' },
  { id: '3', text: 'กินของอร่อย ๆ ปลอบใจตัวเองหรือยัง?', author: 'Unknow' },
  { id: '4', text: 'ไม่จำเป็นต้อง\nเก่งตลอดเวลาก็ได้นะ\nแค่สนุกกับสิ่ง ที่อยากจะทำก็พอ', author: 'Unknow' },
  { id: '5', text: 'เธอยังคงเป็นความอบอุ่นของใครบางคนเสมอ', author: 'Unknow' },
  { id: '6', text: 'ผ่านวันนี้ไปได้ เธอก็เก่งมากแล้ว', author: 'Unknow' },
  { id: '7', text: 'หายใจเข้าลึก ๆ ทุกอย่างจะค่อย ๆ คลี่คลาย', author: 'Unknow' },
  { id: '8', text: 'วางเรื่องหนัก ๆ ลงก่อน แล้วค่อยเริ่มใหม่', author: 'Unknow' },
  { id: '9', text: 'ขอบคุณที่อดทนและพยายามมาจนถึงตอนนี้นะ', author: 'Unknow' },
];

export const pickRandom = (letters: Letter[], excludeId?: string): Letter => {
  const pool = letters.length > 1 ? letters.filter((l) => l.id !== excludeId) : letters;
  return pool[Math.floor(Math.random() * pool.length)];
};
