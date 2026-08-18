"use client";

import { useEffect, useMemo, useState } from "react";

type Palette = {
  primary: string;
  atmosphere: string;
  corporate: string;
  accent: string;
};

const defaultPalette: Palette = {
  primary: "#2388F5",
  atmosphere: "#55A9F8",
  corporate: "#2FAAF0",
  accent: "#FFB02E",
};

const presets: Array<{ name: string; colors: Palette }> = [
  { name: "清爽蓝", colors: defaultPalette },
  {
    name: "天空蓝",
    colors: {
      primary: "#148EEA",
      atmosphere: "#62B8F5",
      corporate: "#28A9E8",
      accent: "#FFAA33",
    },
  },
  {
    name: "钴石蓝",
    colors: {
      primary: "#3767E8",
      atmosphere: "#7B9CF4",
      corporate: "#4D77E9",
      accent: "#FFAD2F",
    },
  },
];

function normalizeHex(value: string) {
  const raw = value.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{6}$/.test(raw)) return `#${raw.toUpperCase()}`;
  if (/^[0-9a-fA-F]{3}$/.test(raw)) {
    return `#${raw
      .split("")
      .map((char) => char + char)
      .join("")
      .toUpperCase()}`;
  }
  return null;
}

function mix(hex: string, target: string, amount: number) {
  const source = normalizeHex(hex) ?? defaultPalette.primary;
  const destination = normalizeHex(target) ?? "#FFFFFF";
  const channels = [1, 3, 5].map((index) => {
    const start = parseInt(source.slice(index, index + 2), 16);
    const end = parseInt(destination.slice(index, index + 2), 16);
    return Math.round(start + (end - start) * amount)
      .toString(16)
      .padStart(2, "0");
  });
  return `#${channels.join("").toUpperCase()}`;
}

function ColorControl({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [draft, setDraft] = useState(value);

  useEffect(() => setDraft(value), [value]);

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
      <span>{label}</span>
      <div className="color-input-row">
        <input
          className="color-picker"
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          aria-label={`${label}取色器`}
        />
        <input
          className="hex-input"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
          }}
          spellCheck={false}
          aria-label={`${label}色号`}
        />
      </div>
    </label>
  );
}

export default function Home() {
  const [palette, setPalette] = useState<Palette>(defaultPalette);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("blue-ui-palette");
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as Partial<Palette>;
      if (
        normalizeHex(parsed.primary ?? "") &&
        normalizeHex(parsed.atmosphere ?? "") &&
        normalizeHex(parsed.corporate ?? "") &&
        normalizeHex(parsed.accent ?? "")
      ) {
        setPalette(parsed as Palette);
      }
    } catch {
      // Keep the default palette when local preferences are invalid.
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("blue-ui-palette", JSON.stringify(palette));
  }, [palette]);

  const tones = useMemo(
    () => [
      { name: "50", color: mix(palette.primary, "#FFFFFF", 0.92) },
      { name: "100", color: mix(palette.primary, "#FFFFFF", 0.82) },
      { name: "200", color: mix(palette.primary, "#FFFFFF", 0.66) },
      { name: "300", color: mix(palette.primary, "#FFFFFF", 0.44) },
      { name: "400", color: mix(palette.primary, "#FFFFFF", 0.2) },
      { name: "500", color: palette.primary },
      { name: "600", color: mix(palette.primary, "#000000", 0.12) },
      { name: "700", color: mix(palette.primary, "#000000", 0.26) },
      { name: "800", color: mix(palette.primary, "#000000", 0.4) },
      { name: "900", color: mix(palette.primary, "#000000", 0.56) },
    ],
    [palette.primary],
  );

  const style = {
    "--primary": palette.primary,
    "--primary-soft": mix(palette.primary, "#FFFFFF", 0.88),
    "--primary-pale": mix(palette.primary, "#FFFFFF", 0.94),
    "--primary-deep": mix(palette.primary, "#000000", 0.28),
    "--atmosphere": palette.atmosphere,
    "--corporate": palette.corporate,
    "--accent": palette.accent,
  } as React.CSSProperties;

  function updateColor(key: keyof Palette, value: string) {
    setPalette((current) => ({ ...current, [key]: value }));
  }

  async function copyTokens() {
    const text = [
      `--color-primary: ${palette.primary};`,
      `--color-atmosphere: ${palette.atmosphere};`,
      `--color-corporate: ${palette.corporate};`,
      `--color-accent: ${palette.accent};`,
    ].join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <main className="app-shell" style={style}>
      <header className="topbar">
        <div>
          <p className="eyebrow">MINI PROGRAM · UI KIT</p>
          <h1>蓝色设计系统看板</h1>
          <p className="subtitle">直接修改色号，右侧组件会实时更新</p>
        </div>
        <button className="copy-button" onClick={copyTokens} type="button">
          {copied ? "已复制" : "复制 CSS 色号"}
        </button>
      </header>

      <div className="workspace">
        <aside className="editor-panel" aria-label="颜色编辑区">
          <div className="panel-heading">
            <div>
              <span className="step">01</span>
              <h2>调整品牌色</h2>
            </div>
            <button
              className="reset-button"
              type="button"
              onClick={() => setPalette(defaultPalette)}
            >
              恢复默认
            </button>
          </div>

          <div className="controls">
            <ColorControl
              label="主色 Primary"
              value={palette.primary}
              onChange={(value) => updateColor("primary", value)}
            />
            <ColorControl
              label="氛围辅色"
              value={palette.atmosphere}
              onChange={(value) => updateColor("atmosphere", value)}
            />
            <ColorControl
              label="企业辅色"
              value={palette.corporate}
              onChange={(value) => updateColor("corporate", value)}
            />
            <ColorControl
              label="强调色"
              value={palette.accent}
              onChange={(value) => updateColor("accent", value)}
            />
          </div>

          <div className="preset-section">
            <span className="section-label">快速试色</span>
            <div className="preset-list">
              {presets.map((preset) => (
                <button
                  type="button"
                  className="preset-button"
                  key={preset.name}
                  onClick={() => setPalette(preset.colors)}
                >
                  <span
                    className="preset-dot"
                    style={{ background: preset.colors.primary }}
                  />
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div className="tip-card">
            <span>小提示</span>
            <p>你修改的颜色会保存在当前浏览器，下次打开仍会保留。</p>
          </div>
        </aside>

        <section className="design-board" aria-label="设计系统组件预览">
          <div className="board-header">
            <div>
              <span className="step">02</span>
              <h2>组件实时预览</h2>
            </div>
            <span className="live-badge"><i /> LIVE</span>
          </div>

          <section className="tone-card">
            <div className="card-title-row">
              <div>
                <span className="section-label">COLOR SCALE</span>
                <h3>主色色阶</h3>
              </div>
              <strong>{palette.primary}</strong>
            </div>
            <div className="tone-grid">
              {tones.map((tone, index) => (
                <div className="tone-item" key={tone.name}>
                  <div
                    className="tone-swatch"
                    style={{ background: tone.color }}
                  />
                  <span>{tone.name}</span>
                  <code>{tone.color}</code>
                  {index === 5 && <b>主色</b>}
                </div>
              ))}
            </div>
          </section>

          <div className="component-grid">
            <article className="component-card typography-card">
              <span className="section-label">TYPOGRAPHY</span>
              <div className="type-sample">
                <div className="type-mark">Aa</div>
                <div><b>页面标题</b><span>22px · Semibold</span></div>
              </div>
              <div className="type-sample body-type">
                <div className="type-mark">Aa</div>
                <div><b>正文信息</b><span>15px · Regular</span></div>
              </div>
            </article>

            <article className="component-card">
              <span className="section-label">BUTTONS</span>
              <h3>操作按钮</h3>
              <div className="button-stack">
                <button className="demo-primary" type="button">主要操作</button>
                <button className="demo-secondary" type="button">次要操作</button>
                <button className="demo-ghost" type="button">轻量按钮</button>
              </div>
            </article>

            <article className="component-card">
              <span className="section-label">INPUT</span>
              <h3>搜索与输入</h3>
              <label className="search-box">
                <span>⌕</span>
                <input aria-label="搜索示例" placeholder="搜索服务或订单" />
              </label>
              <div className="focus-input">
                <span>收件地址</span><b>请选择 ›</b>
              </div>
            </article>

            <article className="component-card chart-card">
              <span className="section-label">DATA</span>
              <div className="metric-row"><div><b>1,286</b><span>本月订单</span></div><em>+18.6%</em></div>
              <div className="bar-chart" aria-label="订单趋势示意图">
                {[42, 66, 52, 82, 68, 92, 78].map((height, index) => (
                  <i key={index} style={{ height: `${height}%` }} />
                ))}
              </div>
            </article>

            <article className="component-card">
              <span className="section-label">NAVIGATION</span>
              <h3>底部导航</h3>
              <div className="nav-demo">
                <div className="active"><i>⌂</i><span>首页</span></div>
                <div><i>▤</i><span>订单</span></div>
                <div><i>♙</i><span>我的</span></div>
              </div>
            </article>

            <article className="component-card">
              <span className="section-label">STATUS</span>
              <h3>状态标签</h3>
              <div className="tag-list">
                <span className="tag in-progress">进行中</span>
                <span className="tag official">官方认证</span>
                <span className="tag warning">待处理</span>
                <span className="tag neutral">已关闭</span>
              </div>
              <div className="mini-notice"><i>✓</i><div><b>提交成功</b><span>信息已保存</span></div></div>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
