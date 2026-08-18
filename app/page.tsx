"use client";

import { useEffect, useMemo, useState } from "react";
import {
  defaultPalettes,
  getThemePresets,
  mix,
  normalizeHex,
  serializeTokens,
  storageKeyForTheme,
  validateStoredPalette,
  type Palette,
  type ThemeId,
} from "./palette";

const THEME_KEY = "ui-board-theme";

function ColorControl({ label, description, value, onChange }: {
  label: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [draft, setDraft] = useState(value);

  function commit() {
    const normalized = normalizeHex(draft);
    if (normalized) {
      onChange(normalized);
      setDraft(normalized);
    } else {
      setDraft(value);
    }
  }

  return (
    <label className="color-control">
      <span className="control-copy"><b>{label}</b><small>{description}</small></span>
      <span className="color-input-row">
        <input className="color-picker" type="color" value={value} onChange={(event) => onChange(event.target.value.toUpperCase())} aria-label={`${label}取色器`} />
        <input className="hex-input" value={draft} onChange={(event) => setDraft(event.target.value)} onBlur={commit} onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }} spellCheck={false} aria-label={`${label}色号`} />
      </span>
    </label>
  );
}

export default function Home() {
  const [theme, setTheme] = useState<ThemeId>("red");
  const [palettes, setPalettes] = useState<Record<ThemeId, Palette>>(defaultPalettes);
  const [hydrated, setHydrated] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const palette = palettes[theme];
  const presets = getThemePresets(theme);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const loaded = { ...defaultPalettes };
      for (const themeId of ["red", "blue"] as const) {
        const saved = window.localStorage.getItem(storageKeyForTheme(themeId));
        if (saved) {
          try {
            loaded[themeId] = validateStoredPalette(JSON.parse(saved)) ?? defaultPalettes[themeId];
          } catch {
            loaded[themeId] = defaultPalettes[themeId];
          }
        }
      }
      setPalettes(loaded);
      const savedTheme = window.localStorage.getItem(THEME_KEY);
      if (savedTheme === "red" || savedTheme === "blue") setTheme(savedTheme);
      setHydrated(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(THEME_KEY, theme);
    window.localStorage.setItem(storageKeyForTheme("red"), JSON.stringify(palettes.red));
    window.localStorage.setItem(storageKeyForTheme("blue"), JSON.stringify(palettes.blue));
  }, [hydrated, palettes, theme]);

  const tones = useMemo(() => [
    { name: "50", color: mix(palette.brand, "#FFFFFF", 0.94) },
    { name: "100", color: mix(palette.brand, "#FFFFFF", 0.84) },
    { name: "200", color: mix(palette.brand, "#FFFFFF", 0.68) },
    { name: "300", color: mix(palette.brand, "#FFFFFF", 0.48) },
    { name: "400", color: mix(palette.brand, "#FFFFFF", 0.24) },
    { name: "500", color: palette.brand },
    { name: "600", color: mix(palette.brand, "#000000", 0.12) },
    { name: "700", color: mix(palette.brand, "#000000", 0.25) },
    { name: "800", color: mix(palette.brand, "#000000", 0.38) },
    { name: "900", color: mix(palette.brand, "#000000", 0.52) },
  ], [palette.brand]);

  const style = {
    "--brand": palette.brand,
    "--brand-soft": mix(palette.brand, "#FFFFFF", 0.88),
    "--brand-pale": mix(palette.brand, "#FFFFFF", 0.94),
    "--brand-deep": mix(palette.brand, "#000000", 0.22),
    "--price": palette.price,
    "--promo": palette.promo,
    "--member": palette.member,
    "--care": palette.care,
    "--care-pale": mix(palette.care, "#FFFFFF", 0.9),
  } as React.CSSProperties;

  function updateColor(key: keyof Palette, value: string) {
    setPalettes((current) => ({
      ...current,
      [theme]: { ...current[theme], [key]: value },
    }));
  }

  function applyPalette(colors: Palette) {
    setPalettes((current) => ({ ...current, [theme]: colors }));
  }

  async function copyTokens() {
    try {
      await navigator.clipboard.writeText(serializeTokens(palette));
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
    window.setTimeout(() => setCopyState("idle"), 1700);
  }

  return (
    <main className="app-shell" style={style}>
      <header className="topbar">
        <div>
          <p className="eyebrow">MATERNAL &amp; BABY · MINI PROGRAM UI KIT</p>
          <h1>{theme === "red" ? "红色母婴设计系统看板" : "蓝色通用设计系统看板"}</h1>
          <p className="subtitle">直接修改色号，组件会实时更新</p>
        </div>
        <div className="topbar-actions">
          <div className="theme-switcher" role="group" aria-label="看板颜色主题">
            <button type="button" aria-pressed={theme === "red"} onClick={() => setTheme("red")}><i className="red-dot" />红色母婴</button>
            <button type="button" aria-pressed={theme === "blue"} onClick={() => setTheme("blue")}><i className="blue-dot" />蓝色通用</button>
          </div>
          <button className="copy-button" onClick={copyTokens} type="button">
            {copyState === "copied" ? "已复制" : copyState === "error" ? "复制失败，请重试" : "复制 CSS Tokens"}
          </button>
        </div>
      </header>

      <div className="workspace">
        <aside className="editor-panel" aria-label="颜色编辑区">
          <div className="panel-heading">
            <div><span className="step">01</span><div><h2>调整语义色</h2><p>每种红色负责不同业务信息</p></div></div>
            <button className="reset-button" type="button" onClick={() => applyPalette(defaultPalettes[theme])}>恢复规范默认值</button>
          </div>

          <div className="controls">
            <ColorControl key={`brand-${palette.brand}`} label="品牌主色" description="品牌、主按钮、选中态" value={palette.brand} onChange={(value) => updateColor("brand", value)} />
            <ColorControl key={`price-${palette.price}`} label="价格红" description="商品价格、到手价" value={palette.price} onChange={(value) => updateColor("price", value)} />
            <ColorControl key={`promo-${palette.promo}`} label="促销红" description="优惠券、秒杀、满减" value={palette.promo} onChange={(value) => updateColor("promo", value)} />
            <ColorControl key={`member-${palette.member}`} label="会员深红" description="VIP 权益、会员专享" value={palette.member} onChange={(value) => updateColor("member", value)} />
            <ColorControl key={`care-${palette.care}`} label="关怀粉红" description="成长提醒、育儿内容" value={palette.care} onChange={(value) => updateColor("care", value)} />
          </div>

          <section className="preset-section" aria-label="快速试色方案">
            <span className="section-label">PALETTE PRESETS</span>
            <div className="preset-list">
              {presets.map((preset) => (
                <button key={preset.name} type="button" className="preset-button" onClick={() => applyPalette(preset.colors)}>
                  <span className="preset-colors" aria-hidden="true"><i style={{ background: preset.colors.brand }} /><i style={{ background: preset.colors.price }} /><i style={{ background: preset.colors.care }} /></span>
                  <span><b>{preset.name}</b><small>{preset.note}</small></span>
                </button>
              ))}
            </div>
          </section>

          <div className="tip-card"><b>自动保存</b><p>调整后的色号会保存在当前浏览器，下次打开仍会保留。</p></div>
        </aside>

        <section className="design-board" aria-label="设计系统组件预览">
          <div className="board-header">
            <div><span className="step">02</span><div><h2>组件实时预览</h2><p>颜色、字体和状态统一呈现</p></div></div>
            <span className="live-badge"><i /> LIVE</span>
          </div>

          <section className="tone-card">
            <div className="card-title-row"><div><span className="section-label">BRAND COLOR SCALE</span><h3>品牌主色色阶</h3></div><strong>{palette.brand}</strong></div>
            <div className="tone-grid">
              {tones.map((tone, index) => (
                <div className="tone-item" key={tone.name}><div className="tone-swatch" style={{ background: tone.color }} /><span>{tone.name}</span><code>{tone.color}</code>{index === 5 && <b>主色</b>}</div>
              ))}
            </div>
          </section>

          <div className="component-grid">
            <article className="component-card typography-card">
              <span className="section-label">TYPOGRAPHY</span><h3>文字层级</h3>
              <div className="type-row"><b className="type-page">页面标题</b><span>24 / 32 · 600</span></div>
              <div className="type-row"><b className="type-section">模块标题</b><span>20 / 28 · 600</span></div>
              <div className="type-row"><b className="type-subsection">区块标题</b><span>16 / 24 · 600</span></div>
              <div className="type-row"><b className="type-body">正文信息清晰易读</b><span>14 / 22 · 400</span></div>
              <div className="type-row"><b className="type-caption">辅助说明与备注</b><span>12 / 20 · 400</span></div>
            </article>

            <article className="component-card">
              <span className="section-label">ACTIONS</span><h3>按钮与输入</h3>
              <div className="button-stack"><button className="demo-primary" type="button">主要操作</button><button className="demo-secondary" type="button">次要操作</button><button className="demo-soft" type="button">轻量按钮</button><button className="demo-disabled" type="button" disabled>暂不可用</button></div>
              <label className="search-box"><span aria-hidden="true">⌕</span><input aria-label="搜索示例" placeholder="搜索商品、育儿内容" /></label>
            </article>

            <article className="component-card product-card">
              <div className="product-visual" aria-hidden="true"><span>6–12 月龄</span><i>成长营养</i></div>
              <div className="product-content"><span className="promo-label">限时优惠</span><h3>宝宝成长营养组合</h3><p>科学配比 · 温和易吸收</p><div className="price-row"><span>¥</span><b>259</b><del>¥329</del></div><div className="member-line"><b>会员专享</b><span>再省 ¥20</span></div></div>
            </article>

            <article className="component-card care-card">
              <span className="section-label">CARE MESSAGE</span><div className="care-illustration" aria-hidden="true"><i>♡</i></div><h3>安心成长提醒</h3><p>宝宝本周进入辅食适应期，建议从细腻单一食材开始，留意接受度。</p><button type="button">查看喂养建议 <span>→</span></button>
            </article>

            <article className="component-card">
              <span className="section-label">NAVIGATION</span><h3>小程序底部导航</h3>
              <nav className="nav-demo" aria-label="底部导航示例"><span className="active"><i>⌂</i><b>首页</b></span><span><i>▦</i><b>分类</b></span><span><i>♡</i><b>育儿</b></span><span><i>♙</i><b>我的</b></span></nav>
            </article>

            <article className="component-card">
              <span className="section-label">STATUS</span><h3>状态与反馈</h3>
              <div className="tag-list"><span className="tag brand-tag">品牌活动</span><span className="tag promo-tag">满 299 减 40</span><span className="tag success-tag">已完成</span><span className="tag warning-tag">库存偏低</span><span className="tag danger-tag">操作失败</span></div>
              <div className="success-notice"><i>✓</i><span><b>保存成功</b><small>新的设计 Token 已应用</small></span></div>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
