/// <reference types="vite/client" />

declare module 'mammoth' {
  interface ExtractTextResult {
    value: string;
    messages: Record<string, unknown>[];
  }
  
  export function extractRawText(options: { arrayBuffer: ArrayBuffer }): Promise<ExtractTextResult>;
}
