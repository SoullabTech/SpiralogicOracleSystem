// Lightweight, in-flight stream refiner for Maya's voice.
// Inserts elemental tone, gentle punctuation, breath markers, and
// optional safety softening without blocking the stream.

export type Element = 'air' | 'fire' | 'water' | 'earth' | 'aether';

export interface RefinerOptions {
  element: Element;
  userId?: string;
  tts?: { breathMarks?: boolean; phraseMinChars?: number; phraseMaxChars?: number };
  safetySoften?: boolean;        // keep content but soften phrasing
  styleTightening?: boolean;     // trim filler, tighten hedges
  addClosers?: boolean;          // ensure responses end complete
}

export class SesameMayaRefiner {
  private buf = '';
  private opts: Required<RefinerOptions>;

  constructor(opts: RefinerOptions) {
    this.opts = {
      element: opts.element,
      userId: opts.userId || 'anonymous',
      safetySoften: opts.safetySoften ?? true,
      styleTightening: opts.styleTightening ?? true,
      addClosers: opts.addClosers ?? true,
      tts: {
        breathMarks: opts.tts?.breathMarks ?? true,
        phraseMinChars: Math.max(24, opts.tts?.phraseMinChars ?? 36),
        phraseMaxChars: Math.max(64, opts.tts?.phraseMaxChars ?? 120),
      },
    };
  }

  /** Single-pass, non-stream refinement (for /message POST path) */
  refineText(full: string): string {
    let t = full;
    t = this.applyElementalTone(t);
    if (this.opts.styleTightening) t = this.tightenStyle(t);
    if (this.opts.safetySoften)   t = this.softenEdges(t);
    if (this.opts.addClosers)     t = this.ensureClosure(t);
    if (this.opts.tts.breathMarks) t = this.addBreaths(t);
    return t;
  }

  /** Stream wrapper: yields refined phrases as they become natural units */
  async *refineStream(src: AsyncGenerator<string>): AsyncGenerator<string> {
    for await (const chunk of src) {
      this.buf += chunk;

      // opportunistic punctuation smoothing
      this.buf = this.normalizeWhitespace(this.buf);

      // cut by natural phrase boundaries to keep SSE snappy but coherent
      let cutIdx = this.findCutIndex(this.buf);
      while (cutIdx > -1) {
        let phrase = this.buf.slice(0, cutIdx + 1);
        this.buf = this.buf.slice(cutIdx + 1);

        phrase = this.applyElementalTone(phrase);
        if (this.opts.styleTightening) phrase = this.tightenStyle(phrase);
        if (this.opts.safetySoften)   phrase = this.softenEdges(phrase);
        if (this.opts.tts.breathMarks) phrase = this.addBreaths(phrase);

        yield phrase;
        cutIdx = this.findCutIndex(this.buf);
      }

      // guard long runs with soft chunking
      if (this.buf.length > this.opts.tts.phraseMaxChars) {
        const slice = this.buf.slice(0, this.opts.tts.phraseMaxChars);
        this.buf = this.buf.slice(this.opts.tts.phraseMaxChars);
        let phrase = this.applyElementalTone(slice);
        if (this.opts.styleTightening) phrase = this.tightenStyle(phrase);
        if (this.opts.safetySoften)   phrase = this.softenEdges(phrase);
        if (this.opts.tts.breathMarks) phrase = this.addBreaths(phrase);
        yield phrase;
      }
    }

    // flush tail
    if (this.buf.trim()) {
      let tail = this.buf;
      if (this.opts.addClosers) tail = this.ensureClosure(tail);
      if (this.opts.styleTightening) tail = this.tightenStyle(tail);
      if (this.opts.safetySoften)   tail = this.softenEdges(tail);
      if (this.opts.tts.breathMarks) tail = this.addBreaths(tail);
      yield tail;
    }
  }

  // ---------- helpers

  private normalizeWhitespace(t: string) {
    return t.replace(/[ \t]+/g, ' ').replace(/ ?\n ?/g, '\n');
  }

  /** choose phrase cuts: punctuation > emdash > newline > length */
  private findCutIndex(t: string) {
    // prefer full stop boundaries
    const re = /[.!?…](?:["'"])?(?=\s|$)/g;
    let m: RegExpExecArray | null;
    let last = -1;
    while ((m = re.exec(t))) last = m.index;
    if (last > -1 && last + 1 >= this.opts.tts.phraseMinChars) return last;

    // fallback: semicolon or long comma breath
    const c = t.lastIndexOf(';');
    if (c > -1 && c >= this.opts.tts.phraseMinChars) return c;

    // soft break on newline
    const n = t.indexOf('\n');
    if (n > -1 && n >= this.opts.tts.phraseMinChars) return n;

    return -1;
  }

  private applyElementalTone(s: string) {
    // micro-tonal tweaks that don't "rewrite" content, just voice
    const prefaceMap: Record<Element, string> = {
      air:   '',
      fire:  '',
      water: '',
      earth: '',
      aether:''
    };
    // lightweight diction nudge per element
    const swaps: Record<Element, Array<[RegExp, string]>> = {
      air: [
        [/\b(I think|maybe|perhaps)\b/gi, "let's clarify"],
        [/\bvery\b/gi, ''],
      ],
      fire: [
        [/\btry\b/gi, 'ignite'],
        [/\bmaybe\b/gi, 'now'],
      ],
      water: [
        [/\bshould\b/gi, 'might gently'],
        [/\bmust\b/gi, 'can'],
      ],
      earth: [
        [/\bmaybe\b/gi, "let's do"],
        [/\btry\b/gi, 'practice'],
      ],
      aether: [
        [/\bproblem\b/gi, 'pattern'],
        [/\bfix\b/gi, 'integrate'],
      ],
    };
    let t = s;
    for (const [re, rep] of swaps[this.opts.element]) {
      t = t.replace(re, rep).replace(/\s+/g, ' ').trimStart();
    }
    if (prefaceMap[this.opts.element] && !t.trimStart().startsWith(prefaceMap[this.opts.element])) {
      t = prefaceMap[this.opts.element] + t;
    }
    return t;
  }

  private tightenStyle(s: string) {
    // remove double spaces, collapse hedges/repeats
    return s
      .replace(/\b(kind of|sort of|a bit|just|really)\b/gi, '')
      .replace(/\bI\s+think\s+that\b/gi, 'I think')
      .replace(/\byou\s+can\s+you\s+can\b/gi, 'you can')
      .replace(/\s{2,}/g, ' ')
      .replace(/ ,/g, ',');
  }

  private softenEdges(s: string) {
    // gentle softener without altering meaning
    return s
      .replace(/\b(you need to|you have to)\b/gi, 'you might')
      .replace(/\b(don't)\b/gi, "let's avoid")
      .replace(/\b(always|never)\b/gi, 'often');
  }

  private addBreaths(s: string) {
    // breath markers for TTS: insert subtle pauses at natural spots
    return s
      .replace(/—/g, ' — <breath/0.35> ')
      .replace(/: /g, ': <breath/0.25>')
      .replace(/, /g, ', <breath/0.2>');
  }

  private ensureClosure(s: string) {
    const trimmed = s.trimRight();
    if (/[.!?…]$/.test(trimmed)) return trimmed + '\n';
    return trimmed + '.\n';
  }
}