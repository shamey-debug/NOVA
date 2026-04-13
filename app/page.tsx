"use client";

import { useState, useEffect, useRef } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const G = {
  gold: "#F5C518",
  goldDim: "rgba(245,197,24,0.12)",
  goldBorder: "rgba(245,197,24,0.22)",
  bg: "#070707",
  bg2: "rgba(255,255,255,0.03)",
  border: "rgba(255,255,255,0.07)",
  muted: "#555",
  sec: "#888",
  green: "#16a34a",
  greenBg: "rgba(22,163,74,0.12)",
  red: "#dc2626",
  redBg: "rgba(220,38,38,0.12)",
};

const generatePrices = (base = 84000, n = 40) => {
  const data: { i: string; price: number }[] = [];
  let p = base;
  for (let i = 0; i < n; i++) {
    p += (Math.random() - 0.44) * 900;
    data.push({ i: String(i), price: Math.max(p, base * 0.9) });
  }
  return data;
};

const TICKERS = [
  { pair: "BTC/USDT", price: "84,220.14", change: "+2.18%", up: true },
  { pair: "ETH/USDT", price: "4,182.40", change: "+1.24%", up: true },
  { pair: "SOL/USDT", price: "192.33", change: "+4.61%", up: true },
  { pair: "BNB/USDT", price: "711.89", change: "+0.92%", up: true },
  { pair: "XRP/USDT", price: "0.8420", change: "-0.31%", up: false },
  { pair: "ADA/USDT", price: "1.2050", change: "+1.87%", up: true },
  { pair: "MATIC/USDT", price: "1.8390", change: "-0.94%", up: false },
  { pair: "DOT/USDT", price: "14.220", change: "+2.45%", up: true },
];

const MARKETS = [
  { pair: "BTC/USDT", price: "$84,220", change: "+2.18%", up: true, vol: "$2.84B", base: 84000 },
  { pair: "ETH/USDT", price: "$4,182", change: "+1.24%", up: true, vol: "$1.12B", base: 4182 },
  { pair: "SOL/USDT", price: "$192.33", change: "+4.61%", up: true, vol: "$844M", base: 192 },
  { pair: "BNB/USDT", price: "$711.89", change: "+0.92%", up: true, vol: "$320M", base: 711 },
];

const FEATURES = [
  { icon: "⚡", title: "Sub-5ms Execution", desc: "Institutional-grade order routing with guaranteed best execution across all major liquidity pools." },
  { icon: "📊", title: "Pro Trading Charts", desc: "TradingView-powered charts with 100+ indicators, drawing tools, and multi-timeframe analysis." },
  { icon: "🔒", title: "Vault-Grade Security", desc: "Cold storage custody, 2FA, biometric auth, and real-time fraud detection protect every account." },
  { icon: "🌐", title: "200+ Markets", desc: "Trade spot, futures, options, and perpetuals across every major crypto asset from one dashboard." },
  { icon: "🤖", title: "AI Trading Signals", desc: "Machine-learning signals powered by on-chain data, order flow, and live sentiment analysis." },
  { icon: "📱", title: "Cross-Platform", desc: "Seamless sync across web, iOS, Android, and desktop. Your edge doesn't stop at the desk." },
];

const STATS = [
  { val: "$2.8B+", label: "Daily Volume" },
  { val: "4.2M+", label: "Traders" },
  { val: "< 5ms", label: "Execution" },
  { val: "99.99%", label: "Uptime" },
];

const NAV = ["Markets", "Trade", "Earn", "Analytics", "Learn", "Pricing"];

export default function HomePage() {
  const [btcData] = useState(() => generatePrices(84000));
  const [miniData] = useState(() => MARKETS.map(m => generatePrices(m.base, 20)));
  const [tab, setTab] = useState("1D");
  const tickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf: number;
    let x = 0;
    const step = () => {
      x -= 0.5;
      if (tickerRef.current) {
        const half = tickerRef.current.scrollWidth / 2;
        if (Math.abs(x) >= half) x = 0;
        tickerRef.current.style.transform = `translateX(${x}px)`;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  const last = btcData[btcData.length - 1]?.price ?? 84220;
  const first = btcData[0]?.price ?? 82000;
  const pct = (((last - first) / first) * 100).toFixed(2);
  const up = last >= first;

  return (
    <div style={{ background: G.bg, minHeight: "100vh", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif", overflowX: "hidden" }}>

      {/* Ticker tape */}
      <div style={{ background: "rgba(245,197,24,0.05)", borderBottom: `1px solid ${G.border}`, padding: "7px 0", overflow: "hidden" }}>
        <div ref={tickerRef} style={{ display: "inline-flex", gap: "56px", whiteSpace: "nowrap" }}>
          {[...TICKERS, ...TICKERS].map((t, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "11.5px", letterSpacing: "0.04em" }}>
              <span style={{ color: G.muted, fontWeight: 500 }}>{t.pair}</span>
              <span style={{ color: "#fff", fontWeight: 600 }}>${t.price}</span>
              <span style={{ color: t.up ? G.green : G.red, fontSize: "11px", background: t.up ? G.greenBg : G.redBg, padding: "2px 6px", borderRadius: "4px" }}>{t.change}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px", height: "60px", borderBottom: `1px solid ${G.border}`, position: "sticky", top: 0, zIndex: 100, background: "rgba(7,7,7,0.94)", backdropFilter: "blur(24px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "34px", height: "34px", background: G.goldDim, border: `1px solid ${G.goldBorder}`, borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>⚡</div>
          <div>
            <div style={{ fontSize: "16px", fontWeight: 800, letterSpacing: "0.16em", color: G.gold }}>NOVA</div>
            <div style={{ fontSize: "9px", letterSpacing: "0.22em", color: G.muted, textTransform: "uppercase", marginTop: "-1px" }}>Advanced Trading</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "2px" }}>
          {NAV.map(l => (
            <button key={l} style={{ padding: "6px 14px", borderRadius: "7px", fontSize: "13px", color: G.sec, background: "transparent", border: "none", cursor: "pointer" }}>{l}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button style={{ padding: "7px 16px", borderRadius: "8px", fontSize: "13px", border: `1px solid ${G.border}`, background: "transparent", color: G.sec, cursor: "pointer" }}>Sign In</button>
          <button style={{ padding: "7px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, border: "none", background: G.gold, color: "#000", cursor: "pointer" }}>Start Trading</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ borderBottom: `1px solid ${G.border}` }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "56px", maxWidth: "1200px", margin: "0 auto", padding: "72px 40px", alignItems: "start" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 14px", borderRadius: "100px", border: `1px solid ${G.goldBorder}`, background: G.goldDim, fontSize: "10.5px", letterSpacing: "0.2em", color: G.gold, textTransform: "uppercase" as const, marginBottom: "28px" }}>
              ⚡ Institutional · Ultra-Fast · Secure
            </div>
            <h1 style={{ fontSize: "48px", fontWeight: 900, lineHeight: 1.08, letterSpacing: "-0.03em", margin: "0 0 18px" }}>
              Trade crypto<br />at <span style={{ color: G.gold }}>lightning speed.</span>
            </h1>
            <p style={{ fontSize: "15px", color: G.sec, lineHeight: 1.75, maxWidth: "420px", margin: "0 0 36px" }}>
              Professional execution, real-time analytics, and institutional-grade infrastructure — built for traders who demand performance.
            </p>
            <div style={{ display: "flex", gap: "10px", marginBottom: "48px" }}>
              <button style={{ padding: "13px 26px", borderRadius: "10px", fontSize: "14px", fontWeight: 700, border: "none", background: G.gold, color: "#000", cursor: "pointer" }}>Open Platform →</button>
              <button style={{ padding: "13px 26px", borderRadius: "10px", fontSize: "14px", border: `1px solid ${G.border}`, background: "transparent", color: "#bbb", cursor: "pointer" }}>Watch Demo</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1px", background: G.border, borderRadius: "14px", overflow: "hidden", border: `1px solid ${G.border}` }}>
              {STATS.map(s => (
                <div key={s.label} style={{ background: G.bg2, padding: "18px 14px" }}>
                  <div style={{ fontSize: "20px", fontWeight: 800, color: G.gold }}>{s.val}</div>
                  <div style={{ fontSize: "10px", color: G.muted, marginTop: "5px", letterSpacing: "0.07em", textTransform: "uppercase" as const }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Chart card */}
          <div style={{ background: G.bg2, border: `1px solid ${G.border}`, borderRadius: "20px", overflow: "hidden" }}>
            <div style={{ padding: "18px 20px 14px", borderBottom: `1px solid ${G.border}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: "11px", color: G.muted, letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: "6px" }}>BTC / USDT</div>
                <div style={{ fontSize: "26px", fontWeight: 800, letterSpacing: "-0.02em" }}>${last.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                <div style={{ fontSize: "12px", color: up ? G.green : G.red, marginTop: "4px", fontWeight: 600 }}>{up ? "▲" : "▼"} {Math.abs(Number(pct))}% (24H)</div>
              </div>
              <div style={{ textAlign: "right" as const }}>
                <div style={{ fontSize: "10px", color: G.muted, letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: "6px" }}>24H Volume</div>
                <div style={{ fontSize: "17px", fontWeight: 700 }}>$2.84B</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "4px", padding: "12px 16px 0" }}>
              {["15m", "1H", "4H", "1D", "1W"].map(t => (
                <button key={t} onClick={() => setTab(t)} style={{ padding: "4px 12px", borderRadius: "6px", fontSize: "11.5px", cursor: "pointer", border: tab === t ? `1px solid ${G.goldBorder}` : "1px solid transparent", background: tab === t ? G.goldDim : "transparent", color: tab === t ? G.gold : G.sec, fontWeight: tab === t ? 700 : 400 }}>{t}</button>
              ))}
            </div>
            <div style={{ padding: "12px 8px" }}>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={btcData} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
                  <defs>
                    <linearGradient id="gGold" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={G.gold} stopOpacity={0.22} />
                      <stop offset="100%" stopColor={G.gold} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="i" hide />
                  <YAxis hide domain={["auto", "auto"]} />
                  <Tooltip contentStyle={{ background: "#111", border: `1px solid ${G.border}`, borderRadius: "8px", fontSize: "12px", color: "#fff" }} formatter={(v: number) => [`$${Math.round(v).toLocaleString()}`, "Price"]} labelFormatter={() => ""} />
                  <Area type="monotone" dataKey="price" stroke={G.gold} strokeWidth={2} fill="url(#gGold)" dot={false} activeDot={{ r: 4, fill: G.gold, stroke: "#000" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "1px", background: G.border, borderTop: `1px solid ${G.border}` }}>
              {[["High 24H", "$85,420"], ["Low 24H", "$83,180"], ["Open Int.", "$8.2B"], ["Funding", "0.01%"]].map(([label, val]) => (
                <div key={label} style={{ background: "rgba(255,255,255,0.02)", padding: "10px 14px" }}>
                  <div style={{ fontSize: "10px", color: G.muted, marginBottom: "4px" }}>{label}</div>
                  <div style={{ fontSize: "13px", fontWeight: 700 }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Market overview */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "60px 40px", borderBottom: `1px solid ${G.border}` }}>
        <div style={{ fontSize: "10.5px", color: G.gold, letterSpacing: "0.24em", textTransform: "uppercase" as const, marginBottom: "10px" }}>Market Snapshot</div>
        <h2 style={{ fontSize: "30px", fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 36px" }}>Real-time overview</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px" }}>
          {MARKETS.map((m, idx) => (
            <div key={m.pair} style={{ background: G.bg2, border: `1px solid ${G.border}`, borderRadius: "14px", padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <span style={{ fontSize: "11.5px", color: G.sec }}>{m.pair}</span>
                <span style={{ fontSize: "11px", color: m.up ? G.green : G.red, background: m.up ? G.greenBg : G.redBg, padding: "2px 7px", borderRadius: "5px", fontWeight: 600 }}>{m.change}</span>
              </div>
              <div style={{ fontSize: "20px", fontWeight: 800, marginBottom: "4px" }}>{m.price}</div>
              <div style={{ fontSize: "11px", color: G.muted, marginBottom: "14px" }}>Vol {m.vol}</div>
              <ResponsiveContainer width="100%" height={44}>
                <AreaChart data={miniData[idx]}>
                  <Area type="monotone" dataKey="price" stroke={m.up ? G.green : G.red} strokeWidth={1.5} fill={m.up ? "rgba(22,163,74,0.08)" : "rgba(220,38,38,0.08)"} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "60px 40px", borderBottom: `1px solid ${G.border}` }}>
        <div style={{ fontSize: "10.5px", color: G.gold, letterSpacing: "0.24em", textTransform: "uppercase" as const, marginBottom: "10px" }}>Platform Edge</div>
        <h2 style={{ fontSize: "30px", fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 36px" }}>Built for performance & scale</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "14px" }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{ background: G.bg2, border: `1px solid ${G.border}`, borderRadius: "16px", padding: "26px 22px" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "11px", background: G.goldDim, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", marginBottom: "16px" }}>{f.icon}</div>
              <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "10px" }}>{f.title}</div>
              <div style={{ fontSize: "13px", color: G.muted, lineHeight: 1.65 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "60px 40px 80px" }}>
        <div style={{ background: "rgba(245,197,24,0.06)", border: `1px solid ${G.goldBorder}`, borderRadius: "24px", padding: "64px 40px", textAlign: "center" as const, position: "relative" as const, overflow: "hidden" }}>
          <div style={{ position: "absolute" as const, inset: 0, backgroundImage: `radial-gradient(circle, rgba(245,197,24,0.15) 1px, transparent 1px)`, backgroundSize: "28px 28px", opacity: 0.4 }} />
          <div style={{ position: "relative" as const, zIndex: 1 }}>
            <div style={{ fontSize: "10.5px", color: G.gold, letterSpacing: "0.24em", textTransform: "uppercase" as const, marginBottom: "18px" }}>Get started today</div>
            <h2 style={{ fontSize: "38px", fontWeight: 900, letterSpacing: "-0.03em", margin: "0 0 16px" }}>Ready to trade smarter?</h2>
            <p style={{ fontSize: "15px", color: G.sec, maxWidth: "460px", margin: "0 auto 32px", lineHeight: 1.7 }}>
              Join 4.2 million traders on the most advanced crypto platform. No setup fees, instant access, zero compromise.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button style={{ padding: "14px 28px", borderRadius: "10px", fontSize: "14px", fontWeight: 700, border: "none", background: G.gold, color: "#000", cursor: "pointer" }}>Create Free Account →</button>
              <button style={{ padding: "14px 28px", borderRadius: "10px", fontSize: "14px", border: `1px solid ${G.border}`, background: "transparent", color: "#bbb", cursor: "pointer" }}>Explore Platform</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}