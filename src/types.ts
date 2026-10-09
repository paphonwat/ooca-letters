export type View = 'HOME' | 'OPENING' | 'READ' | 'CREATE' | 'THANK_YOU';
export type Lang = 'th' | 'en';

export interface Letter {
  id: string;
  text: string;
  author: string;
  fontSize?: number;
  /** optional PNG data URL of the drawing layer */
  drawing?: string;
}

export type Tool = 'pen' | 'eraser' | 'text';
