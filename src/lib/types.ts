export interface Token {
  id: number;
  text: string;
  trailingSpace: string;
}

export type SelectionType = 'individual' | 'range';

export interface GapSelection {
  tokenIds: number[];
  type: SelectionType;
}

export interface Settings {
  keepFormatting: boolean;
  numberGaps: boolean;
  includeWordBank: boolean;
  includeAnswerSection: boolean;
  fixedGapLengthCh: number;
  gapLengthConstant: number;
  worksheetTitle: string;
}

export interface GapOutputItem {
  type: 'text' | 'gap' | 'newline';
  content: string;
  gapNumber?: number;
  gapWidthCh?: number;
  answer?: string;
}

export interface GapOutputData {
  items: GapOutputItem[];
  answers: { number: number; answer: string }[];
  wordBank: string[];
}
