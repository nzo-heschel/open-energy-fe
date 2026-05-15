/**
 * Map API `size_brackets` object keys (e.g. "0-200 kW") to chart stack keys.
 * Never index into sorted `size_bracket_definitions` — labels there may not
 * match yearly keys exactly (KW vs kW, Unicode dashes, spacing).
 */

export type FourSegmentKey = "small" | "medium" | "large" | "xlarge";

export type FourSegments = Record<FourSegmentKey, number>;

export function normalizeBracketLabel(label: string): string {
  return label
    .normalize("NFKC")
    .replace(/[\u2013\u2014\u2212]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** Map normalized `size_brackets` key → stack segment. */
export function segmentKeyForBracketLabel(
  normalizedLabel: string,
): FourSegmentKey | null {
  const s = normalizedLabel;
  if (/\b5001\b/.test(s) || /5001\s*\+|\+\s*5001/.test(s)) return "xlarge";
  if (s.includes("631") && s.includes("5000")) return "large";
  if (s.includes("201") && s.includes("630")) return "medium";
  if (s.includes("0-200")) return "small";
  return null;
}

export function emptyFourSegments(): FourSegments {
  return { small: 0, medium: 0, large: 0, xlarge: 0 };
}

/**
 * Walk every entry in `size_brackets` and add its numeric value into the
 * correct segment bucket.
 */
export function accumulateFourSegments(
  brackets: Record<string, unknown>,
  pick: (raw: unknown) => number,
): FourSegments {
  const out = emptyFourSegments();
  for (const [label, raw] of Object.entries(brackets)) {
    const seg = segmentKeyForBracketLabel(normalizeBracketLabel(label));
    if (!seg) continue;
    out[seg] += pick(raw);
  }
  return out;
}
