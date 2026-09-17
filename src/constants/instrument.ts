/**
 * "Instrument" design tokens.
 * A hardware spec-sheet aesthetic: warm near-black, one hot signal accent,
 * industrial display type (Archivo) paired with monospace readouts (IBM Plex Mono).
 */

export const colors = {
  // Surfaces — warm near-black, layered for depth
  bg: '#0B0B0C',
  surface: '#141416',
  surface2: '#1B1B1E',
  // Hairlines / rules
  line: '#26262B',
  lineStrong: '#34343B',
  // Text — warm off-white, never clinical pure white
  text: '#F5F3EE',
  textDim: '#A3A099',
  textMute: '#6A6862',
  // Signal accent
  accent: '#FF5A1F',
  accentSoft: 'rgba(255, 90, 31, 0.14)',
  accentLine: 'rgba(255, 90, 31, 0.35)',
  onAccent: '#0B0B0C',
  // States
  danger: '#FF4D4D',
  dangerSoft: 'rgba(255, 77, 77, 0.14)',
} as const;

export const font = {
  black: 'Archivo_900Black',
  extrabold: 'Archivo_800ExtraBold',
  bold: 'Archivo_700Bold',
  semibold: 'Archivo_600SemiBold',
  mono: 'IBMPlexMono_400Regular',
  monoMed: 'IBMPlexMono_500Medium',
  monoSemi: 'IBMPlexMono_600SemiBold',
  monoBold: 'IBMPlexMono_700Bold',
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 40,
} as const;

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
} as const;

/** Format a possibly-string price into ₱ with grouping. Guards against the
 *  API returning DECIMAL columns as JSON strings. */
export function formatPrice(value: number | string): string {
  const n = typeof value === 'number' ? value : parseFloat(value);
  if (!isFinite(n)) return '—';
  return `₱${n.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Zero-padded catalog index, e.g. 3 -> "03". */
export function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}
