// Optimized models for PDFmake package
export type TextSection = (
  | string
  | {
      text: string;
      style: string;
    }
  | {
      text: string[];
    }
)[];
