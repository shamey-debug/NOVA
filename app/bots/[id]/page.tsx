"use client";

import { useState, useEffect, useRef } from "react";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const G = {
  gold: "#F5C518",
  goldDim: "rgba(245,197,24,0.10)",
  goldBorder: "rgba(245,197,24,0.22)",
  bg: "#070707",
  bg2: "rgba(255,255,255,0.03)",
  bg3: "rgba(255,255,255,0.055)",
  border: "rgba(255,255,255,0.07)",
  muted: "#444",
  sec: "#666",
  text: "#e8e8e8",
  green: "#16a34a",
  greenBg: "rgba(22,163,74,0.10)",
  greenText: "#4ade80",
  greenBorder: "rgba(74,222,128,0.2)",
  red: "#dc2626",
  redBg: "rgba(220,38,38,0.10)",
  redText: "#f87171",
  purple: "#8b5cf6",
  purpleBg: "rgba(139,92,246,0.10)",
};

const LOG_TEMPLATES = [
  { type: "info",    icon: "◈", msg: (p: string) => `Scanning ${p} order book for entry signal...` },
  { type: "success", icon: "✓", msg: (p: string) => `Signal confirmed — RSI oversold at 28.4 on ${p}` },
  { type: "trade",   icon: "⚡", msg: (p: string) => `BUY executed: 0.${Math.floor(Math.random()*9+1)}${Math.floor(Math.random()*999)} ${p.split("/")[0]} @ $${(84000 + Math.random()*400).toFixed(2)}` },
  { type: "info",    icon: "◈", msg: () => `Trailing stop updated to -1.8%` },
  { type: "success", icon: "✓", msg: (p: string) => `SELL executed — profit locked +$${(Math.random()*120+20).toFixed(2)}` },
  { type: "info",    icon: "◈", msg: () => `Grid rebalanced across 8 levels` },
  { type: "warn",    icon: "△", msg: () => `Volatility spike detected — tightening stops` },
  { type: "info",    icon: "◈", msg: (p: string) => `Monitoring ${p} — waiting for next candle close` },
  { type: "success", icon: "✓", msg: () => `Momentum confirmed — increasing position size 1.2x` },
  { type: "trade",   icon: "⚡", msg: (p: string) => `SELL executed: partial exit ${p.split("/")[0]} @ $${(84100 + Math.random()*500).toFixed(2)}` },
];

const logColor = (type: string) => {
  if (type === "success" || type === "trade") return G.greenText;
  if (type === "warn") return G.gold;
  if (type === "error") return G.redText;
  return G.sec;
};

const now = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")}.${String(d.getMilliseconds()).padStart(3,"0")}`;
};

const genPnl = (n = 40) => {
  const out = [];
  let v = 0;
  for (let i = 0; i < n; i++) {
    v += (Math.random() - 0.38) * 80;
    out.push({ i, v: +v.toFixed(2) });
  }
  return out;
};

const TRADES_HISTORY = [
  { time: "14:31:22", side: "BUY",  price: "$84,198.40", size: "0.0412", pnl: null },
  { time: "14:28:05", side: "SELL", price: "$84,310.20", size: "0.0412", pnl: "+$4.61" },
  { time: "14:21:44", side: "BUY",  price: "$83,980.00", size: "0.0580", pnl: null },
  { time: "14:18:12", side: "SELL", price: "$84,120.50", size: "0.0580", pnl: "+$8.14" },
  { time: "14:10:33", side: "BUY",  price: "$84,050.10", size: "0.0300", pnl: null },
  { time: "14:07:01", side: "SELL", price: "$84,280.80", size: "0.0300", pnl: "+$6.92" },
];

export default function BotDetailPage() {
  const [running, setRunning] = useState(true);
  const [logs, setLogs] = useState<{ time: string; type: string; icon: string; msg: string }[]>([
    { time: "14:32:01.000", type: "info",    icon: "◈", msg: "NOVA Alpha bot initialized" },
    { time: "14:32:01.012", type: "info",    icon: "◈", msg: "Connecting to BTC/USDT feed..." },
    { time: "14:32:01.104", type: "success", icon: "✓", msg: "Market data stream connected" },
    { time: "14:32:01.220", type: "info",    icon: "◈", msg: "AI Signal model loaded — v3.2.1" },
    { time: "14:32:01.380", type: "success", icon: "✓", msg: "Bot started — scanning for entry conditions" },
  ]);
  const [pnlData, setPnlData] = useState(genPnl);
  const [totalPnl, setTotalPnl] = useState(1248.80);
  const [runs, setRuns] = useState(84);
  const [trades, setTrades] = useState(312);
  const [winRate] = useState(74.2);
  const [balance] = useState(12480.00);
  const logsRef = useRef<HTMLDivElement>(null);
  const pair = "BTC/USDT";

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const tpl = LOG_TEMPLATES[Math.floor(Math.random() * LOG_TEMPLATES.length)];
      const entry = { time: now(), type: tpl.type, icon: tpl.icon, msg: tpl.msg(pair) };
      setLogs(prev => [...prev.slice(-80), entry]);

      if (tpl.type === "trade" || tpl.type === "success") {
        const delta = (Math.random() * 18 + 2) * (Math.random() > 0.25 ? 1 : -1);
        setTotalPnl(p => +(p + delta).toFixed(2));
        setTrades(t => t + 1);
        if (Math.random() > 0.4) setRuns(r => r + 1);
        setPnlData(prev => {
          const last = prev[prev.length - 1];
          return [...prev.slice(-59), { i: last.i + 1, v: +(last.v + delta).toFixed(2) }];
        });
      }
    }, 1800);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [logs]);

  const pnlUp = totalPnl >= 0;

  return (
    <div style={{ background: G.bg, minHeight: "100vh", color: G.text, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}>

      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", height: "56px", borderBottom: `1px solid ${G.border}`, background: "rgba(7,7,7,0.96)", backdropFilter: "blur(24px)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "28px", height: "28px", background: G.goldDim, border: `1px solid ${G.goldBorder}`, borderRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>⚡</div>
            <span style={{ fontSize: "14px", fontWeight: 800, letterSpacing: "0.12em", color: G.gold }}>NOVA</span>
          </div>
          <span style={{ color: G.muted, fontSize: "14px" }}>/</span>
          <span style={{ fontSize: "13px", color: G.sec }}>Bots</span>
          <span style={{ color: G.muted, fontSize: "14px" }}>/</span>
          <span style={{ fontSize: "13px", color: G.text, fontWeight: 600 }}>NOVA Alpha</span>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button onClick={() => setRunning(r => !r)} style={{ padding: "7px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, border: "none", background: running ? G.redBg : G.greenBg, color: running ? G.redText : G.greenText, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
            {running ? "⏹ Stop Bot" : "▶ Start Bot"}
          </button>
          <button style={{ padding: "7px 16px", borderRadius: "8px", fontSize: "13px", border: `1px solid ${G.border}`, background: "transparent", color: G.sec, cursor: "pointer" }}>Configure</button>
          <button style={{ padding: "7px 16px", borderRadius: "8px", fontSize: "13px", border: `1px solid ${G.border}`, background: "transparent", color: G.sec, cursor: "pointer" }}>← Back to Bots</button>
        </div>
      </nav>

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "24px 32px 60px", display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* Header card */}
        <div style={{ background: G.goldDim, border: `1px solid ${G.goldBorder}`, borderRadius: "16px", padding: "24px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <h1 style={{ fontSize: "26px", fontWeight: 900, letterSpacing: "-0.02em", margin: 0 }}>NOVA Alpha</h1>
              <span style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "5px", background: G.purpleBg, color: G.purple, fontWeight: 700, border: `1px solid rgba(139,92,246,0.25)` }}>AI SIGNAL</span>
            </div>
            <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: G.sec }}>
              <span>Bot ID: nova-alpha-01</span>
              <span>·</span>
              <span>Pair: {pair}</span>
              <span>·</span>
              <span>Strategy: 4H RSI + Sentiment</span>
              <span>·</span>
              <span style={{ color: G.gold }}>Elite Plan</span>
            </div>
          </div>
          {/* Status */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 18px", borderRadius: "10px", background: running ? G.greenBg : G.redBg, border: `1px solid ${running ? G.greenBorder : "rgba(248,113,113,0.2)"}` }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: running ? G.greenText : G.redText, boxShadow: running ? `0 0 6px ${G.greenText}` : "none", display: "inline-block", animation: running ? "pulse 1.4s ease-in-out infinite" : "none" }} />
              <span style={{ fontSize: "13px", fontWeight: 800, color: running ? G.greenText : G.redText }}>{running ? "RUNNING" : "STOPPED"}</span>
            </div>
            <div style={{ fontSize: "11px", color: G.muted }}>Started 14:32:01 UTC · Uptime {Math.floor(runs * 0.4)}m</div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px" }}>
          {[
            { label: "Total P&L", value: `${pnlUp ? "+" : ""}$${totalPnl.toFixed(2)}`, color: pnlUp ? G.greenText : G.redText, sub: "All time" },
            { label: "Total Runs", value: String(runs), color: G.text, sub: "Cycles completed" },
            { label: "Total Trades", value: String(trades), color: G.text, sub: "Executions" },
            { label: "Win Rate", value: `${winRate}%`, color: G.gold, sub: "Last 100 trades" },
            { label: "Balance", value: `$${balance.toLocaleString()}`, color: G.text, sub: "Available USDT" },
          ].map(s => (
            <div key={s.label} style={{ background: G.bg2, border: `1px solid ${G.border}`, borderRadius: "12px", padding: "16px 18px" }}>
              <div style={{ fontSize: "10px", color: G.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>{s.label}</div>
              <div style={{ fontSize: "22px", fontWeight: 900, letterSpacing: "-0.02em", color: s.color, marginBottom: "4px" }}>{s.value}</div>
              <div style={{ fontSize: "10px", color: G.muted }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Chart + Logs row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>

          {/* P&L Chart */}
          <div style={{ background: G.bg2, border: `1px solid ${G.border}`, borderRadius: "14px", overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: `1px solid ${G.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: G.sec, letterSpacing: "0.06em", textTransform: "uppercase" }}>P&L Performance</span>
              <span style={{ fontSize: "12px", color: pnlUp ? G.greenText : G.redText, fontWeight: 700 }}>{pnlUp ? "+" : ""}${totalPnl.toFixed(2)}</span>
            </div>
            <div style={{ padding: "12px 4px" }}>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={pnlData} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
                  <defs>
                    <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={pnlUp ? G.green : G.red} stopOpacity={0.2} />
                      <stop offset="100%" stopColor={pnlUp ? G.green : G.red} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="i" hide />
                  <YAxis hide domain={["auto", "auto"]} />
                  <Tooltip contentStyle={{ background: "#111", border: `1px solid ${G.border}`, borderRadius: "8px", fontSize: "11px", color: "#fff" }} formatter={(v: number) => [`$${v.toFixed(2)}`, "P&L"]} labelFormatter={() => ""} />
                  <Area type="monotone" dataKey="v" stroke={pnlUp ? G.greenText : G.redText} strokeWidth={2} fill="url(#pnlGrad)" dot={false} activeDot={{ r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bot Logs */}
          <div style={{ background: G.bg2, border: `1px solid ${G.border}`, borderRadius: "14px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "14px 18px", borderBottom: `1px solid ${G.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {running && <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: G.greenText, display: "inline-block" }} />}
                <span style={{ fontSize: "12px", fontWeight: 700, color: G.sec, letterSpacing: "0.06em", textTransform: "uppercase" }}>Bot Logs</span>
              </div>
              <span style={{ fontSize: "11px", color: G.muted }}>{logs.length} entries</span>
            </div>
            <div ref={logsRef} style={{ flex: 1, overflowY: "auto", padding: "10px 0", fontFamily: "'SF Mono', 'Fira Code', monospace", maxHeight: "232px" }}>
              {logs.map((log, i) => (
                <div key={i} style={{ display: "flex", gap: "10px", padding: "3px 16px", alignItems: "flex-start", borderLeft: `2px solid ${log.type === "error" ? G.red : log.type === "warn" ? G.gold : log.type === "success" || log.type === "trade" ? G.green : G.border}` }}>
                  <span style={{ fontSize: "10px", color: G.muted, whiteSpace: "nowrap", marginTop: "1px", minWidth: "88px" }}>[{log.time}]</span>
                  <span style={{ fontSize: "10px", color: logColor(log.type), minWidth: "12px" }}>{log.icon}</span>
                  <span style={{ fontSize: "11px", color: logColor(log.type), lineHeight: 1.5 }}>{log.msg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trade history */}
        <div style={{ background: G.bg2, border: `1px solid ${G.border}`, borderRadius: "14px", overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${G.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: G.sec, letterSpacing: "0.06em", textTransform: "uppercase" }}>Trade History</span>
            <button style={{ fontSize: "11px", color: G.gold, background: "transparent", border: "none", cursor: "pointer" }}>View All →</button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
            <thead>
              <tr style={{ background: G.bg3, borderBottom: `1px solid ${G.border}` }}>
                {["Time", "Side", "Price", "Size (BTC)", "P&L", "Status"].map(h => (
                  <th key={h} style={{ padding: "9px 18px", textAlign: "left", color: G.muted, fontWeight: 500, fontSize: "10px", letterSpacing: "0.04em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TRADES_HISTORY.map((t, i) => (
                <tr key={i} style={{ borderBottom: i < TRADES_HISTORY.length - 1 ? `1px solid rgba(255,255,255,0.03)` : "none" }}>
                  <td style={{ padding: "10px 18px", color: G.muted, fontFamily: "monospace" }}>{t.time}</td>
                  <td style={{ padding: "10px 18px" }}>
                    <span style={{ fontSize: "10px", padding: "2px 9px", borderRadius: "4px", background: t.side === "BUY" ? G.greenBg : G.redBg, color: t.side === "BUY" ? G.greenText : G.redText, fontWeight: 800 }}>{t.side}</span>
                  </td>
                  <td style={{ padding: "10px 18px", fontWeight: 600 }}>{t.price}</td>
                  <td style={{ padding: "10px 18px", color: G.sec }}>{t.size}</td>
                  <td style={{ padding: "10px 18px", color: t.pnl ? G.greenText : G.muted, fontWeight: t.pnl ? 700 : 400 }}>{t.pnl ?? "—"}</td>
                  <td style={{ padding: "10px 18px" }}>
                    <span style={{ fontSize: "10px", color: t.pnl ? G.greenText : G.gold }}>{t.pnl ? "Closed" : "Open"}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Config summary */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px" }}>
          {[
            { label: "Strategy", value: "AI Signal — RSI + Sentiment" },
            { label: "Timeframe", value: "4H candles" },
            { label: "Max Position", value: "$2,000 per trade" },
            { label: "Stop Loss", value: "-3.5% trailing" },
            { label: "Take Profit", value: "+8% target" },
            { label: "Max Daily Trades", value: "12 trades" },
            { label: "Execution Speed", value: "< 5ms" },
            { label: "Risk Level", value: "Medium" },
          ].map(c => (
            <div key={c.label} style={{ background: G.bg2, border: `1px solid ${G.border}`, borderRadius: "10px", padding: "12px 14px" }}>
              <div style={{ fontSize: "10px", color: G.muted, marginBottom: "5px", letterSpacing: "0.04em" }}>{c.label}</div>
              <div style={{ fontSize: "13px", fontWeight: 700 }}>{c.value}</div>
            </div>
          ))}
        </div>

      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}