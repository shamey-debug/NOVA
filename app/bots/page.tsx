"use client";

import { useState } from "react";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";

const G = {
  gold: "#F5C518",
  goldDim: "rgba(245,197,24,0.10)",
  goldBorder: "rgba(245,197,24,0.22)",
  goldText: "#F5C518",
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
  purple: "#8b5cf6",
  purpleBg: "rgba(139,92,246,0.10)",
  purpleBorder: "rgba(139,92,246,0.25)",
};

const gen = (n = 30, up = true) => {
  const out = [];
  let v = 100;
  for (let i = 0; i < n; i++) {
    v += (Math.random() - (up ? 0.38 : 0.62)) * 4;
    out.push({ i, v: Math.max(v, 60) });
  }
  return out;
};

const BOTS = [
  {
    name: "KoolCrypto Alpha",
    tag: "AI Signal",
    desc: "GPT-powered market sentiment + on-chain signal bot. Trades BTC/ETH on 4H timeframes.",
    pair: "BTC/USDT",
    roi: "+84.2%",
    monthly: "+12.4%",
    winRate: "74%",
    trades: 1284,
    drawdown: "-8.1%",
    risk: "Medium",
    active: true,
    tier: "elite",
    color: G.purple,
    colorBg: G.purpleBg,
    colorBorder: G.purpleBorder,
    data: gen(30, true),
  },
  {
    name: "Grid Master Pro",
    tag: "Grid",
    desc: "Auto-adjusting grid strategy across volatility ranges. Profits on sideways & trending markets.",
    pair: "ETH/USDT",
    roi: "+61.8%",
    monthly: "+8.9%",
    winRate: "81%",
    trades: 9422,
    drawdown: "-5.2%",
    risk: "Low",
    active: true,
    tier: "pro",
    color: G.gold,
    colorBg: G.goldDim,
    colorBorder: G.goldBorder,
    data: gen(30, true),
  },
  {
    name: "DCA Accumulator",
    tag: "DCA",
    desc: "Dollar-cost averaging into BTC on RSI dips. Set-and-forget long-term accumulation.",
    pair: "BTC/USDT",
    roi: "+44.1%",
    monthly: "+5.2%",
    winRate: "68%",
    trades: 312,
    drawdown: "-12.4%",
    risk: "Low",
    active: true,
    tier: "starter",
    color: G.green,
    colorBg: G.greenBg,
    colorBorder: "rgba(22,163,74,0.25)",
    data: gen(30, true),
  },
  {
    name: "Momentum Scalper",
    tag: "Scalping",
    desc: "High-frequency momentum bot. 15m candles, tight stops, rides breakouts on SOL/BNB.",
    pair: "SOL/USDT",
    roi: "+102.4%",
    monthly: "+18.1%",
    winRate: "61%",
    trades: 24810,
    drawdown: "-19.2%",
    risk: "High",
    active: false,
    tier: "elite",
    color: G.purple,
    colorBg: G.purpleBg,
    colorBorder: G.purpleBorder,
    data: gen(30, true),
  },
  {
    name: "Arbitrage Hunter",
    tag: "Arbitrage",
    desc: "Cross-exchange price discrepancy scanner. Executes in <5ms when spread threshold hit.",
    pair: "Multi",
    roi: "+38.9%",
    monthly: "+4.8%",
    winRate: "91%",
    trades: 58204,
    drawdown: "-2.1%",
    risk: "Low",
    active: false,
    tier: "elite",
    color: G.purple,
    colorBg: G.purpleBg,
    colorBorder: G.purpleBorder,
    data: gen(30, true),
  },
  {
    name: "ETH Trend Rider",
    tag: "Trend",
    desc: "Follows macro ETH trend using EMA crossovers and volume confirmation. Daily timeframe.",
    pair: "ETH/USDT",
    roi: "+52.3%",
    monthly: "+7.1%",
    winRate: "71%",
    trades: 188,
    drawdown: "-14.8%",
    risk: "Medium",
    active: false,
    tier: "pro",
    color: G.gold,
    colorBg: G.goldDim,
    colorBorder: G.goldBorder,
    data: gen(30, true),
  },
];

const PLANS = [
  {
    name: "Starter",
    price: "$29",
    period: "/mo",
    desc: "Perfect for beginners automating their first strategy.",
    features: ["1 active bot", "DCA strategy only", "Daily execution", "Email alerts", "Basic analytics"],
    locked: ["AI signal bots", "Grid & scalping", "Priority execution", "API access"],
    cta: "Start Free Trial",
    highlight: false,
    tier: "starter",
  },
  {
    name: "Pro",
    price: "$79",
    period: "/mo",
    desc: "For active traders running multiple strategies.",
    features: ["5 active bots", "DCA + Grid + Trend", "15m execution", "Telegram alerts", "Advanced analytics", "Backtesting (1Y data)"],
    locked: ["AI signal bots", "Arbitrage bots", "Sub-second execution"],
    cta: "Upgrade to Pro",
    highlight: true,
    tier: "pro",
  },
  {
    name: "Elite",
    price: "$199",
    period: "/mo",
    desc: "Institutional-grade automation for serious traders.",
    features: ["Unlimited bots", "All strategies incl. AI & Arbitrage", "<5ms execution", "All alert channels", "Full analytics suite", "Backtesting (5Y data)", "API access", "Dedicated support"],
    locked: [],
    cta: "Go Elite",
    highlight: false,
    tier: "elite",
  },
];

const LEADERBOARD = [
  { rank: 1, name: "KoolCrypto Alpha", roi: "+84.2%", users: "4,821", type: "AI Signal" },
  { rank: 2, name: "Momentum Scalper", roi: "+102.4%", users: "2,140", type: "Scalping" },
  { rank: 3, name: "Grid Master Pro", roi: "+61.8%", users: "8,322", type: "Grid" },
  { rank: 4, name: "Arbitrage Hunter", roi: "+38.9%", users: "1,204", type: "Arbitrage" },
  { rank: 5, name: "ETH Trend Rider", roi: "+52.3%", users: "3,881", type: "Trend" },
];

const riskColor = (r: string) =>
  r === "Low" ? G.greenText : r === "Medium" ? G.gold : G.redText;

const riskBg = (r: string) =>
  r === "Low" ? G.greenBg : r === "Medium" ? G.goldDim : G.redBg;

export default function BotsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "active" | "mine">("all");
  const [userPlan] = useState<"free" | "starter" | "pro" | "elite">("free");

  const canRun = (tier: string) => {
    if (userPlan === "elite") return true;
    if (userPlan === "pro") return tier !== "elite";
    if (userPlan === "starter") return tier === "starter";
    return false;
  };

  const filtered = BOTS.filter(b =>
    activeTab === "active" ? b.active : activeTab === "mine" ? false : true
  );

  return (
    <div style={{ background: G.bg, minHeight: "100vh", color: G.text, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}>

      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px", height: "60px", borderBottom: `1px solid ${G.border}`, position: "sticky", top: 0, zIndex: 100, background: "rgba(7,7,7,0.95)", backdropFilter: "blur(24px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "34px", height: "34px", background: G.goldDim, border: `1px solid ${G.goldBorder}`, borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>⚡</div>
          <div>
            <div style={{ fontSize: "16px", fontWeight: 800, letterSpacing: "0.16em", color: G.gold }}>KoolCrypto</div>
            <div style={{ fontSize: "9px", letterSpacing: "0.22em", color: G.muted, textTransform: "uppercase" }}>AI Bots</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "2px" }}>
          {["Dashboard", "Markets", "Trade", "Bots", "Pricing"].map((l, i) => (
            <button key={l} style={{ padding: "6px 14px", borderRadius: "7px", fontSize: "13px", color: i === 3 ? G.gold : G.sec, background: i === 3 ? G.goldDim : "transparent", border: "none", cursor: "pointer" }}>{l}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <div style={{ padding: "5px 12px", borderRadius: "6px", background: G.purpleBg, border: `1px solid ${G.purpleBorder}`, fontSize: "11px", color: G.purple, fontWeight: 700 }}>FREE PLAN</div>
          <button style={{ padding: "7px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, border: "none", background: G.gold, color: "#000", cursor: "pointer" }}>Upgrade →</button>
        </div>
      </nav>

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 40px 80px" }}>

        {/* Hero banner */}
        <div style={{ margin: "40px 0 36px", background: G.goldDim, border: `1px solid ${G.goldBorder}`, borderRadius: "20px", padding: "40px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle, rgba(245,197,24,0.12) 1px, transparent 1px)`, backgroundSize: "24px 24px", opacity: 0.5 }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: "11px", color: G.gold, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "12px" }}>🤖 Automated Trading</div>
            <h1 style={{ fontSize: "36px", fontWeight: 900, letterSpacing: "-0.03em", margin: "0 0 10px" }}>Let AI trade while you sleep.</h1>
            <p style={{ fontSize: "14px", color: G.sec, margin: "0 0 28px", maxWidth: "480px", lineHeight: 1.65 }}>Deploy battle-tested AI strategies in one click. Our bots run 24/7, execute in under 5ms, and have generated over $48M in profit for KoolCrypto traders.</p>
            <div style={{ display: "flex", gap: "32px" }}>
              {[["$48M+", "Profit generated"], ["12,400+", "Active bots"], ["+84.2%", "Top bot ROI (12M)"], ["91%", "Best win rate"]].map(([v, l]) => (
                <div key={l}>
                  <div style={{ fontSize: "22px", fontWeight: 800, color: G.gold }}>{v}</div>
                  <div style={{ fontSize: "11px", color: G.muted, marginTop: "2px" }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", position: "relative", zIndex: 1 }}>
            <button style={{ padding: "13px 28px", borderRadius: "10px", fontSize: "14px", fontWeight: 800, border: "none", background: G.gold, color: "#000", cursor: "pointer" }}>Create New Bot →</button>
            <button style={{ padding: "13px 24px", borderRadius: "10px", fontSize: "14px", border: `1px solid ${G.border}`, background: "transparent", color: G.text, cursor: "pointer" }}>View Leaderboard</button>
          </div>
        </div>

        {/* Tabs + filters */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ display: "flex", gap: "2px", background: G.bg2, border: `1px solid ${G.border}`, borderRadius: "9px", padding: "3px" }}>
            {(["all", "active", "mine"] as const).map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{ padding: "6px 18px", borderRadius: "7px", fontSize: "12px", cursor: "pointer", border: "none", background: activeTab === t ? G.bg3 : "transparent", color: activeTab === t ? G.text : G.sec, fontWeight: activeTab === t ? 700 : 400, textTransform: "capitalize" }}>
                {t === "all" ? "All Bots" : t === "active" ? "Running" : "My Bots"}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {["All Risk", "All Strategies"].map(f => (
              <select key={f} style={{ padding: "6px 12px", borderRadius: "7px", background: G.bg2, border: `1px solid ${G.border}`, color: G.sec, fontSize: "12px", cursor: "pointer" }}>
                <option>{f}</option>
              </select>
            ))}
          </div>
        </div>

        {/* Bot cards grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginBottom: "60px" }}>
          {filtered.map(bot => {
            const locked = !canRun(bot.tier);
            return (
              <div key={bot.name} style={{ background: G.bg2, border: `1px solid ${locked ? G.border : bot.colorBorder}`, borderRadius: "16px", overflow: "hidden", opacity: locked ? 0.75 : 1, position: "relative" }}>
                {locked && (
                  <div style={{ position: "absolute", top: "12px", right: "12px", zIndex: 2, background: "rgba(0,0,0,0.85)", border: `1px solid ${G.border}`, borderRadius: "6px", padding: "3px 10px", fontSize: "10px", color: G.muted, letterSpacing: "0.06em" }}>
                    🔒 {bot.tier.toUpperCase()}
                  </div>
                )}
                <div style={{ padding: "18px 18px 12px", borderBottom: `1px solid ${G.border}` }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "8px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <span style={{ fontSize: "15px", fontWeight: 800 }}>{bot.name}</span>
                        {bot.active && <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: G.green, display: "inline-block" }} />}
                      </div>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "4px", background: bot.colorBg, color: bot.color, fontWeight: 700, border: `1px solid ${bot.colorBorder}` }}>{bot.tag}</span>
                        <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "4px", background: riskBg(bot.risk), color: riskColor(bot.risk), fontWeight: 600 }}>{bot.risk} Risk</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "22px", fontWeight: 900, color: G.greenText, letterSpacing: "-0.02em" }}>{bot.roi}</div>
                      <div style={{ fontSize: "10px", color: G.muted }}>12M ROI</div>
                    </div>
                  </div>
                  <p style={{ fontSize: "12px", color: G.sec, lineHeight: 1.55, margin: 0 }}>{bot.desc}</p>
                </div>

                <div style={{ padding: "8px 0", background: "rgba(0,0,0,0.2)" }}>
                  <ResponsiveContainer width="100%" height={56}>
                    <AreaChart data={bot.data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                      <defs>
                        <linearGradient id={`g-${bot.name}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={bot.color} stopOpacity={0.2} />
                          <stop offset="100%" stopColor={bot.color} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="v" stroke={bot.color} strokeWidth={1.5} fill={`url(#g-${bot.name})`} dot={false} />
                      <Tooltip contentStyle={{ display: "none" }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1px", background: G.border, borderTop: `1px solid ${G.border}`, borderBottom: `1px solid ${G.border}` }}>
                  {[["Win Rate", bot.winRate], ["Monthly", bot.monthly], ["Trades", bot.trades.toLocaleString()], ["Drawdown", bot.drawdown]].map(([l, v]) => (
                    <div key={String(l)} style={{ background: G.bg, padding: "8px 10px" }}>
                      <div style={{ fontSize: "9px", color: G.muted, marginBottom: "3px", letterSpacing: "0.04em", textTransform: "uppercase" }}>{l}</div>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: String(l) === "Drawdown" ? G.redText : G.text }}>{v}</div>
                    </div>
                  ))}
                </div>

                <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "11px", color: G.muted }}>{bot.pair}</span>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button style={{ padding: "6px 14px", borderRadius: "7px", fontSize: "12px", border: `1px solid ${G.border}`, background: "transparent", color: G.sec, cursor: "pointer" }}>Details</button>
                    {locked ? (
                      <button style={{ padding: "6px 14px", borderRadius: "7px", fontSize: "12px", fontWeight: 700, border: `1px solid ${G.goldBorder}`, background: G.goldDim, color: G.gold, cursor: "pointer" }}>Unlock →</button>
                    ) : (
                      <button style={{ padding: "6px 14px", borderRadius: "7px", fontSize: "12px", fontWeight: 700, border: "none", background: bot.active ? G.redBg : G.greenBg, color: bot.active ? G.redText : G.greenText, cursor: "pointer" }}>{bot.active ? "Stop" : "Start"}</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Leaderboard */}
        <div style={{ marginBottom: "60px" }}>
          <div style={{ fontSize: "10.5px", color: G.gold, letterSpacing: "0.24em", textTransform: "uppercase", marginBottom: "10px" }}>Performance</div>
          <h2 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 20px" }}>Bot leaderboard (12 months)</h2>
          <div style={{ background: G.bg2, border: `1px solid ${G.border}`, borderRadius: "14px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${G.border}`, background: G.bg3 }}>
                  {["Rank", "Bot Name", "Strategy", "12M ROI", "Active Users", ""].map(h => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: G.muted, fontWeight: 500, fontSize: "11px", letterSpacing: "0.04em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {LEADERBOARD.map((b, i) => (
                  <tr key={b.rank} style={{ borderBottom: i < LEADERBOARD.length - 1 ? `1px solid ${G.border}` : "none" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ width: "24px", height: "24px", borderRadius: "50%", background: b.rank === 1 ? G.goldDim : G.bg3, border: `1px solid ${b.rank === 1 ? G.goldBorder : G.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 800, color: b.rank === 1 ? G.gold : G.sec }}>{b.rank}</span>
                    </td>
                    <td style={{ padding: "12px 16px", fontWeight: 700 }}>{b.name}</td>
                    <td style={{ padding: "12px 16px", color: G.sec }}>{b.type}</td>
                    <td style={{ padding: "12px 16px", color: G.greenText, fontWeight: 800, fontSize: "14px" }}>{b.roi}</td>
                    <td style={{ padding: "12px 16px", color: G.sec }}>{b.users}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <button style={{ padding: "5px 14px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, border: `1px solid ${G.goldBorder}`, background: G.goldDim, color: G.gold, cursor: "pointer" }}>Deploy</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pricing */}
        <div style={{ marginBottom: "60px" }}>
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <div style={{ fontSize: "10.5px", color: G.gold, letterSpacing: "0.24em", textTransform: "uppercase", marginBottom: "10px" }}>Pricing</div>
            <h2 style={{ fontSize: "32px", fontWeight: 900, letterSpacing: "-0.03em", margin: "0 0 10px" }}>Pick your edge</h2>
            <p style={{ fontSize: "14px", color: G.sec }}>Cancel anytime. 14-day free trial on all plans.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            {PLANS.map(plan => (
              <div key={plan.name} style={{ background: plan.highlight ? "rgba(245,197,24,0.06)" : G.bg2, border: `2px solid ${plan.highlight ? G.gold : G.border}`, borderRadius: "18px", padding: "28px 24px", position: "relative" }}>
                {plan.highlight && (
                  <div style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", background: G.gold, color: "#000", fontSize: "10px", fontWeight: 800, padding: "3px 14px", borderRadius: "100px", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>MOST POPULAR</div>
                )}
                <div style={{ fontSize: "12px", color: G.sec, marginBottom: "6px", letterSpacing: "0.06em", textTransform: "uppercase" }}>{plan.name}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "8px" }}>
                  <span style={{ fontSize: "36px", fontWeight: 900, letterSpacing: "-0.03em", color: plan.highlight ? G.gold : G.text }}>{plan.price}</span>
                  <span style={{ fontSize: "14px", color: G.muted }}>{plan.period}</span>
                </div>
                <p style={{ fontSize: "12px", color: G.sec, lineHeight: 1.6, margin: "0 0 20px" }}>{plan.desc}</p>
                <button style={{ width: "100%", padding: "11px", borderRadius: "9px", fontSize: "13px", fontWeight: 800, border: plan.highlight ? "none" : `1px solid ${G.border}`, background: plan.highlight ? G.gold : G.bg3, color: plan.highlight ? "#000" : G.text, cursor: "pointer", marginBottom: "20px", letterSpacing: "0.03em" }}>
                  {plan.cta}
                </button>
                <div style={{ borderTop: `1px solid ${G.border}`, paddingTop: "16px" }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginBottom: "8px" }}>
                      <span style={{ color: G.greenText, fontSize: "12px", marginTop: "1px", flexShrink: 0 }}>✓</span>
                      <span style={{ fontSize: "12px", color: G.text }}>{f}</span>
                    </div>
                  ))}
                  {plan.locked.map(f => (
                    <div key={f} style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginBottom: "8px" }}>
                      <span style={{ color: G.muted, fontSize: "12px", marginTop: "1px", flexShrink: 0 }}>✗</span>
                      <span style={{ fontSize: "12px", color: G.muted }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}