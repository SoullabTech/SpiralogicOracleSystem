// Lightweight, in-flight stream refiner for Maya's voice.
// Inserts elemental tone, gentle punctuation, breath markers, and
// optional safety softening without blocking the stream.

import { cringeFilterService } from '../utils/cringeFilterService';

export type Element = 'air' | 'fire' | 'water' | 'earth' | 'aether';

export interface RefinerOptions {
  element: Element;
  userId?: string;
  tts?: { breathMarks?: boolean; phraseMinChars?: number; phraseMaxChars?: number };
  safetySoften?: boolean;        // keep content but soften phrasing
  styleTightening?: boolean;     // trim filler, tighten hedges
  addClosers?: boolean;          // ensure responses end complete
  cringeFilter?: boolean;        // apply modern language filtering
  userStyle?: 'casual' | 'formal' | 'spiritual'; // adaptive communication style
}

export class SesameMayaRefiner {
  private buf = '';
  private opts: Required<RefinerOptions> & { userStyle: 'casual' | 'formal' | 'spiritual' };

  constructor(opts: RefinerOptions) {
    this.opts = {
      element: opts.element,
      userId: opts.userId || 'anonymous',
      safetySoften: opts.safetySoften ?? true,
      styleTightening: opts.styleTightening ?? true,
      addClosers: opts.addClosers ?? true,
      cringeFilter: opts.cringeFilter ?? true,
      userStyle: opts.userStyle ?? 'casual',
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
    if (this.opts.cringeFilter) t = cringeFilterService.adaptiveFilter(t, this.opts.userStyle);
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

        if (this.opts.cringeFilter) phrase = cringeFilterService.adaptiveFilter(phrase, this.opts.userStyle);
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
        let phrase = slice;
        if (this.opts.cringeFilter) phrase = cringeFilterService.adaptiveFilter(phrase, this.opts.userStyle);
        phrase = this.applyElementalTone(phrase);
        if (this.opts.styleTightening) phrase = this.tightenStyle(phrase);
        if (this.opts.safetySoften)   phrase = this.softenEdges(phrase);
        if (this.opts.tts.breathMarks) phrase = this.addBreaths(phrase);
        yield phrase;
      }
    }

    // flush tail
    if (this.buf.trim()) {
      let tail = this.buf;
      if (this.opts.cringeFilter) tail = cringeFilterService.adaptiveFilter(tail, this.opts.userStyle);
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
        [/\bvery\s+([a-z]+)\b/gi, '$1'],  // "very good" -> "good"
        [/\bquite\b/gi, ''],
      ],
      fire: [
        [/\btry to\b/gi, 'go ahead and'],  // More natural than "ignite"
        [/\bmaybe we could\b/gi, "let's"],
        [/\bperhaps\b/gi, 'definitely'],
      ],
      water: [
        [/\bshould consider\b/gi, 'might explore'],
        [/\bmust\b/gi, 'can'],
        [/\bhave to\b/gi, 'get to'],
      ],
      earth: [
        [/\bmaybe try\b/gi, "let's practice"],
        [/\btry\s+(\w+ing)\b/gi, 'practice $1'],  // "try meditating" -> "practice meditating"
        [/\bpossibly\b/gi, 'practically'],
      ],
      aether: [
        [/\bproblem\b/gi, 'pattern'],
        [/\bfix\s+this\b/gi, 'integrate this'],
        [/\bissue\b/gi, 'dynamic'],
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
    // remove modern filler words and hedge language for crisp communication
    return s
      .replace(/\b(kind of|sort of|a bit|just|really|like,|you know,)\b/gi, '')
      .replace(/\bI\s+think\s+that\b/gi, 'I think')
      .replace(/\bthat\s+being\s+said\b/gi, '')
      .replace(/\byou\s+can\s+you\s+can\b/gi, 'you can')
      .replace(/\bat\s+the\s+end\s+of\s+the\s+day\b/gi, 'ultimately')
      .replace(/\bbasically\b/gi, '')
      .replace(/\bobviously\b/gi, '')
      .replace(/\s{2,}/g, ' ')
      .replace(/ ,/g, ',');
  }

  private softenEdges(s: string) {
    // gentle but confident phrasing - modern and supportive
    return s
      .replace(/\b(you need to|you have to)\b/gi, 'you can')
      .replace(/\byou should\b/gi, 'you might')
      .replace(/\bdon\'t\s+([a-z]+)\b/gi, 'consider not $1ing')  // "don't worry" -> "consider not worrying"
      .replace(/\b(always|never)\s+([a-z]+)\b/gi, 'often $2')  // More nuanced
      .replace(/\byou must\b/gi, 'it helps to');
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