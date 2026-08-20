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

export type TypographySpec = {
  sample: string;
  className: string;
  size: string;
  weight: string;
  color: string;
  usage: string;
};

const typographySpecs: Array<Omit<TypographySpec, "color"> & { colors: Partial<Record<ThemeId, string>> }> = [
  { sample: "页面标题", className: "type-page", size: "24px / 32px", weight: "Medium / 600", colors: { red: "#222222", blue: "#222222" }, usage: "一级页面标题、详情页标题" },
  { sample: "模块标题", className: "type-section", size: "20px / 28px", weight: "Medium / 600", colors: { red: "#222222", blue: "#222222" }, usage: "卡片标题、弹窗标题、运营区标题" },
  { sample: "区块标题", className: "type-subsection", size: "16px / 24px", weight: "Medium / 600", colors: { red: "#222222", blue: "#646464" }, usage: "表单分组、列表区块标题" },
  { sample: "正文文字", className: "type-body", size: "14px / 22px", weight: "Regular / 400", colors: { red: "#666666", blue: "#646464" }, usage: "商品信息、表单内容、列表正文" },
  { sample: "辅助说明", className: "type-caption", size: "12px / 20px", weight: "Regular / 400", colors: { red: "#999999", blue: "#969696" }, usage: "注释、帮助、时间与状态说明" },
  { sample: "按钮文字", className: "type-action", size: "14px / 22px", weight: "Medium / 600", colors: { red: "#222222", blue: "#646464" }, usage: "主次按钮、筛选项和操作入口" },
  { sample: "提示文字", className: "type-caption", size: "12px / 20px", weight: "Regular / 400", colors: { blue: "#C8C8C8" }, usage: "输入框占位、禁用状态与弱提示" },
];

export function getTypographySpecs(theme: ThemeId): TypographySpec[] {
  return typographySpecs.flatMap(({ colors, ...spec }) => {
    const color = colors[theme];
    return color ? [{ ...spec, color }] : [];
  });
}

export type PageBackgroundSpec = {
  color: string;
  usage: string;
};

const pageBackgroundSpecs: Record<ThemeId, PageBackgroundSpec> = {
  red: { color: "#FAFAFA", usage: "页面整体背景、内容区域底色" },
  blue: { color: "#FAFAFA", usage: "页面整体背景、内容区域底色" },
};

export function getPageBackgroundSpec(theme: ThemeId) {
  return pageBackgroundSpecs[theme];
}

export type PalettePreset = {
  name: string;
  note: string;
  colors: Palette;
};

export type PaletteControl = {
  key: keyof Palette;
  label: string;
  description: string;
  reference?: string;
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
    { key: "brand", label: "品牌主红", description: "选中导航、页签、主要按钮、关键入口", reference: "爆料、卡券、立即使用、底部导航选中" },
    { key: "price", label: "价格红", description: "价格、收益、补贴、优惠金额", reference: "¥32.93、59.9元、佣金、达标补贴" },
    { key: "promo", label: "促销亮红", description: "促销标签、领取按钮、分享按钮、活动提醒", reference: "历史最低、领券购买、推广赚" },
    { key: "member", label: "会员深红", description: "强调标题、描边按钮、会员与重要业务文字", reference: "达标补贴、立即报名、提现按钮" },
    { key: "care", label: "关怀浅粉", description: "页面头部氛围、信息背景、图标底色", reference: "顶部渐变、收益区域背景、功能图标背景" },
    { key: "accent", label: "辅助金色", description: "会员、奖励、品质、权益", reference: "超级会员、升级、奖励、优惠标签" },
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
  tokens.push(
    "--radius-small: 4px;",
    "--radius-medium: 8px;",
  );
  return tokens.join("\n");
}

export function storageKeyForTheme(theme: ThemeId) {
  return theme === "blue" ? "maternal-ui-palette:blue:fintech-v1" : "maternal-ui-palette:red";
}
