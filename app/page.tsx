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

// ── NEW: Live cashout notifications ─────────────────────────
const CASHOUTS = [
  { name: 'Alex R.', amount: '$1,240', time: '1m ago', flag: '🇺🇸' },
  { name: 'Yuki T.', amount: '$880', time: '2m ago', flag: '🇯🇵' },
  { name: 'Marco V.', amount: '$3,200', time: '4m ago', flag: '🇮🇹' },
  { name: 'Sarah L.', amount: '$560', time: '5m ago', flag: '🇬🇧' },
  { name: 'Omar A.', amount: '$2,400', time: '7m ago', flag: '🇦🇪' },
  { name: 'Chen W.', amount: '$740', time: '8m ago', flag: '🇨🇳' },
  { name: 'Lucas M.', amount: '$1,900', time: '10m ago', flag: '🇩🇪' },
  { name: 'Priya K.', amount: '$420', time: '12m ago', flag: '🇸🇬' },
  { name: 'Jake H.', amount: '$5,000', time: '13m ago', flag: '🇦🇺' },
  { name: 'Nina P.', amount: '$680', time: '15m ago', flag: '🇫🇷' },
  { name: 'Ravi S.', amount: '$1,100', time: '17m ago', flag: '🇮🇳' },
  { name: 'Ethan C.', amount: '$970', time: '18m ago', flag: '🇨🇦' },
  { name: 'Hana M.', amount: '$2,750', time: '20m ago', flag: '🇦🇪' },
  { name: 'Tom B.', amount: '$390', time: '21m ago', flag: '🇳🇱' },
  { name: 'Mei L.', amount: '$1,640', time: '23m ago', flag: '🇰🇷' },
  { name: 'Carlos D.', amount: '$820', time: '25m ago', flag: '🇪🇸' },
  { name: 'Lena W.', amount: '$1,380', time: '27m ago', flag: '🇸🇪' },
  { name: 'Zaid K.', amount: '$3,600', time: '29m ago', flag: '🇸🇦' },
  { name: 'Ryan O.', amount: '$510', time: '31m ago', flag: '🇺🇸' },
  { name: 'Anya V.', amount: '$2,200', time: '33m ago', flag: '🇷🇺' },
]

// ── NEW: Testimonials ────────────────────────────────────────
const TESTIMONIALS = [
  {
    name: 'Alex Reynolds',
    handle: '@alexr_trades',
    flag: '🇺🇸',
    avatar: 'AR',
    text: 'Started with $300. Bot hit my target three times in two weeks. Withdrew $1,240 clean. The automation is exactly what I needed — no babysitting required.',
    profit: '+$1,240',
    days: '14 days',
  },
  {
    name: 'Marco Vitali',
    handle: '@marco_fx',
    flag: '🇮🇹',
    avatar: 'MV',
    text: 'I\'ve tried four other platforms. archespeak is the only one where the bot actually executes fast enough to matter. Up €2,900 in six weeks and counting.',
    profit: '+$3,200',
    days: '42 days',
  },
  {
    name: 'Yuki Tanaka',
    handle: '@yukitrades',
    flag: '🇯🇵',
    avatar: 'YT',
    text: 'The dashboard is clean and the live P&L chart keeps me confident. Activated the bot before a meeting, came back to a green session. Simple and effective.',
    profit: '+$880',
    days: '10 days',
  },
  {
    name: 'Omar Al-Rashid',
    handle: '@omar_invest',
    flag: '🇦🇪',
    avatar: 'OA',
    text: 'Running $1,000 sessions consistently now. Withdrawals are always processed same day. archespeak fits perfectly into my portfolio strategy alongside equities.',
    profit: '+$2,400',
    days: '30 days',
  },
  {
    name: 'Sarah Lowe',
    handle: '@sarahlowe_fx',
    flag: '🇬🇧',
    avatar: 'SL',
    text: 'Was skeptical about bot trading but the risk controls convinced me — stop loss, target profit, full transparency. Made back my deposit in week one.',
    profit: '+$560',
    days: '8 days',
  },
  {
    name: 'Lena Westerberg',
    handle: '@lenaw',
    flag: '🇸🇪',
    avatar: 'LW',
    text: 'Absolutely love the mobile experience. I manage everything from my phone. Clean UI, fast execution, and real support when I had onboarding questions.',
    profit: '+$1,380',
    days: '21 days',
  },
  {
    name: 'Chen Wei',
    handle: '@chenw_crypto',
    flag: '🇨🇳',
    avatar: 'CW',
    text: 'Platform speed is unreal. Orders fill in milliseconds. I run 3 sessions a month and the returns have been consistent. Highly recommend to serious traders.',
    profit: '+$740',
    days: '18 days',
  },
  {
    name: 'Jake Harrington',
    handle: '@jakeh_au',
    flag: '🇦🇺',
    avatar: 'JH',
    text: 'Best $85 I ever spent to test a platform. Hit $400 target in 9 days, reinvested, and I\'m now at $5k profit for the quarter. This thing actually works.',
    profit: '+$5,000',
    days: '90 days',
  },
  {
    name: 'Hana Mansouri',
    handle: '@hanam_uae',
    flag: '🇦🇪',
    avatar: 'HM',
    text: 'Security was my biggest concern and archespeak addressed it fully — 2FA, non-custodial, instant withdrawals. Made $2,750 last month with zero stress.',
    profit: '+$2,750',
    days: '35 days',
  },
  {
    name: 'Lucas Müller',
    handle: '@lucasm_de',
    flag: '🇩🇪',
    avatar: 'LM',
    text: 'Engineering background here — I audited the platform before depositing. Solid architecture, transparent fees, and the bot performance data checks out.',
    profit: '+$1,900',
    days: '28 days',
  },
]

// ── Component: Cashout Banner ────────────────────────────────
function CashoutBanner() {
  const bannerRef = useRef<HTMLDivElement>(null)
  const [toastIdx, setToastIdx] = useState(0)
  const [toastVisible, setToastVisible] = useState(false)

  // Scrolling cashout strip
  useEffect(() => {
    let raf: number
    let x = 0
    const step = () => {
      x -= 0.6
      if (bannerRef.current) {
        const half = bannerRef.current.scrollWidth / 2
        if (Math.abs(x) >= half) x = 0
        bannerRef.current.style.transform = `translateX(${x}px)`
      }
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [])

  // Pop-up toast notifications
  useEffect(() => {
    let idx = 0
    const cycle = () => {
      idx = (idx + 1) % CASHOUTS.length
      setToastIdx(idx)
      setToastVisible(true)
      setTimeout(() => setToastVisible(false), 3200)
    }
    const interval = setInterval(cycle, 5000)
    // First one after 2s
    const first = setTimeout(cycle, 2000)
    return () => { clearInterval(interval); clearTimeout(first) }
  }, [])

  const toast = CASHOUTS[toastIdx]

  return (
    <>
      {/* Scrolling strip */}
      <div style={{
        background: 'rgba(34,197,94,0.06)',
        borderBottom: '1px solid rgba(34,197,94,0.12)',
        padding: '8px 0',
        overflow: 'hidden',
      }}>
        <div ref={bannerRef} style={{ display: 'inline-flex', gap: '40px', whiteSpace: 'nowrap' }}>
          {[...CASHOUTS, ...CASHOUTS].map((c, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', fontSize: '11px' }}>
              <span style={{ fontSize: 14 }}>{c.flag}</span>
              <span style={{ color: '#888' }}>{c.name}</span>
              <span style={{
                color: '#4ade80', fontWeight: 700, background: 'rgba(34,197,94,0.12)',
                padding: '2px 8px', borderRadius: 20, fontSize: '11px',
              }}>💸 cashed out {c.amount}</span>
              <span style={{ color: '#444', fontSize: 10 }}>{c.time}</span>
              <span style={{ color: '#222', marginLeft: 8 }}>·</span>
            </span>
          ))}
        </div>
      </div>

      {/* Floating toast */}
      <div style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: `translateX(-50%) translateY(${toastVisible ? '0' : '80px'})`,
        opacity: toastVisible ? 1 : 0,
        transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        zIndex: 200,
        pointerEvents: 'none',
        width: 'calc(100% - 32px)',
        maxWidth: 360,
      }}>
        <div style={{
          background: 'rgba(10,10,10,0.95)',
          border: '1px solid rgba(34,197,94,0.3)',
          borderRadius: 14,
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(34,197,94,0.1)',
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            background: 'rgba(34,197,94,0.15)',
            border: '1px solid rgba(34,197,94,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, flexShrink: 0,
          }}>
            {toast.flag}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 2 }}>Live withdrawal</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#e8e8e8' }}>
              {toast.name} just cashed out{' '}
              <span style={{ color: '#4ade80' }}>{toast.amount}</span>
            </div>
          </div>
          <div style={{
            width: 8, height: 8, borderRadius: '50%', background: '#4ade80',
            flexShrink: 0, animation: 'archespeakPulse 1.5s infinite',
          }} />
        </div>
      </div>
    </>
  )
}

// ── Component: Testimonials ──────────────────────────────────
function Testimonials() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIdx, setActiveIdx] = useState(0)

  // Auto-scroll on mobile
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const handleScroll = () => {
      const idx = Math.round(el.scrollLeft / (el.offsetWidth * 0.82 + 12))
      setActiveIdx(Math.min(idx, TESTIMONIALS.length - 1))
    }
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section style={{
      padding: '52px 0',
      borderBottom: `1px solid ${G.border}`,
      overflow: 'hidden',
    }}>
      <div style={{ textAlign: 'center', marginBottom: 32, padding: '0 20px' }}>
        <div style={{ fontSize: 10, color: G.gold, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 10 }}>
          Verified Traders
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.02em', margin: '0 0 10px' }}>
          Real people. Real profits.
        </h2>
        <p style={{ fontSize: 13, color: G.sec, maxWidth: 360, margin: '0 auto' }}>
          Join thousands of traders already cashing out with archespeak bots.
        </p>
      </div>

      {/* Scrollable cards */}
      <div ref={scrollRef} style={{
        display: 'flex',
        gap: 12,
        overflowX: 'auto',
        scrollSnapType: 'x mandatory',
        scrollBehavior: 'smooth',
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: 8,
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch',
      } as React.CSSProperties}>
        {TESTIMONIALS.map((t, i) => (
          <div key={t.name} style={{
            background: 'linear-gradient(135deg, rgba(245,197,24,0.04) 0%, rgba(255,255,255,0.02) 100%)',
            border: `1px solid ${G.goldBorder}`,
            borderRadius: 18,
            padding: '22px 20px',
            minWidth: 'min(82vw, 300px)',
            maxWidth: 300,
            flexShrink: 0,
            scrollSnapAlign: 'start',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Quote mark */}
            <div style={{
              position: 'absolute', top: 14, right: 18,
              fontSize: 48, color: 'rgba(245,197,24,0.07)',
              fontFamily: 'Georgia, serif', lineHeight: 1, userSelect: 'none',
            }}>"</div>

            {/* Profit badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: G.greenBg, border: '1px solid rgba(34,197,94,0.2)',
              borderRadius: 20, padding: '4px 12px', width: 'fit-content',
            }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: G.greenText }}>{t.profit}</span>
              <span style={{ fontSize: 10, color: '#444' }}>in</span>
              <span style={{ fontSize: 11, color: '#666' }}>{t.days}</span>
            </div>

            {/* Text */}
            <p style={{
              fontSize: 13, color: '#aaa', lineHeight: 1.7,
              margin: 0, flex: 1,
            }}>
              "{t.text}"
            </p>

            {/* User */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderTop: `1px solid ${G.border}`, paddingTop: 14 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: G.goldDim,
                border: `1px solid ${G.goldBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 800, color: G.gold, flexShrink: 0,
              }}>{t.avatar}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: G.text }}>
                  {t.flag} {t.name}
                </div>
                <div style={{ fontSize: 11, color: G.muted }}>{t.handle}</div>
              </div>
              <div style={{ marginLeft: 'auto', fontSize: 10, color: G.gold }}>✓ verified</div>
            </div>
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16 }}>
        {TESTIMONIALS.map((_, i) => (
          <div key={i} onClick={() => {
            if (!scrollRef.current) return
            const cardW = Math.min(window.innerWidth * 0.82, 300) + 12
            scrollRef.current.scrollTo({ left: i * cardW, behavior: 'smooth' })
          }} style={{
            width: i === activeIdx ? 18 : 6,
            height: 6, borderRadius: 3,
            background: i === activeIdx ? G.gold : 'rgba(255,255,255,0.12)',
            transition: 'all 0.3s',
            cursor: 'pointer',
          }} />
        ))}
      </div>
    </section>
  )
}

// ── Component: Trust bar ─────────────────────────────────────
function TrustBar() {
  return (
    <div style={{
      padding: '20px',
      borderBottom: `1px solid ${G.border}`,
      display: 'flex',
      justifyContent: 'center',
      gap: '24px',
      flexWrap: 'wrap',
      alignItems: 'center',
    }}>
      {[
        { icon: '🔐', label: '2FA Protected' },
        { icon: '💼', label: 'Non-custodial' },
        { icon: '⚡', label: 'Always-on Bots' },
        { icon: '🌍', label: '80+ Countries' },
      ].map(t => (
        <div key={t.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: G.sec }}>
          <span style={{ fontSize: 14 }}>{t.icon}</span>
          <span>{t.label}</span>
        </div>
      ))}
    </div>
  )
}

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
    <div style={{
      background: G.bg, minHeight: '100vh', color: G.text,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
      overflowX: 'hidden',
    }}>

      {/* Keyframe injection */}
      <style>{`
        @keyframes archespeakPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }
        .archespeak-hide-scrollbar::-webkit-scrollbar { display: none; }
        @media (min-width: 768px) {
          .archespeak-mobile-only { display: none !important; }
          .archespeak-desktop-nav { display: flex !important; }
        }
        @media (max-width: 767px) {
          .archespeak-desktop-nav { display: none !important; }
        }
      `}</style>

      {/* ── Live cashout banner + toast ── */}
      <CashoutBanner />

      {/* ── Price ticker ── */}
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

      {/* ── Nav ── */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', height: 56, borderBottom: `1px solid ${G.border}`,
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(7,7,7,0.96)', backdropFilter: 'blur(24px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, background: G.goldDim,
            border: `1px solid ${G.goldBorder}`, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
          }}>⚡</div>
          <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: '0.14em', color: G.gold }}>archespeak</span>
        </div>

        {/* Desktop nav */}
        <div className="archespeak-desktop-nav" style={{ gap: 4, alignItems: 'center' }}>
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
        <button className="archespeak-mobile-only" onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: 'transparent', border: 'none', color: G.text, fontSize: 22, cursor: 'pointer', padding: 4 }}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </nav>

      {/* ── Mobile menu ── */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: 56, left: 0, right: 0, bottom: 0,
          background: G.bg, zIndex: 99, padding: 24,
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
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
          
        </div>
      )}

      {/* ── Trust bar ── */}
      <TrustBar />

      {/* ── Hero ── */}
      <section style={{ padding: '52px 20px 40px', textAlign: 'center', borderBottom: `1px solid ${G.border}` }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 14px', borderRadius: 100,
          border: `1px solid ${G.goldBorder}`, background: G.goldDim,
          fontSize: 10, letterSpacing: '0.18em', color: G.gold,
          textTransform: 'uppercase', marginBottom: 24,
        }}>
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

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, maxWidth: 400, margin: '0 auto 40px' }}>
          {STATS.map(s => (
            <div key={s.label} style={{ background: G.bg2, border: `1px solid ${G.border}`, borderRadius: 12, padding: '16px 12px' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: G.gold }}>{s.val}</div>
              <div style={{ fontSize: 10, color: G.muted, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* BTC Chart */}
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
                <Tooltip
                  contentStyle={{ background: '#111', border: `1px solid ${G.border}`, borderRadius: 8, fontSize: 11, color: '#fff' }}
                  formatter={(v: number) => [`$${Math.round(v).toLocaleString()}`, 'Price']}
                  labelFormatter={() => ''}
                />
                <Area type="monotone" dataKey="price" stroke={G.gold} strokeWidth={2} fill="url(#gGold)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ padding: '52px 20px', borderBottom: `1px solid ${G.border}` }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 10, color: G.gold, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 10 }}>How It Works</div>
          <h2 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.02em', margin: 0 }}>From signup to profit in 4 steps.</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 480, margin: '0 auto' }}>
          {STEPS.map((s) => (
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

      {/* ── Testimonials ── */}
      <Testimonials />

      {/* ── Features ── */}
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

      {/* ── CTA ── */}
      <section style={{ padding: '52px 20px 72px' }}>
        <div style={{
          background: 'rgba(245,197,24,0.05)', border: `1px solid ${G.goldBorder}`,
          borderRadius: 20, padding: '48px 24px', textAlign: 'center',
          position: 'relative', overflow: 'hidden', maxWidth: 560, margin: '0 auto',
        }}>
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

      {/* ── Footer ── */}
      <div style={{
        borderTop: `1px solid ${G.border}`, padding: '20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 12,
      }}>
        <span style={{ fontSize: 12, color: G.muted }}>⚡ archespeak · AI Trading Platform</span>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
         {[['Sign Up', '/signup'], ['Log In', '/login']].map(([l, h]) => (
            <button key={l} onClick={() => router.push(h)}
              style={{ background: 'transparent', border: 'none', color: G.muted, fontSize: 12, cursor: 'pointer' }}>{l}</button>
          ))}
        </div>
      </div>

    </div>
  )
}