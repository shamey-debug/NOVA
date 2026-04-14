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

type Tab = 'deposits' | 'withdrawals' | 'users' | 'sessions'

export default function AdminPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('deposits')
  const [deposits, setDeposits] = useState<any[]>([])
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [pnlEdit, setPnlEdit] = useState<Record<string, string>>({})

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const res = await fetch('/api/admin/me')
      const { role } = await res.json()
      if (role !== 'admin') { router.push('/dashboard'); return }

      await fetchAll()
      setLoading(false)
    }
    init()
  }, [])

  const fetchAll = async () => {
    const res = await fetch('/api/admin/data')
    const { deposits, users, sessions, withdrawals } = await res.json()
    setDeposits(deposits)
    setUsers(users)
    setSessions(sessions)
    setWithdrawals(withdrawals ?? [])
  }

  const confirmDeposit = async (deposit: any) => {
    await fetch('/api/admin/confirm-deposit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ depositId: deposit.id, userId: deposit.user_id, netAmount: deposit.net_amount }),
    })
    await fetchAll()
  }

  const rejectDeposit = async (depositId: string) => {
    await fetch('/api/admin/reject-deposit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ depositId }),
    })
    await fetchAll()
  }

  const updatePnl = async (sessionId: string) => {
    const val = parseFloat(pnlEdit[sessionId])
    if (isNaN(val)) return
    await fetch('/api/admin/update-pnl', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, pnl: val }),
    })
    await fetchAll()
  }

  const stopSession = async (sessionId: string) => {
    await fetch('/api/admin/stop-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    })
    await fetchAll()
  }

  const processWithdrawal = async (withdrawalId: string, action: 'paid' | 'rejected') => {
    await fetch('/api/admin/process-withdrawal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ withdrawalId, action }),
    })
    await fetchAll()
  }

  if (loading) return (
    <div style={{ height: '100vh', background: G.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: G.gold }}>
      Loading...
    </div>
  )

  const tabs: { key: Tab, label: string }[] = [
    { key: 'deposits', label: `Deposits (${deposits.length})` },
    { key: 'withdrawals', label: `Withdrawals (${withdrawals.filter(w => w.status === 'pending').length} pending)` },
    { key: 'users', label: `Users (${users.length})` },
    { key: 'sessions', label: `Sessions (${sessions.length})` },
  ]

  return (
    <div style={{ minHeight: '100vh', background: G.bg, color: G.text, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif", padding: 24 }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: G.gold, letterSpacing: '0.06em' }}>⚡ KoolCrypto ADMIN</div>
        <button onClick={() => router.push('/dashboard')}
          style={{ fontSize: 12, color: G.muted, background: G.bg2, border: `1px solid ${G.border}`, padding: '6px 16px', borderRadius: 8, cursor: 'pointer' }}>
          ← Dashboard
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: `1px solid ${tab === t.key ? G.goldBorder : G.border}`, background: tab === t.key ? G.goldDim : 'transparent', color: tab === t.key ? G.gold : G.muted }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* DEPOSITS */}
      {tab === 'deposits' && (
        <div style={{ background: G.bg2, border: `1px solid ${G.border}`, borderRadius: 16, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${G.border}`, background: G.bg3 }}>
                {['User', 'Currency', 'Amount', 'Net', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: G.muted, fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {deposits.map(d => (
                <tr key={d.id} style={{ borderBottom: `1px solid rgba(255,255,255,0.03)` }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{d.profiles?.full_name}</div>
                    <div style={{ fontSize: 11, color: G.muted }}>{d.profiles?.email}</div>
                  </td>
                  <td style={{ padding: '12px 16px', color: G.gold, fontWeight: 700 }}>{d.currency}</td>
                  <td style={{ padding: '12px 16px' }}>${d.amount}</td>
                  <td style={{ padding: '12px 16px', color: G.greenText }}>${d.net_amount}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 5, background: d.status === 'confirmed' ? G.greenBg : d.status === 'rejected' ? G.redBg : G.goldDim, color: d.status === 'confirmed' ? G.greenText : d.status === 'rejected' ? G.redText : G.gold, fontWeight: 700, textTransform: 'uppercase' }}>
                      {d.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: G.sec, fontSize: 12 }}>{new Date(d.created_at).toLocaleString()}</td>
                  <td style={{ padding: '12px 16px' }}>
                    {d.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => confirmDeposit(d)}
                          style={{ fontSize: 12, padding: '5px 12px', borderRadius: 6, background: G.greenBg, color: G.greenText, border: `1px solid ${G.green}`, cursor: 'pointer', fontWeight: 700 }}>
                          Confirm
                        </button>
                        <button onClick={() => rejectDeposit(d.id)}
                          style={{ fontSize: 12, padding: '5px 12px', borderRadius: 6, background: G.redBg, color: G.redText, border: `1px solid ${G.red}`, cursor: 'pointer', fontWeight: 700 }}>
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {deposits.length === 0 && (
                <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: G.muted }}>No deposits yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* WITHDRAWALS */}
      {tab === 'withdrawals' && (
        <div style={{ background: G.bg2, border: `1px solid ${G.border}`, borderRadius: 16, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${G.border}`, background: G.bg3 }}>
                {['User', 'Amount', 'Address', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: G.muted, fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {withdrawals.map(w => (
                <tr key={w.id} style={{ borderBottom: `1px solid rgba(255,255,255,0.03)` }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{w.profiles?.full_name}</div>
                    <div style={{ fontSize: 11, color: G.muted }}>{w.profiles?.email}</div>
                  </td>
                  <td style={{ padding: '12px 16px', color: G.gold, fontWeight: 700 }}>${w.amount}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: 11, color: G.sec, fontFamily: 'monospace', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{w.address}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 5, background: w.status === 'paid' ? G.greenBg : w.status === 'rejected' ? G.redBg : G.goldDim, color: w.status === 'paid' ? G.greenText : w.status === 'rejected' ? G.redText : G.gold, fontWeight: 700, textTransform: 'uppercase' }}>
                      {w.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: G.sec, fontSize: 12 }}>{new Date(w.created_at).toLocaleString()}</td>
                  <td style={{ padding: '12px 16px' }}>
                    {w.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => processWithdrawal(w.id, 'paid')}
                          style={{ fontSize: 12, padding: '5px 12px', borderRadius: 6, background: G.greenBg, color: G.greenText, border: `1px solid ${G.green}`, cursor: 'pointer', fontWeight: 700 }}>
                          Mark Paid
                        </button>
                        <button onClick={() => processWithdrawal(w.id, 'rejected')}
                          style={{ fontSize: 12, padding: '5px 12px', borderRadius: 6, background: G.redBg, color: G.redText, border: `1px solid ${G.red}`, cursor: 'pointer', fontWeight: 700 }}>
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {withdrawals.length === 0 && (
                <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: G.muted }}>No withdrawal requests yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* USERS */}
      {tab === 'users' && (
        <div style={{ background: G.bg2, border: `1px solid ${G.border}`, borderRadius: 16, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${G.border}`, background: G.bg3 }}>
                {['Name', 'Email', 'Role', 'Balance', 'Joined'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: G.muted, fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: `1px solid rgba(255,255,255,0.03)` }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>{u.full_name}</td>
                  <td style={{ padding: '12px 16px', color: G.sec }}>{u.email}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 5, background: u.role === 'admin' ? G.goldDim : G.bg3, color: u.role === 'admin' ? G.gold : G.muted, fontWeight: 700, textTransform: 'uppercase' }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: G.gold, fontWeight: 700 }}>${u.wallets?.balance?.toFixed(2) ?? '0.00'}</td>
                  <td style={{ padding: '12px 16px', color: G.sec, fontSize: 12 }}>{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SESSIONS */}
      {tab === 'sessions' && (
        <div style={{ background: G.bg2, border: `1px solid ${G.border}`, borderRadius: 16, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${G.border}`, background: G.bg3 }}>
                {['User', 'Amount', 'Current P&L', 'Target Profit', 'Stop Loss', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: G.muted, fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sessions.map(s => (
                <tr key={s.id} style={{ borderBottom: `1px solid rgba(255,255,255,0.03)` }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600 }}>{s.profiles?.full_name}</div>
                    <div style={{ fontSize: 11, color: G.muted }}>{s.profiles?.email}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>${s.amount}</td>
                  <td style={{ padding: '12px 16px', color: s.current_pnl >= 0 ? G.greenText : G.redText, fontWeight: 700 }}>
                    {s.current_pnl >= 0 ? '+' : ''}${s.current_pnl}
                  </td>
                  <td style={{ padding: '12px 16px', color: G.greenText }}>${s.target_profit}</td>
                  <td style={{ padding: '12px 16px', color: G.redText }}>${s.target_loss}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 5, background: s.status === 'active' ? G.greenBg : G.bg3, color: s.status === 'active' ? G.greenText : G.muted, fontWeight: 700, textTransform: 'uppercase' }}>
                      {s.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {s.status === 'active' && (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input
                          type="number"
                          placeholder="P&L"
                          value={pnlEdit[s.id] ?? ''}
                          onChange={e => setPnlEdit(prev => ({ ...prev, [s.id]: e.target.value }))}
                          style={{ width: 80, background: G.bg3, border: `1px solid ${G.border}`, borderRadius: 6, padding: '4px 8px', fontSize: 12, color: G.text, outline: 'none' }}
                        />
                        <button onClick={() => updatePnl(s.id)}
                          style={{ fontSize: 12, padding: '5px 10px', borderRadius: 6, background: G.goldDim, color: G.gold, border: `1px solid ${G.goldBorder}`, cursor: 'pointer', fontWeight: 700 }}>
                          Update
                        </button>
                        <button onClick={() => stopSession(s.id)}
                          style={{ fontSize: 12, padding: '5px 10px', borderRadius: 6, background: G.redBg, color: G.redText, border: `1px solid ${G.red}`, cursor: 'pointer', fontWeight: 700 }}>
                          Stop
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {sessions.length === 0 && (
                <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: G.muted }}>No sessions yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}