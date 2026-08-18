export type Palette = {
  brand: string;
  price: string;
  promo: string;
  member: string;
  care: string;
};

export const defaultPalette: Palette = {
  brand: "#D62F36",
  price: "#F04438",
  promo: "#FF4D4F",
  member: "#8F1D22",
  care: "#FF7A90",
};

const paletteKeys: Array<keyof Palette> = ["brand", "price", "promo", "member", "care"];

export function normalizeHex(value: unknown) {
  if (typeof value !== "string") return null;
  const raw = value.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{6}$/.test(raw)) return `#${raw.toUpperCase()}`;
  if (/^[0-9a-fA-F]{3}$/.test(raw)) {
    return `#${raw.split("").map((character) => character + character).join("").toUpperCase()}`;
  }
  return null;
}

export function validateStoredPalette(value: unknown): Palette | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const entries = paletteKeys.map((key) => [key, normalizeHex(record[key])]);
  if (entries.some(([, color]) => color === null)) return null;
  return Object.fromEntries(entries) as Palette;
}

export function mix(hex: string, target: string, amount: number) {
  const source = normalizeHex(hex) ?? defaultPalette.brand;
  const destination = normalizeHex(target) ?? "#FFFFFF";
  const channels = [1, 3, 5].map((index) => {
    const start = Number.parseInt(source.slice(index, index + 2), 16);
    const end = Number.parseInt(destination.slice(index, index + 2), 16);
    return Math.round(start + (end - start) * amount).toString(16).padStart(2, "0");
  });
  return `#${channels.join("").toUpperCase()}`;
}

export function serializeTokens(palette: Palette) {
  return [
    `--color-brand-primary: ${palette.brand};`,
    `--color-price: ${palette.price};`,
    `--color-promo: ${palette.promo};`,
    `--color-member: ${palette.member};`,
    `--color-care: ${palette.care};`,
  ].join("\n");
}
