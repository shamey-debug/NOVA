'use client'

import { useRouter } from 'next/navigation'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useState, useEffect, useRef } from 'react'

const G = {
  gold: '#F5C518',
  goldDim: 'rgba(245,197,24,0.10)',
  goldBorder: 'rgba(245,197,24,0.22)',
  bg: '#070707',
  bg2: 'rgba(255,255,255,0.03)',
  border: 'rgba(255,255,255,0.07)',
  muted: '#555',
  sec: '#888',
  text: '#e8e8e8',
  green: '#16a34a',
  greenBg: 'rgba(22,163,74,0.12)',
  greenText: '#4ade80',
  red: '#dc2626',
  redBg: 'rgba(220,38,38,0.12)',
  redText: '#f87171',
}

const genPrices = (base = 84000, n = 40) => {
  let p = base
  return Array.from({ length: n }, (_, i) => {
    p += (Math.random() - 0.44) * 900
    return { i: String(i), price: Math.max(p, base * 0.9) }
  })
}

const TICKERS = [
  { pair: 'BTC/USDT', price: '84,220.14', change: '+2.18%', up: true },
  { pair: 'ETH/USDT', price: '4,182.40', change: '+1.24%', up: true },
  { pair: 'SOL/USDT', price: '192.33', change: '+4.61%', up: true },
  { pair: 'BNB/USDT', price: '711.89', change: '+0.92%', up: true },
  { pair: 'XRP/USDT', price: '0.8420', change: '-0.31%', up: false },
  { pair: 'ADA/USDT', price: '1.2050', change: '+1.87%', up: true },
]

const STATS = [
  { val: '$2.8B+', label: 'Daily Volume' },
  { val: '4.2M+', label: 'Traders' },
  { val: '< 5ms', label: 'Execution' },
  { val: '99.99%', label: 'Uptime' },
]

const FEATURES = [
  { icon: '⚡', title: 'Sub-5ms Execution', desc: 'Institutional-grade order routing across all major liquidity pools.' },
  { icon: '🤖', title: 'AI Trading Bots', desc: 'Set your target profit, activate a bot, and let it trade 24/7 automatically.' },
  { icon: '🔒', title: 'Vault-Grade Security', desc: 'Cold storage custody, 2FA, and real-time fraud detection on every account.' },
  { icon: '📊', title: 'Live Analytics', desc: 'Real-time P&L tracking, portfolio curves, and session history in your dashboard.' },
  { icon: '💸', title: 'Instant Withdrawals', desc: 'Request withdrawals in BTC or USDT. Processed within 24 hours, every time.' },
  { icon: '📱', title: 'Works Everywhere', desc: 'Full functionality on mobile and desktop. Trade from anywhere.' },
]

const STEPS = [
  { n: '01', title: 'Create Account', desc: 'Sign up in under 60 seconds. No KYC required to start.' },
  { n: '02', title: 'Fund Your Wallet', desc: 'Deposit via Bitcoin or USDT TRC20. Minimum $85, $1 fee.' },
  { n: '03', title: 'Activate a Bot', desc: 'Pick a bot, set your profit target and stop loss, click start.' },
  { n: '04', title: 'Collect Profits', desc: 'Watch your P&L grow live. Close and collect when you hit target.' },
]

export default function HomePage() {
  const router = useRouter()
  const [btcData] = useState(() => genPrices(84000))
  const [menuOpen, setMenuOpen] = useState(false)
  const tickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf: number
    let x = 0
    const step = () => {
      x -= 0.5
      if (tickerRef.current) {
        const half = tickerRef.current.scrollWidth / 2
        if (Math.abs(x) >= half) x = 0
        tickerRef.current.style.transform = `translateX(${x}px)`
      }
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [])

  const last = btcData[btcData.length - 1]?.price ?? 84220
  const first = btcData[0]?.price ?? 82000
  const pct = (((last - first) / first) * 100).toFixed(2)
  const up = last >= first

  return (
    <div style={{ background: G.bg, minHeight: '100vh', color: G.text, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif", overflowX: 'hidden' }}>

      {/* Ticker */}
      <div style={{ background: 'rgba(245,197,24,0.04)', borderBottom: `1px solid ${G.border}`, padding: '6px 0', overflow: 'hidden' }}>
        <div ref={tickerRef} style={{ display: 'inline-flex', gap: '48px', whiteSpace: 'nowrap' }}>
          {[...TICKERS, ...TICKERS].map((t, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
              <span style={{ color: G.muted }}>{t.pair}</span>
              <span style={{ fontWeight: 600 }}>${t.price}</span>
              <span style={{ color: t.up ? G.greenText : G.redText, fontSize: '10px', background: t.up ? G.greenBg : G.redBg, padding: '1px 5px', borderRadius: 4 }}>{t.change}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: 56, borderBottom: `1px solid ${G.border}`, position: 'sticky', top: 0, zIndex: 100, background: 'rgba(7,7,7,0.96)', backdropFilter: 'blur(24px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, background: G.goldDim, border: `1px solid ${G.goldBorder}`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>⚡</div>
          <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: '0.14em', color: G.gold }}>NOVA</span>
        </div>
        {/* Desktop nav */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }} className="desktop-nav">
          <button onClick={() => router.push('/login')}
            style={{ padding: '7px 16px', borderRadius: 8, fontSize: 13, border: `1px solid ${G.border}`, background: 'transparent', color: G.sec, cursor: 'pointer' }}>
            Log In
          </button>
          <button onClick={() => router.push('/signup')}
            style={{ padding: '7px 18px', borderRadius: 8, fontSize: 13, fontWeight: 700, border: 'none', background: G.gold, color: '#000', cursor: 'pointer' }}>
            Start Trading →
          </button>
        </div>
        {/* Mobile hamburger */}
        <button onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: 'transparent', border: 'none', color: G.text, fontSize: 22, cursor: 'pointer', padding: 4 }}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ position: 'fixed', top: 56, left: 0, right: 0, bottom: 0, background: G.bg, zIndex: 99, padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button onClick={() => { router.push('/signup'); setMenuOpen(false) }}
            style={{ padding: 16, borderRadius: 10, fontSize: 16, fontWeight: 800, border: 'none', background: G.gold, color: '#000', cursor: 'pointer' }}>
            Create Free Account →
          </button>
          <button onClick={() => { router.push('/login'); setMenuOpen(false) }}
            style={{ padding: 16, borderRadius: 10, fontSize: 16, border: `1px solid ${G.border}`, background: 'transparent', color: G.text, cursor: 'pointer' }}>
            Log In
          </button>
          <button onClick={() => { router.push('/dashboard'); setMenuOpen(false) }}
            style={{ padding: 16, borderRadius: 10, fontSize: 16, border: `1px solid ${G.border}`, background: 'transparent', color: G.text, cursor: 'pointer' }}>
            Dashboard
          </button>
          <div style={{ borderTop: `1px solid ${G.border}`, paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {['Pricing', 'Bots'].map(l => (
              <button key={l} onClick={() => { router.push(`/${l.toLowerCase()}`); setMenuOpen(false) }}
                style={{ padding: '12px 0', background: 'transparent', border: 'none', color: G.sec, fontSize: 15, textAlign: 'left', cursor: 'pointer' }}>
                {l}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hero */}
      <section style={{ padding: '52px 20px 40px', textAlign: 'center', borderBottom: `1px solid ${G.border}` }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', borderRadius: 100, border: `1px solid ${G.goldBorder}`, background: G.goldDim, fontSize: 10, letterSpacing: '0.18em', color: G.gold, textTransform: 'uppercase', marginBottom: 24 }}>
          ⚡ Institutional · Ultra-Fast · Secure
        </div>
        <h1 style={{ fontSize: 'clamp(32px, 8vw, 56px)', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-0.03em', margin: '0 0 16px' }}>
          Trade crypto at<br /><span style={{ color: G.gold }}>lightning speed.</span>
        </h1>
        <p style={{ fontSize: 15, color: G.sec, lineHeight: 1.75, maxWidth: 400, margin: '0 auto 32px' }}>
          AI-powered bots, real-time analytics, and institutional-grade infrastructure — built for traders who demand results.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
          <button onClick={() => router.push('/signup')}
            style={{ padding: '14px 28px', borderRadius: 10, fontSize: 15, fontWeight: 800, border: 'none', background: G.gold, color: '#000', cursor: 'pointer' }}>
            Open Platform →
          </button>
          <button onClick={() => router.push('/bots')}
            style={{ padding: '14px 24px', borderRadius: 10, fontSize: 15, border: `1px solid ${G.border}`, background: 'transparent', color: G.text, cursor: 'pointer' }}>
            View Bots
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, maxWidth: 400, margin: '0 auto 40px' }}>
          {STATS.map(s => (
            <div key={s.label} style={{ background: G.bg2, border: `1px solid ${G.border}`, borderRadius: 12, padding: '16px 12px' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: G.gold }}>{s.val}</div>
              <div style={{ fontSize: 10, color: G.muted, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* BTC Chart card */}
        <div style={{ background: G.bg2, border: `1px solid ${G.border}`, borderRadius: 16, overflow: 'hidden', maxWidth: 480, margin: '0 auto' }}>
          <div style={{ padding: '16px 18px 12px', borderBottom: `1px solid ${G.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 10, color: G.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>BTC / USDT</div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>${last.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
              <div style={{ fontSize: 11, color: up ? G.greenText : G.redText, fontWeight: 600, marginTop: 2 }}>{up ? '▲' : '▼'} {Math.abs(Number(pct))}% (24H)</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: G.muted, marginBottom: 4 }}>24H Vol</div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>$2.84B</div>
            </div>
          </div>
          <div style={{ padding: '8px 4px' }}>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={btcData} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
                <defs>
                  <linearGradient id="gGold" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={G.gold} stopOpacity={0.22} />
                    <stop offset="100%" stopColor={G.gold} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="i" hide />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ background: '#111', border: `1px solid ${G.border}`, borderRadius: 8, fontSize: 11, color: '#fff' }} formatter={(v: number) => [`$${Math.round(v).toLocaleString()}`, 'Price']} labelFormatter={() => ''} />
                <Area type="monotone" dataKey="price" stroke={G.gold} strokeWidth={2} fill="url(#gGold)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '52px 20px', borderBottom: `1px solid ${G.border}` }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 10, color: G.gold, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 10 }}>How It Works</div>
          <h2 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.02em', margin: 0 }}>From signup to profit in 4 steps.</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 480, margin: '0 auto' }}>
          {STEPS.map((s, i) => (
            <div key={s.n} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', background: G.bg2, border: `1px solid ${G.border}`, borderRadius: 14, padding: '18px 20px' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: G.goldDim, border: `1px solid ${G.goldBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: G.gold, flexShrink: 0 }}>{s.n}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: G.muted, lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <button onClick={() => router.push('/signup')}
            style={{ padding: '14px 32px', borderRadius: 10, fontSize: 15, fontWeight: 800, border: 'none', background: G.gold, color: '#000', cursor: 'pointer' }}>
            Get Started Now →
          </button>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '52px 20px', borderBottom: `1px solid ${G.border}` }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 10, color: G.gold, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 10 }}>Platform Edge</div>
          <h2 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.02em', margin: 0 }}>Built for performance.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, maxWidth: 960, margin: '0 auto' }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{ background: G.bg2, border: `1px solid ${G.border}`, borderRadius: 14, padding: '20px 18px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: G.goldDim, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{f.icon}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{f.title}</div>
                <div style={{ fontSize: 12, color: G.muted, lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '52px 20px 72px' }}>
        <div style={{ background: 'rgba(245,197,24,0.05)', border: `1px solid ${G.goldBorder}`, borderRadius: 20, padding: '48px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden', maxWidth: 560, margin: '0 auto' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(circle, rgba(245,197,24,0.12) 1px, transparent 1px)`, backgroundSize: '24px 24px', opacity: 0.4 }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.02em', margin: '0 0 12px' }}>Ready to trade smarter?</h2>
            <p style={{ fontSize: 14, color: G.sec, margin: '0 auto 28px', lineHeight: 1.7, maxWidth: 340 }}>
              Join thousands of traders. No setup fees, instant access, minimum $85 to start.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={() => router.push('/signup')}
                style={{ padding: '15px 28px', borderRadius: 10, fontSize: 15, fontWeight: 800, border: 'none', background: G.gold, color: '#000', cursor: 'pointer' }}>
                Create Free Account →
              </button>
              <button onClick={() => router.push('/login')}
                style={{ padding: '13px 28px', borderRadius: 10, fontSize: 14, border: `1px solid ${G.border}`, background: 'transparent', color: G.sec, cursor: 'pointer' }}>
                Already have an account? Log in
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${G.border}`, padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <span style={{ fontSize: 12, color: G.muted }}>⚡ NOVA · AI Trading Platform</span>
        <div style={{ display: 'flex', gap: 16 }}>
          {[['Pricing', '/pricing'], ['Bots', '/bots'], ['Sign Up', '/signup'], ['Log In', '/login']].map(([l, h]) => (
            <button key={l} onClick={() => router.push(h)}
              style={{ background: 'transparent', border: 'none', color: G.muted, fontSize: 12, cursor: 'pointer' }}>{l}</button>
          ))}
        </div>
      </div>

    </div>
  )
}