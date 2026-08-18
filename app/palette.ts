export type Palette = {
  brand: string;
  price: string;
  promo: string;
  member: string;
  care: string;
};

export type ThemeId = "red" | "blue";

export type PalettePreset = {
  name: string;
  note: string;
  colors: Palette;
};

export const defaultPalettes: Record<ThemeId, Palette> = {
  red: {
    brand: "#D62F36",
    price: "#F04438",
    promo: "#FF4D4F",
    member: "#8F1D22",
    care: "#FF7A90",
  },
  blue: {
    brand: "#2388F5",
    price: "#1967D2",
    promo: "#0077CC",
    member: "#173B70",
    care: "#55A9F8",
  },
};

export const defaultPalette = defaultPalettes.red;

const themePresets: Record<ThemeId, PalettePreset[]> = {
  red: [
    { name: "规范默认", note: "稳重品牌红", colors: defaultPalettes.red },
    { name: "柔和莓红", note: "亲和内容型", colors: { brand: "#C83D55", price: "#E94B4B", promo: "#F25F5C", member: "#7D2033", care: "#F28BA2" } },
    { name: "暖珊瑚", note: "活力电商型", colors: { brand: "#D94A42", price: "#ED4D3D", promo: "#FF6248", member: "#8A2B28", care: "#FF8CA0" } },
  ],
  blue: [
    { name: "清爽蓝", note: "明快通用型", colors: defaultPalettes.blue },
    { name: "天空蓝", note: "轻盈服务型", colors: { brand: "#148EEA", price: "#1266C7", promo: "#0086D9", member: "#164A7B", care: "#62B8F5" } },
  ],
};

export function getThemePresets(theme: ThemeId) {
  return themePresets[theme];
}

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

export function storageKeyForTheme(theme: ThemeId) {
  return `maternal-ui-palette:${theme}`;
}
