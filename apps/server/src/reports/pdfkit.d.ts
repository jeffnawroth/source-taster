// SPDX-License-Identifier: AGPL-3.0-or-later
// PDFKit ships no usable types (ADR-0017 keeps it behind one owned adapter,
// `pdf.ts`). This declares only the surface that adapter uses.
declare module "pdfkit" {
  export interface StructElement {
    add(child: unknown): StructElement;
    end(): StructElement;
  }
  interface TextOptions {
    continued?: boolean;
    structParent?: StructElement;
    structType?: string;
    link?: string;
    underline?: boolean;
    width?: number;
    lineBreak?: boolean;
    align?: "left" | "center" | "right";
    height?: number;
    ellipsis?: boolean;
    lineGap?: number;
    paragraphGap?: number;
  }
  interface ListOptions extends TextOptions {
    bulletRadius?: number;
    bulletIndent?: number;
    textIndent?: number;
    listType?: "bullet" | "numbered" | "lettered";
  }
  /** fontkit's font object, reached only to pre-check glyph coverage. */
  interface FontkitFont {
    hasGlyphForCodePoint(codePoint: number): boolean;
  }
  export default class PDFDocument {
    constructor(options?: {
      size?: string;
      margins?: { top: number; bottom: number; left: number; right: number };
      tagged?: boolean;
      lang?: string;
      displayTitle?: boolean;
      bufferPages?: boolean;
      pdfVersion?: string;
      info?: Record<string, string>;
      compress?: boolean;
    });
    page: {
      margins: { top: number; bottom: number; left: number; right: number };
      width: number;
      height: number;
    };
    info: Record<string, string>;
    x: number;
    y: number;
    _font?: { font?: FontkitFont };
    on(event: "data", listener: (chunk: Uint8Array) => void): this;
    on(event: "end" | "pageAdded", listener: () => void): this;
    on(event: "error", listener: (error: unknown) => void): this;
    registerFont(name: string, source: Uint8Array): this;
    font(name: string): this;
    fontSize(size: number): this;
    fillColor(color: string): this;
    text(text: string, options?: TextOptions): this;
    text(text: string, x: number, y: number, options?: TextOptions): this;
    circle(x: number, y: number, radius: number): this;
    fill(color?: string): this;
    /** PDFKit's annotation entry point; `Contents` is the alternate description. */
    link(
      x: number,
      y: number,
      width: number,
      height: number,
      url: string,
      options?: { structParent?: StructElement; Contents?: object },
    ): this;
    moveDown(lines?: number): this;
    addPage(): this;
    struct(type: string, options?: object, children?: unknown): StructElement;
    addStructure(element: StructElement): this;
    markContent(tag: string, options?: object): this;
    endMarkedContent(): this;
    bufferedPageRange(): { start: number; count: number };
    switchToPage(index: number): this;
    heightOfString(text: string, options?: TextOptions): number;
    end(): void;
  }
}
