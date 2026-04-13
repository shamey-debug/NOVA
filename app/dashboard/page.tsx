'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { supabase } from '@/lib/supabase'

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
}

const gen = (n = 60) => {
  let p = 1000
  return Array.from({ length: n }, (_, i) => {
    p += (Math.random() - 0.45) * 20
    return { t: String(i), p: Math.max(p, 800) }
  })
}

const WALLET_ADDRESSES = {
  BTC: '1A1zP1eP5QGefi2DMPTfTL5SLmv7Divf', // replace with your real BTC address
  USDT: 'TN3W4xx8BdkJ3DxBZMB5MjY3Q5S7JB7mZ', // replace with your real USDT TRC20 address
}

const BOTS = [
  { id: 'alpha', name: 'Alpha Scalper', risk: 'Low', daily: 2.5, min: 85 },
  { id: 'titan', name: 'Titan Swing', risk: 'Medium', daily: 5.0, min: 85 },
  { id: 'apex', name: 'Apex Momentum', risk: 'High', daily: 9.0, min: 85 },
]

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

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)

      const { data: w } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single()
      setWallet(w)

      const { data: s } = await supabase
        .from('bot_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
      setSessions(s ?? [])

      const { data: d } = await supabase
        .from('deposits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setDeposits(d ?? [])

      setLoading(false)
    }
    load()
  }, [])

  const handleDeposit = async () => {
    const amt = parseFloat(depositAmount)
    if (!amt || amt < 85) { alert('Minimum deposit is $85'); return }
    setDepositLoading(true)
    await supabase.from('deposits').insert({
      user_id: user.id,
      currency,
      amount: amt,
    })
    setDepositLoading(false)
    setDepositDone(true)
  }

  const handleTrade = async () => {
    setTradeError('')
    const amt = parseFloat(tradeAmount)
    const tp = parseFloat(targetProfit)
    const tl = parseFloat(targetLoss)
    if (!amt || !tp || !tl) { setTradeError('Fill all fields.'); return }
    if (amt > (wallet?.balance ?? 0)) { setTradeError('Insufficient wallet balance.'); return }
    if (amt < selectedBot.min) { setTradeError(`Minimum is $${selectedBot.min}.`); return }
    setTradeLoading(true)
    const { data: botRow } = await supabase
      .from('bots')
      .select('id')
      .eq('name', selectedBot.name)
      .single()

    await supabase.from('bot_sessions').insert({
      user_id: user.id,
      bot_id: botRow?.id ?? null,
      amount: amt,
      target_profit: tp,
      target_loss: tl,
    })

    // Deduct from wallet via server route
    await fetch('/api/wallet/deduct', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, amount: amt }),
    })

    setTradeLoading(false)
    setView('home')
    window.location.reload()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const balance = wallet?.balance ?? 0
  const activeSession = sessions.find(s => s.status === 'active')
  const totalPnl = sessions.reduce((acc, s) => acc + (s.current_pnl ?? 0), 0)

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
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: G.muted }}>Wallet Balance</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: G.gold }}>${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>

          {/* ── HOME VIEW ── */}
          {view === 'home' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Stats row */}
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

              {/* Chart */}
              <div style={{ background: G.bg2, border: `1px solid ${G.border}`, borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 11, color: G.muted, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Portfolio Curve</div>
                <ResponsiveContainer width="100%" height={180}>
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

              {/* Active session */}
              {activeSession ? (
                <div style={{ background: G.bg2, border: `1px solid ${G.goldBorder}`, borderRadius: 12, padding: 20 }}>
                  <div style={{ fontSize: 11, color: G.gold, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Active Bot Session</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                    {[
                      { label: 'Amount', value: `$${activeSession.amount}` },
                      { label: 'Current P&L', value: `${activeSession.current_pnl >= 0 ? '+' : ''}$${activeSession.current_pnl}`, color: activeSession.current_pnl >= 0 ? G.greenText : G.redText },
                      { label: 'Target Profit', value: `$${activeSession.target_profit}`, color: G.greenText },
                      { label: 'Stop Loss', value: `$${activeSession.target_loss}`, color: G.redText },
                    ].map(s => (
                      <div key={s.label}>
                        <div style={{ fontSize: 10, color: G.muted, marginBottom: 4 }}>{s.label}</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: s.color ?? G.text }}>{s.value}</div>
                      </div>
                    ))}
                  </div>
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

          {/* ── DEPOSIT VIEW ── */}
          {view === 'deposit' && (
            <div style={{ maxWidth: 480, margin: '0 auto' }}>
              <div style={{ background: G.bg2, border: `1px solid ${G.border}`, borderRadius: 16, padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>Fund Your Wallet</div>
                  <div style={{ fontSize: 13, color: G.muted, marginTop: 4 }}>Minimum deposit: $85 · Fee: $1</div>
                </div>

                {!depositDone ? (
                  <>
                    {/* Currency toggle */}
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

                    {/* Wallet address */}
                    <div>
                      <div style={{ fontSize: 11, color: G.muted, marginBottom: 8 }}>Send {currency} to this address</div>
                      <div style={{ background: G.bg3, border: `1px solid ${G.border}`, borderRadius: 8, padding: '12px 16px', fontSize: 12, color: G.gold, wordBreak: 'break-all', letterSpacing: '0.02em' }}>
                        {WALLET_ADDRESSES[currency]}
                      </div>
                      <div style={{ fontSize: 11, color: G.muted, marginTop: 6 }}>⚠ Only send {currency} to this address</div>
                    </div>

                    {/* Amount */}
                    <div>
                      <div style={{ fontSize: 11, color: G.muted, marginBottom: 8 }}>Amount (USD equivalent)</div>
                      <input
                        type="number"
                        placeholder="Min. $85"
                        value={depositAmount}
                        onChange={e => setDepositAmount(e.target.value)}
                        style={{ width: '100%', background: G.bg3, border: `1px solid ${G.border}`, borderRadius: 8, padding: '12px 16px', fontSize: 13, color: G.text, outline: 'none', boxSizing: 'border-box' }}
                      />
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

          {/* ── TRADE VIEW ── */}
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
                    {/* Bot selector */}
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

                    {/* Amount */}
                    <div>
                      <div style={{ fontSize: 11, color: G.muted, marginBottom: 8 }}>Trade Amount (USD)</div>
                      <input type="number" placeholder={`Min. $${selectedBot.min}`} value={tradeAmount} onChange={e => setTradeAmount(e.target.value)}
                        style={{ width: '100%', background: G.bg3, border: `1px solid ${G.border}`, borderRadius: 8, padding: '12px 16px', fontSize: 13, color: G.text, outline: 'none', boxSizing: 'border-box' }} />
                    </div>

                    {/* Target P&L */}
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
    </div>
  )
}