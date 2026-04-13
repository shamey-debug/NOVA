"use client";

import { useState, useEffect, useRef } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from "recharts";

const G = {
  gold: "#F5C518",
  goldDim: "rgba(245,197,24,0.10)",
  goldBorder: "rgba(245,197,24,0.20)",
  bg: "#070707",
  bg2: "rgba(255,255,255,0.03)",
  bg3: "rgba(255,255,255,0.055)",
  border: "rgba(255,255,255,0.07)",
  muted: "#444",
  sec: "#777",
  text: "#e8e8e8",
  green: "#16a34a",
  greenBg: "rgba(22,163,74,0.10)",
  greenText: "#4ade80",
  red: "#dc2626",
  redBg: "rgba(220,38,38,0.10)",
  redText: "#f87171",
};

const gen = (base: number, n = 60, drift = -0.44) => {
  const out: { t: string; p: number; v: number }[] = [];
  let p = base;
  for (let i = 0; i < n; i++) {
    p += (Math.random() - drift) * base * 0.008;
    out.push({ t: String(i), p: Math.max(p, base * 0.88), v: Math.random() * 100 });
  }
  return out;
};

const PAIRS = [
  { sym: "BTC", quote: "USDT", price: 84220, change: 2.18, base: 84000 },
  { sym: "ETH", quote: "USDT", price: 4182, change: 1.24, base: 4182 },
  { sym: "SOL", quote: "USDT", price: 192.33, change: 4.61, base: 192 },
  { sym: "BNB", quote: "USDT", price: 711.89, change: -0.94, base: 711 },
];

const BOOK_ASKS = [
  { price: "84,285.40", size: "0.4821", total: "40.65" },
  { price: "84,271.20", size: "1.2004", total: "101.14" },
  { price: "84,260.00", size: "0.8811", total: "74.27" },
  { price: "84,251.50", size: "2.1033", total: "177.35" },
  { price: "84,240.80", size: "0.6622", total: "55.82" },
];
const BOOK_BIDS = [
  { price: "84,220.14", size: "1.0420", total: "87.81" },
  { price: "84,210.50", size: "0.7713", total: "65.02" },
  { price: "84,198.20", size: "1.8840", total: "158.73" },
  { price: "84,185.60", size: "0.3301", total: "27.82" },
  { price: "84,172.00", size: "2.4420", total: "205.82" },
];

const TRADES = [
  { time: "14:32:01", price: "84,221.40", size: "0.0821", side: "buy" },
  { time: "14:32:00", price: "84,218.90", size: "0.4400", side: "sell" },
  { time: "14:31:58", price: "84,220.14", size: "0.1102", side: "buy" },
  { time: "14:31:57", price: "84,215.50", size: "0.9900", side: "sell" },
  { time: "14:31:55", price: "84,222.00", size: "0.2211", side: "buy" },
  { time: "14:31:54", price: "84,219.80", size: "0.3300", side: "buy" },
  { time: "14:31:52", price: "84,210.40", size: "1.1200", side: "sell" },
  { time: "14:31:50", price: "84,220.14", size: "0.0550", side: "buy" },
];

const NAV_ITEMS = [
  { icon: "▦", label: "Dashboard", active: true },
  { icon: "◈", label: "Markets" },
  { icon: "⇄", label: "Spot" },
  { icon: "◎", label: "Futures" },
  { icon: "⊞", label: "Portfolio" },
  { icon: "⚙", label: "Settings" },
];

export default function Dashboard() {
  const [activePair, setActivePair] = useState(0);
  const [tab, setTab] = useState("1D");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [chartData] = useState(() => PAIRS.map(p => gen(p.base)));
  const tickerRef = useRef<HTMLDivElement>(null);

  const pair = PAIRS[activePair];
  const data = chartData[activePair];
  const last = data[data.length - 1].p;
  const pct = pair.change;
  const up = pct >= 0;

  // Animate live price flicker
  const [livePrice, setLivePrice] = useState(pair.price);
  useEffect(() => {
    const id = setInterval(() => {
      setLivePrice(p => +(p + (Math.random() - 0.5) * 8).toFixed(2));
    }, 1200);
    return () => clearInterval(id);
  }, [activePair]);

  // Ticker tape
  useEffect(() => {
    let raf: number, x = 0;
    const step = () => {
      x -= 0.4;
      if (tickerRef.current) {
        if (Math.abs(x) >= tickerRef.current.scrollWidth / 2) x = 0;
        tickerRef.current.style.transform = `translateX(${x}px)`;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  const row = (label: string, val: string, color?: string) => (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${G.border}` }}>
      <span style={{ fontSize: "11px", color: G.sec }}>{label}</span>
      <span style={{ fontSize: "11px", color: color ?? G.text, fontWeight: 600 }}>{val}</span>
    </div>
  );

  return (
    <div style={{ display: "flex", height: "100vh", background: G.bg, color: G.text, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif", overflow: "hidden" }}>

      {/* ── Sidebar ── */}
      <aside style={{ width: "56px", borderRight: `1px solid ${G.border}`, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "12px", gap: "4px", flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ width: "34px", height: "34px", background: G.goldDim, border: `1px solid ${G.goldBorder}`, borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", marginBottom: "12px" }}>⚡</div>
        {NAV_ITEMS.map(n => (
          <div key={n.label} title={n.label} style={{ width: "38px", height: "38px", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", cursor: "pointer", background: n.active ? G.goldDim : "transparent", color: n.active ? G.gold : G.muted, border: n.active ? `1px solid ${G.goldBorder}` : "1px solid transparent" }}>
            {n.icon}
          </div>
        ))}
        <div style={{ marginTop: "auto", marginBottom: "16px", width: "32px", height: "32px", borderRadius: "50%", background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, color: G.gold }}>N</div>
      </aside>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Top bar */}
        <div style={{ height: "44px", borderBottom: `1px solid ${G.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", flexShrink: 0, gap: "8px" }}>
          {/* Pair tabs */}
          <div style={{ display: "flex", gap: "2px" }}>
            {PAIRS.map((p, i) => (
              <button key={p.sym} onClick={() => { setActivePair(i); setLivePrice(p.price); }} style={{ padding: "4px 12px", borderRadius: "6px", fontSize: "12px", cursor: "pointer", border: activePair === i ? `1px solid ${G.goldBorder}` : "1px solid transparent", background: activePair === i ? G.goldDim : "transparent", color: activePair === i ? G.gold : G.sec, fontWeight: activePair === i ? 700 : 400 }}>
                {p.sym}/{p.quote}
              </button>
            ))}
          </div>
          {/* Live price */}
          <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
            <span style={{ fontSize: "18px", fontWeight: 800, letterSpacing: "-0.02em", color: up ? G.greenText : G.redText }}>${livePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span style={{ fontSize: "12px", color: up ? G.green : G.red, background: up ? G.greenBg : G.redBg, padding: "2px 7px", borderRadius: "5px", fontWeight: 600 }}>{up ? "+" : ""}{pct}%</span>
          </div>
          {/* Stats */}
          <div style={{ display: "flex", gap: "24px" }}>
            {[["24H High", "$85,420"], ["24H Low", "$83,180"], ["Volume", "$2.84B"], ["Funding", "0.01%"]].map(([l, v]) => (
              <div key={l}>
                <div style={{ fontSize: "10px", color: G.muted, letterSpacing: "0.04em" }}>{l}</div>
                <div style={{ fontSize: "12px", fontWeight: 600 }}>{v}</div>
              </div>
            ))}
          </div>
          {/* Account */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "10px", color: G.muted }}>Portfolio</div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: G.gold }}>$24,812.44</div>
            </div>
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: G.goldDim, border: `1px solid ${G.goldBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: G.gold }}>N</div>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

          {/* ── Chart area ── */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", borderRight: `1px solid ${G.border}`, overflow: "hidden" }}>

            {/* Timeframe tabs */}
            <div style={{ display: "flex", alignItems: "center", gap: "2px", padding: "8px 12px", borderBottom: `1px solid ${G.border}` }}>
              {["1m", "5m", "15m", "1H", "4H", "1D", "1W"].map(t => (
                <button key={t} onClick={() => setTab(t)} style={{ padding: "3px 10px", borderRadius: "5px", fontSize: "11.5px", cursor: "pointer", border: tab === t ? `1px solid ${G.goldBorder}` : "1px solid transparent", background: tab === t ? G.goldDim : "transparent", color: tab === t ? G.gold : G.sec, fontWeight: tab === t ? 700 : 400 }}>{t}</button>
              ))}
              <div style={{ marginLeft: "auto", display: "flex", gap: "6px" }}>
                {["▨", "∿", "⊟"].map(ic => (
                  <button key={ic} style={{ width: "26px", height: "26px", borderRadius: "5px", background: G.bg2, border: `1px solid ${G.border}`, color: G.sec, cursor: "pointer", fontSize: "13px" }}>{ic}</button>
                ))}
              </div>
            </div>

            {/* Area chart */}
            <div style={{ flex: 1, padding: "8px 4px 0" }}>
              <ResponsiveContainer width="100%" height="75%">
                <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={up ? G.green : G.red} stopOpacity={0.18} />
                      <stop offset="100%" stopColor={up ? G.green : G.red} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="t" hide />
                  <YAxis hide domain={["auto", "auto"]} />
                  <Tooltip contentStyle={{ background: "#111", border: `1px solid ${G.border}`, borderRadius: "8px", fontSize: "11px", color: "#fff" }} formatter={(v: number) => [`$${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, "Price"]} labelFormatter={() => ""} />
                  <Area type="monotone" dataKey="p" stroke={up ? G.greenText : G.redText} strokeWidth={1.5} fill="url(#cg)" dot={false} activeDot={{ r: 3, fill: up ? G.green : G.red }} />
                </AreaChart>
              </ResponsiveContainer>
              {/* Volume bars */}
              <ResponsiveContainer width="100%" height="22%">
                <BarChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <Bar dataKey="v" fill={up ? "rgba(22,163,74,0.25)" : "rgba(220,38,38,0.25)"} radius={[1, 1, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── Right panel ── */}
          <div style={{ width: "280px", display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0 }}>

            {/* Order book */}
            <div style={{ flex: 1, borderBottom: `1px solid ${G.border}`, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "8px 12px", borderBottom: `1px solid ${G.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: G.sec }}>Order Book</span>
                <span style={{ fontSize: "10px", color: G.muted }}>BTC/USDT</span>
              </div>
              {/* Headers */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "4px 12px", borderBottom: `1px solid ${G.border}` }}>
                {["Price", "Size", "Total"].map(h => <span key={h} style={{ fontSize: "10px", color: G.muted, letterSpacing: "0.04em" }}>{h}</span>)}
              </div>
              {/* Asks */}
              {BOOK_ASKS.map((a, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "3px 12px", position: "relative" }}>
                  <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: `${20 + i * 12}%`, background: "rgba(220,38,38,0.06)" }} />
                  <span style={{ fontSize: "11px", color: G.redText, fontWeight: 500, zIndex: 1 }}>{a.price}</span>
                  <span style={{ fontSize: "11px", color: G.text, zIndex: 1 }}>{a.size}</span>
                  <span style={{ fontSize: "11px", color: G.sec, zIndex: 1 }}>{a.total}</span>
                </div>
              ))}
              {/* Spread */}
              <div style={{ padding: "4px 12px", background: G.bg2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", fontWeight: 800, color: up ? G.greenText : G.redText }}>${livePrice.toFixed(2)}</span>
                <span style={{ fontSize: "10px", color: G.muted }}>Spread 0.01%</span>
              </div>
              {/* Bids */}
              {BOOK_BIDS.map((b, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "3px 12px", position: "relative" }}>
                  <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: `${15 + i * 11}%`, background: "rgba(22,163,74,0.06)" }} />
                  <span style={{ fontSize: "11px", color: G.greenText, fontWeight: 500, zIndex: 1 }}>{b.price}</span>
                  <span style={{ fontSize: "11px", color: G.text, zIndex: 1 }}>{b.size}</span>
                  <span style={{ fontSize: "11px", color: G.sec, zIndex: 1 }}>{b.total}</span>
                </div>
              ))}
            </div>

            {/* Trade widget */}
            <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {/* Buy/Sell toggle */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", background: G.bg2, borderRadius: "8px", padding: "3px" }}>
                <button onClick={() => setSide("buy")} style={{ padding: "7px", borderRadius: "6px", fontSize: "13px", fontWeight: 700, cursor: "pointer", border: "none", background: side === "buy" ? G.green : "transparent", color: side === "buy" ? "#fff" : G.sec }}>Buy</button>
                <button onClick={() => setSide("sell")} style={{ padding: "7px", borderRadius: "6px", fontSize: "13px", fontWeight: 700, cursor: "pointer", border: "none", background: side === "sell" ? G.red : "transparent", color: side === "sell" ? "#fff" : G.sec }}>Sell</button>
              </div>
              {/* Order type */}
              <div style={{ display: "flex", gap: "4px" }}>
                {["Limit", "Market", "Stop"].map(t => (
                  <button key={t} style={{ flex: 1, padding: "4px", borderRadius: "5px", fontSize: "11px", cursor: "pointer", border: `1px solid ${G.border}`, background: t === "Limit" ? G.bg3 : "transparent", color: t === "Limit" ? G.text : G.muted }}>{t}</button>
                ))}
              </div>
              {/* Price input */}
              <div>
                <div style={{ fontSize: "10px", color: G.muted, marginBottom: "4px" }}>Price (USDT)</div>
                <div style={{ display: "flex", alignItems: "center", background: G.bg3, border: `1px solid ${G.border}`, borderRadius: "7px", padding: "0 10px" }}>
                  <input defaultValue={livePrice.toFixed(2)} style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: "13px", color: G.text, padding: "8px 0" }} />
                  <span style={{ fontSize: "11px", color: G.muted }}>USDT</span>
                </div>
              </div>
              {/* Amount input */}
              <div>
                <div style={{ fontSize: "10px", color: G.muted, marginBottom: "4px" }}>Amount (BTC)</div>
                <div style={{ display: "flex", alignItems: "center", background: G.bg3, border: `1px solid ${G.border}`, borderRadius: "7px", padding: "0 10px" }}>
                  <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: "13px", color: G.text, padding: "8px 0" }} />
                  <span style={{ fontSize: "11px", color: G.muted }}>BTC</span>
                </div>
              </div>
              {/* % quick select */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "4px" }}>
                {["25%", "50%", "75%", "100%"].map(p => (
                  <button key={p} style={{ padding: "4px", borderRadius: "5px", fontSize: "11px", cursor: "pointer", border: `1px solid ${G.border}`, background: G.bg2, color: G.sec }}>{p}</button>
                ))}
              </div>
              {/* Total */}
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "11px", color: G.muted }}>Total</span>
                <span style={{ fontSize: "11px", fontWeight: 600 }}>${amount ? (parseFloat(amount) * livePrice).toFixed(2) : "0.00"} USDT</span>
              </div>
              {/* Submit */}
              <button style={{ padding: "11px", borderRadius: "8px", fontSize: "13px", fontWeight: 800, border: "none", background: side === "buy" ? G.green : G.red, color: "#fff", cursor: "pointer", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                {side === "buy" ? "Buy BTC" : "Sell BTC"}
              </button>
              {/* Balance */}
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "10px", color: G.muted }}>Available</span>
                <span style={{ fontSize: "10px", color: G.gold, fontWeight: 600 }}>12,480.00 USDT</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom strip: recent trades ── */}
        <div style={{ height: "160px", borderTop: `1px solid ${G.border}`, display: "flex", flexShrink: 0 }}>
          {/* Trades */}
          <div style={{ flex: 1, borderRight: `1px solid ${G.border}`, overflow: "hidden" }}>
            <div style={{ padding: "6px 14px", borderBottom: `1px solid ${G.border}`, display: "flex", gap: "24px", alignItems: "center" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: G.sec, letterSpacing: "0.06em", textTransform: "uppercase" }}>Recent Trades</span>
              {["Open Orders (0)", "Order History", "Trade History"].map(t => (
                <span key={t} style={{ fontSize: "11px", color: G.muted, cursor: "pointer" }}>{t}</span>
              ))}
            </div>
            <div style={{ overflowY: "auto", height: "calc(100% - 29px)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${G.border}` }}>
                    {["Time", "Price (USDT)", "Amount (BTC)", "Side"].map(h => (
                      <th key={h} style={{ padding: "4px 14px", textAlign: "left", color: G.muted, fontWeight: 500 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TRADES.map((t, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid rgba(255,255,255,0.03)` }}>
                      <td style={{ padding: "4px 14px", color: G.muted }}>{t.time}</td>
                      <td style={{ padding: "4px 14px", color: t.side === "buy" ? G.greenText : G.redText, fontWeight: 600 }}>{t.price}</td>
                      <td style={{ padding: "4px 14px", color: G.text }}>{t.size}</td>
                      <td style={{ padding: "4px 14px" }}>
                        <span style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "4px", background: t.side === "buy" ? G.greenBg : G.redBg, color: t.side === "buy" ? G.greenText : G.redText, fontWeight: 700, textTransform: "uppercase" }}>{t.side}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Portfolio mini */}
          <div style={{ width: "280px", padding: "8px 14px", display: "flex", flexDirection: "column", gap: "6px", flexShrink: 0 }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: G.sec, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "2px" }}>Portfolio</div>
            {row("Total Value", "$24,812.44", G.gold)}
            {row("Available", "$12,480.00")}
            {row("In Orders", "$8,220.14")}
            {row("24H P&L", "+$1,248.80", G.greenText)}
            {row("24H P&L %", "+5.28%", G.greenText)}
          </div>
        </div>
      </div>
    </div>
  );
}