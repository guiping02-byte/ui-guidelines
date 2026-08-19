export type Palette = {
  brand: string;
  price: string;
  promo: string;
  member: string;
  care: string;
  accent?: string;
  gradientStart?: string;
  gradientEnd?: string;
};

export type ThemeId = "red" | "blue";

export type PalettePreset = {
  name: string;
  note: string;
  colors: Palette;
};

export type PaletteControl = {
  key: keyof Palette;
  label: string;
  description: string;
};

export const defaultPalettes: Record<ThemeId, Palette> = {
  red: {
    brand: "#D62F36",
    price: "#F04438",
    promo: "#FF4D4F",
    member: "#8F1D22",
    care: "#FF7A90",
    accent: "#DDB65E",
  },
  blue: {
    brand: "#1677FF",
    price: "#D9363E",
    promo: "#FF6A2A",
    member: "#183B6B",
    care: "#22B8E6",
    gradientStart: "#22B8E6",
    gradientEnd: "#1677FF",
  },
};

export const defaultPalette = defaultPalettes.red;

const themePresets: Record<ThemeId, PalettePreset[]> = {
  red: [
    { name: "规范默认", note: "稳重品牌红", colors: defaultPalettes.red },
  ],
  blue: [
    { name: "金融科技蓝", note: "参考图同款", colors: defaultPalettes.blue },
  ],
};

const themeColorControls: Record<ThemeId, PaletteControl[]> = {
  red: [
    { key: "brand", label: "品牌主色", description: "品牌、主按钮、选中态" },
    { key: "price", label: "价格红", description: "商品价格、到手价" },
    { key: "promo", label: "促销红", description: "优惠券、秒杀、满减" },
    { key: "member", label: "会员深红", description: "VIP 权益、会员专享" },
    { key: "care", label: "关怀粉红", description: "成长提醒、育儿内容" },
    { key: "accent", label: "辅助金色", description: "会员权益、品质背书、强调信息" },
  ],
  blue: [
    { key: "brand", label: "主蓝", description: "主按钮、标签选中、导航激活" },
    { key: "price", label: "收益红", description: "收益数字、上涨、重要提醒" },
    { key: "promo", label: "奖励橙", description: "积分奖励、业务入口、提示" },
    { key: "member", label: "金融深蓝", description: "标题、图标描边、专业信息" },
    { key: "care", label: "科技青", description: "渐变高光、服务图标、背景氛围" },
    { key: "gradientStart", label: "渐变起始色", description: "蓝色按钮左上方高光" },
    { key: "gradientEnd", label: "渐变结束色", description: "蓝色按钮右下方主色" },
  ],
};

export function getThemePresets(theme: ThemeId) {
  return themePresets[theme];
}

export function getThemeColorControls(theme: ThemeId) {
  return themeColorControls[theme];
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
  let palette = Object.fromEntries(entries) as Palette;
  if (record.accent !== undefined) {
    const accent = normalizeHex(record.accent);
    if (!accent) return null;
    palette = { ...palette, accent };
  }

  const hasGradientStart = record.gradientStart !== undefined;
  const hasGradientEnd = record.gradientEnd !== undefined;
  if (hasGradientStart !== hasGradientEnd) return null;
  if (hasGradientStart && hasGradientEnd) {
    const gradientStart = normalizeHex(record.gradientStart);
    const gradientEnd = normalizeHex(record.gradientEnd);
    if (!gradientStart || !gradientEnd) return null;
    palette = { ...palette, gradientStart, gradientEnd };
  }
  return palette;
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
  const tokens = [
    `--color-brand-primary: ${palette.brand};`,
    `--color-price: ${palette.price};`,
    `--color-promo: ${palette.promo};`,
    `--color-member: ${palette.member};`,
    `--color-care: ${palette.care};`,
  ];
  if (palette.accent) tokens.push(`--color-accent: ${palette.accent};`);
  if (palette.gradientStart && palette.gradientEnd) {
    tokens.push(
      `--color-gradient-start: ${palette.gradientStart};`,
      `--color-gradient-end: ${palette.gradientEnd};`,
      "--gradient-primary: linear-gradient(135deg, var(--color-gradient-start), var(--color-gradient-end));",
    );
  }
  return tokens.join("\n");
}

export function storageKeyForTheme(theme: ThemeId) {
  return theme === "blue" ? "maternal-ui-palette:blue:fintech-v1" : "maternal-ui-palette:red";
}
