import type { MemoryItem } from "@/types";

export function pickRandom<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  while (out.length < n && copy.length) {
    const i = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(i, 1)[0]);
  }
  return out;
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function tokenize(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

/** Return index of a "significant" word to hide (avoid tiny stopwords). */
export function pickBlankIndex(tokens: string[]): number {
  const eligible = tokens
    .map((t, i) => ({ t: t.replace(/[.,;!?]/g, ""), i }))
    .filter((x) => x.t.length >= 4);
  if (!eligible.length) return Math.floor(tokens.length / 2);
  return eligible[Math.floor(Math.random() * eligible.length)].i;
}

export function otherWordsFrom(items: MemoryItem[], exclude: string, count: number): string[] {
  const bank = new Set<string>();
  items.forEach((it) =>
    tokenize(it.text).forEach((w) => {
      const clean = w.replace(/[.,;!?]/g, "");
      if (clean.length >= 4 && clean.toLowerCase() !== exclude.toLowerCase()) bank.add(clean);
    }),
  );
  return shuffle([...bank]).slice(0, count);
}
