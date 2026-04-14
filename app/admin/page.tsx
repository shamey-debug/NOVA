'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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

type Tab = 'deposits' | 'withdrawals' | 'users' | 'sessions' | 'settings'

function Badge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    confirmed: { bg: G.greenBg,  color: G.greenText },
    paid:      { bg: G.greenBg,  color: G.greenText },
    active:    { bg: G.greenBg,  color: G.greenText },
    pending:   { bg: G.goldDim,  color: G.gold },
    rejected:  { bg: G.redBg,    color: G.redText },
    completed: { bg: G.bg3,      color: G.muted },
  }
  const s = map[status] ?? { bg: G.bg3, color: G.muted }
  return (
    <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 5, background: s.bg, color: s.color, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
      {status}
    </span>
  )
}

function Th({ children }: { children: string }) {
  return (
    <th style={{ padding: '12px 16px', textAlign: 'left', color: G.muted, fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
      {children}
    </th>
  )
}

function Td({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <td style={{ padding: '12px 16px', ...style }}>{children}</td>
}

function ActionBtn({ label, color, onClick }: { label: string; color: 'green' | 'red' | 'gold'; onClick: () => void }) {
  const c = {
    green: { bg: G.greenBg,  border: G.green, text: G.greenText },
    red:   { bg: G.redBg,    border: G.red,   text: G.redText },
    gold:  { bg: G.goldDim,  border: G.gold,  text: G.gold },
  }[color]
  return (
    <button onClick={onClick} style={{ fontSize: 11, padding: '5px 12px', borderRadius: 6, background: c.bg, color: c.text, border: `1px solid ${c.border}`, cursor: 'pointer', fontWeight: 700, whiteSpace: 'nowrap' }}>
      {label}
    </button>
  )
}

export default function AdminPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('deposits')
  const [deposits,    setDeposits]    = useState<any[]>([])
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [users,       setUsers]       = useState<any[]>([])
  const [sessions,    setSessions]    = useState<any[]>([])
  const [loading,     setLoading]     = useState(true)

  // Session P&L edit
  const [pnlEdit, setPnlEdit] = useState<Record<string, string>>({})

  // User balance edit
  const [balEdit,    setBalEdit]    = useState<Record<string, string>>({})
  const [balSaving,  setBalSaving]  = useState<Record<string, boolean>>({})

  // Settings — wallet addresses
  const [btcAddr,     setBtcAddr]     = useState('')
  const [usdtAddr,    setUsdtAddr]    = useState('')
  const [addrSaving,  setAddrSaving]  = useState(false)
  const [addrSaved,   setAddrSaved]   = useState(false)

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)
  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3200)
  }

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const res = await fetch('/api/admin/me')
      const { role } = await res.json()
      if (role !== 'admin') { router.push('/dashboard'); return }
      await fetchAll()
      await fetchAddresses()
      setLoading(false)
    }
    init()
  }, [])

  const fetchAll = async () => {
    const res = await fetch('/api/admin/data')
    const data = await res.json()
    setDeposits(data.deposits ?? [])
    setUsers(data.users ?? [])
    setSessions(data.sessions ?? [])
    setWithdrawals(data.withdrawals ?? [])
  }

  const fetchAddresses = async () => {
    const { data } = await supabase
      .from('app_config')
      .select('key, value')
      .in('key', ['wallet_btc', 'wallet_usdt'])
    if (data) {
      data.forEach((row: any) => {
        if (row.key === 'wallet_btc')  setBtcAddr(row.value)
        if (row.key === 'wallet_usdt') setUsdtAddr(row.value)
      })
    }
  }

  // ── Deposits ──
  const confirmDeposit = async (deposit: any) => {
    await fetch('/api/admin/confirm-deposit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ depositId: deposit.id, userId: deposit.user_id, netAmount: deposit.net_amount }),
    })
    showToast(`Deposit confirmed — $${deposit.net_amount} credited`)
    await fetchAll()
  }

  const rejectDeposit = async (depositId: string) => {
    await fetch('/api/admin/reject-deposit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ depositId }),
    })
    showToast('Deposit rejected', 'err')
    await fetchAll()
  }

  // ── Sessions ──
  const updatePnl = async (sessionId: string) => {
    const val = parseFloat(pnlEdit[sessionId])
    if (isNaN(val)) return
    await fetch('/api/admin/update-pnl', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, pnl: val }),
    })
    showToast(`P&L updated to $${val}`)
    await fetchAll()
  }

  const stopSession = async (sessionId: string) => {
    await fetch('/api/admin/stop-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    })
    showToast('Session stopped')
    await fetchAll()
  }

  // ── Withdrawals ──
  const processWithdrawal = async (withdrawalId: string, action: 'paid' | 'rejected') => {
    await fetch('/api/admin/process-withdrawal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ withdrawalId, action }),
    })
    showToast(action === 'paid' ? 'Withdrawal marked as paid' : 'Withdrawal rejected', action === 'paid' ? 'ok' : 'err')
    await fetchAll()
  }

  // ── User balance ──
  const saveBalance = async (userId: string) => {
    const val = parseFloat(balEdit[userId])
    if (isNaN(val) || val < 0) return
    setBalSaving(prev => ({ ...prev, [userId]: true }))
    const { error } = await supabase
      .from('wallets')
      .update({ balance: val })
      .eq('user_id', userId)
    setBalSaving(prev => ({ ...prev, [userId]: false }))
    if (!error) {
      showToast(`Balance updated to $${val.toFixed(2)}`)
      setBalEdit(prev => ({ ...prev, [userId]: '' }))
      await fetchAll()
    } else {
      showToast('Failed to update balance', 'err')
    }
  }

  // ── Wallet addresses ──
  const saveAddresses = async () => {
    if (!btcAddr.trim() && !usdtAddr.trim()) return
    setAddrSaving(true)
    const upserts = []
    if (btcAddr.trim())  upserts.push({ key: 'wallet_btc',  value: btcAddr.trim() })
    if (usdtAddr.trim()) upserts.push({ key: 'wallet_usdt', value: usdtAddr.trim() })
    const { error } = await supabase
      .from('app_config')
      .upsert(upserts, { onConflict: 'key' })
    setAddrSaving(false)
    if (!error) {
      setAddrSaved(true)
      setTimeout(() => setAddrSaved(false), 2500)
      showToast('Deposit addresses saved')
    } else {
      showToast('Failed to save addresses', 'err')
    }
  }

  if (loading) return (
    <div style={{ height: '100vh', background: G.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: G.gold }}>
      Loading...
    </div>
  )

  const pendingDeposits     = deposits.filter(d => d.status === 'pending').length
  const pendingWithdrawals  = withdrawals.filter(w => w.status === 'pending').length
  const activeSessions      = sessions.filter(s => s.status === 'active').length

  const tabs: { key: Tab; label: string; alert?: number }[] = [
    { key: 'deposits',    label: 'Deposits',    alert: pendingDeposits },
    { key: 'withdrawals', label: 'Withdrawals', alert: pendingWithdrawals },
    { key: 'users',       label: 'Users',       alert: 0 },
    { key: 'sessions',    label: 'Sessions',    alert: activeSessions },
    { key: 'settings',    label: '⚙ Settings',  alert: 0 },
  ]

  const tableWrapper: React.CSSProperties = {
    background: G.bg2, border: `1px solid ${G.border}`, borderRadius: 16, overflow: 'auto',
  }
  const tableStyle: React.CSSProperties = {
    width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 640,
  }
  const theadRow: React.CSSProperties = {
    borderBottom: `1px solid ${G.border}`, background: G.bg3,
  }

  return (
    <div style={{ minHeight: '100vh', background: G.bg, color: G.text, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif", padding: '24px 20px' }}>
      <style>{`
        @keyframes toastIn { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 18, left: '50%', transform: 'translateX(-50%)',
          background: toast.type === 'ok' ? 'rgba(22,163,74,0.15)' : 'rgba(220,38,38,0.15)',
          border: `1px solid ${toast.type === 'ok' ? G.greenText : G.redText}`,
          color: toast.type === 'ok' ? G.greenText : G.redText,
          padding: '10px 22px', borderRadius: 10, fontSize: 13, fontWeight: 700,
          zIndex: 9999, animation: 'toastIn 0.25s ease', whiteSpace: 'nowrap',
        }}>
          {toast.type === 'ok' ? '✓' : '✕'} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: G.gold, letterSpacing: '0.06em' }}>⚡ ADMIN</div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {/* Summary pills */}
          {pendingDeposits > 0 && (
            <span style={{ fontSize: 11, padding: '4px 12px', borderRadius: 20, background: G.goldDim, border: `1px solid ${G.goldBorder}`, color: G.gold, fontWeight: 700 }}>
              {pendingDeposits} deposit{pendingDeposits > 1 ? 's' : ''} pending
            </span>
          )}
          {pendingWithdrawals > 0 && (
            <span style={{ fontSize: 11, padding: '4px 12px', borderRadius: 20, background: G.redBg, border: `1px solid ${G.red}`, color: G.redText, fontWeight: 700 }}>
              {pendingWithdrawals} withdrawal{pendingWithdrawals > 1 ? 's' : ''} pending
            </span>
          )}
          <button onClick={() => router.push('/dashboard')}
            style={{ fontSize: 12, color: G.muted, background: G.bg2, border: `1px solid ${G.border}`, padding: '6px 16px', borderRadius: 8, cursor: 'pointer' }}>
            ← Dashboard
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '8px 18px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            border: `1px solid ${tab === t.key ? G.goldBorder : G.border}`,
            background: tab === t.key ? G.goldDim : 'transparent',
            color: tab === t.key ? G.gold : G.muted,
            display: 'flex', alignItems: 'center', gap: 7,
          }}>
            {t.label}
            {(t.alert ?? 0) > 0 && (
              <span style={{ background: t.key === 'sessions' ? G.greenBg : G.redBg, color: t.key === 'sessions' ? G.greenText : G.redText, border: `1px solid ${t.key === 'sessions' ? G.green : G.red}`, fontSize: 9, fontWeight: 800, padding: '1px 6px', borderRadius: 10 }}>
                {t.alert}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── DEPOSITS ── */}
      {tab === 'deposits' && (
        <div style={tableWrapper}>
          <table style={tableStyle}>
            <thead>
              <tr style={theadRow}>
                {['User', 'Network', 'Amount', 'Net', 'Status', 'Date', 'Actions'].map(h => <Th key={h}>{h}</Th>)}
              </tr>
            </thead>
            <tbody>
              {deposits.map(d => (
                <tr key={d.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <Td>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{d.profiles?.full_name ?? '—'}</div>
                    <div style={{ fontSize: 11, color: G.muted }}>{d.profiles?.email}</div>
                  </Td>
                  <Td><span style={{ color: G.gold, fontWeight: 700 }}>{d.currency}</span></Td>
                  <Td><span style={{ fontWeight: 600 }}>${d.amount}</span></Td>
                  <Td><span style={{ color: G.greenText, fontWeight: 700 }}>${d.net_amount}</span></Td>
                  <Td><Badge status={d.status} /></Td>
                  <Td style={{ color: G.sec, fontSize: 11 }}>{new Date(d.created_at).toLocaleString()}</Td>
                  <Td>
                    {d.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <ActionBtn label="✓ Confirm" color="green" onClick={() => confirmDeposit(d)} />
                        <ActionBtn label="✕ Reject"  color="red"   onClick={() => rejectDeposit(d.id)} />
                      </div>
                    )}
                  </Td>
                </tr>
              ))}
              {deposits.length === 0 && (
                <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: G.muted }}>No deposits yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── WITHDRAWALS ── */}
      {tab === 'withdrawals' && (
        <div style={tableWrapper}>
          <table style={tableStyle}>
            <thead>
              <tr style={theadRow}>
                {['User', 'Amount', 'Address', 'Status', 'Date', 'Actions'].map(h => <Th key={h}>{h}</Th>)}
              </tr>
            </thead>
            <tbody>
              {withdrawals.map(w => (
                <tr key={w.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <Td>
                    <div style={{ fontWeight: 600 }}>{w.profiles?.full_name ?? '—'}</div>
                    <div style={{ fontSize: 11, color: G.muted }}>{w.profiles?.email}</div>
                  </Td>
                  <Td><span style={{ color: G.gold, fontWeight: 700 }}>${w.amount}</span></Td>
                  <Td>
                    <div style={{ fontSize: 11, color: G.sec, fontFamily: 'monospace', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={w.address}>
                      {w.address}
                    </div>
                  </Td>
                  <Td><Badge status={w.status} /></Td>
                  <Td style={{ color: G.sec, fontSize: 11 }}>{new Date(w.created_at).toLocaleString()}</Td>
                  <Td>
                    {w.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <ActionBtn label="✓ Mark Paid" color="green" onClick={() => processWithdrawal(w.id, 'paid')} />
                        <ActionBtn label="✕ Reject"    color="red"   onClick={() => processWithdrawal(w.id, 'rejected')} />
                      </div>
                    )}
                  </Td>
                </tr>
              ))}
              {withdrawals.length === 0 && (
                <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: G.muted }}>No withdrawal requests yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── USERS ── */}
      {tab === 'users' && (
        <div style={tableWrapper}>
          <table style={tableStyle}>
            <thead>
              <tr style={theadRow}>
                {['Name', 'Email', 'Role', 'Balance', 'Edit Balance', 'Joined'].map(h => <Th key={h}>{h}</Th>)}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <Td><span style={{ fontWeight: 600 }}>{u.full_name ?? '—'}</span></Td>
                  <Td style={{ color: G.sec }}>{u.email}</Td>
                  <Td>
                    <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 5, background: u.role === 'admin' ? G.goldDim : G.bg3, color: u.role === 'admin' ? G.gold : G.muted, fontWeight: 800, textTransform: 'uppercase' }}>
                      {u.role}
                    </span>
                  </Td>
                  <Td><span style={{ color: G.gold, fontWeight: 700 }}>${u.wallets?.balance?.toFixed(2) ?? '0.00'}</span></Td>
                  <Td>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input
                        type="number"
                        placeholder="New balance"
                        value={balEdit[u.id] ?? ''}
                        onChange={e => setBalEdit(prev => ({ ...prev, [u.id]: e.target.value }))}
                        style={{ width: 110, background: G.bg3, border: `1px solid ${G.border}`, borderRadius: 6, padding: '5px 10px', fontSize: 12, color: G.text, outline: 'none' }}
                      />
                      <ActionBtn
                        label={balSaving[u.id] ? '...' : 'Set'}
                        color="gold"
                        onClick={() => saveBalance(u.id)}
                      />
                    </div>
                  </Td>
                  <Td style={{ color: G.sec, fontSize: 11 }}>{new Date(u.created_at).toLocaleDateString()}</Td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: G.muted }}>No users yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── SESSIONS ── */}
      {tab === 'sessions' && (
        <div style={tableWrapper}>
          <table style={tableStyle}>
            <thead>
              <tr style={theadRow}>
                {['User', 'Amount', 'P&L', 'Target', 'Stop Loss', 'Status', 'Actions'].map(h => <Th key={h}>{h}</Th>)}
              </tr>
            </thead>
            <tbody>
              {sessions.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <Td>
                    <div style={{ fontWeight: 600 }}>{s.profiles?.full_name ?? '—'}</div>
                    <div style={{ fontSize: 11, color: G.muted }}>{s.profiles?.email}</div>
                  </Td>
                  <Td><span style={{ fontWeight: 600 }}>${s.amount}</span></Td>
                  <Td>
                    <span style={{ fontWeight: 700, color: (s.current_pnl ?? 0) >= 0 ? G.greenText : G.redText }}>
                      {(s.current_pnl ?? 0) >= 0 ? '+' : ''}${s.current_pnl ?? 0}
                    </span>
                  </Td>
                  <Td style={{ color: G.greenText }}>${s.target_profit}</Td>
                  <Td style={{ color: G.redText }}>${s.target_loss}</Td>
                  <Td><Badge status={s.status} /></Td>
                  <Td>
                    {s.status === 'active' && (
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                        <input
                          type="number"
                          placeholder="P&L"
                          value={pnlEdit[s.id] ?? ''}
                          onChange={e => setPnlEdit(prev => ({ ...prev, [s.id]: e.target.value }))}
                          style={{ width: 80, background: G.bg3, border: `1px solid ${G.border}`, borderRadius: 6, padding: '5px 8px', fontSize: 12, color: G.text, outline: 'none' }}
                        />
                        <ActionBtn label="Update" color="gold" onClick={() => updatePnl(s.id)} />
                        <ActionBtn label="⏹ Stop" color="red"  onClick={() => stopSession(s.id)} />
                      </div>
                    )}
                  </Td>
                </tr>
              ))}
              {sessions.length === 0 && (
                <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: G.muted }}>No sessions yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── SETTINGS ── */}
      {tab === 'settings' && (
        <div style={{ maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Deposit addresses card */}
          <div style={{ background: G.bg2, border: `1px solid ${G.border}`, borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>Deposit Addresses</div>
            <div style={{ fontSize: 12, color: G.muted, marginBottom: 20 }}>
              These addresses are shown to users on the deposit page. Changes go live immediately.
            </div>

            {/* USDT */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <img src="https://assets.coingecko.com/coins/images/325/thumb/Tether-logo.png" alt="USDT" style={{ width: 20, height: 20, borderRadius: '50%' }} />
                <span style={{ fontSize: 12, fontWeight: 700 }}>USDT — TRC20</span>
              </div>
              <input
                type="text"
                placeholder="T... (TRC20 address)"
                value={usdtAddr}
                onChange={e => setUsdtAddr(e.target.value)}
                style={{ width: '100%', background: G.bg3, border: `1px solid ${G.border}`, borderRadius: 10, padding: '12px 14px', fontSize: 12, color: G.gold, outline: 'none', fontFamily: 'monospace', letterSpacing: '0.03em' }}
              />
            </div>

            {/* BTC */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <img src="https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png" alt="BTC" style={{ width: 20, height: 20, borderRadius: '50%' }} />
                <span style={{ fontSize: 12, fontWeight: 700 }}>BTC — Mainnet</span>
              </div>
              <input
                type="text"
                placeholder="1... or bc1..."
                value={btcAddr}
                onChange={e => setBtcAddr(e.target.value)}
                style={{ width: '100%', background: G.bg3, border: `1px solid ${G.border}`, borderRadius: 10, padding: '12px 14px', fontSize: 12, color: G.gold, outline: 'none', fontFamily: 'monospace', letterSpacing: '0.03em' }}
              />
            </div>

            <button
              onClick={saveAddresses}
              disabled={addrSaving}
              style={{ background: addrSaved ? G.greenBg : G.gold, color: addrSaved ? G.greenText : '#000', border: addrSaved ? `1px solid ${G.greenText}` : 'none', fontWeight: 800, fontSize: 14, padding: '13px 28px', borderRadius: 10, cursor: 'pointer', opacity: addrSaving ? 0.6 : 1, transition: 'all 0.3s' }}>
              {addrSaving ? 'Saving...' : addrSaved ? '✓ Saved!' : 'Save Addresses'}
            </button>
          </div>

          {/* Quick stats card */}
          <div style={{ background: G.bg2, border: `1px solid ${G.border}`, borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 16 }}>Platform Overview</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Total Users',          value: users.length,                                               color: G.text },
                { label: 'Active Sessions',       value: activeSessions,                                            color: G.greenText },
                { label: 'Pending Deposits',      value: pendingDeposits,                                           color: G.gold },
                { label: 'Pending Withdrawals',   value: pendingWithdrawals,                                        color: G.redText },
                { label: 'Total Deposits',        value: deposits.filter(d => d.status === 'confirmed').length,    color: G.greenText },
                { label: 'Total Paid Out',        value: `$${withdrawals.filter(w => w.status === 'paid').reduce((a, w) => a + (w.amount ?? 0), 0).toFixed(2)}`, color: G.gold },
              ].map(s => (
                <div key={s.label} style={{ background: G.bg3, border: `1px solid ${G.border}`, borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ fontSize: 10, color: G.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}