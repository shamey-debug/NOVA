import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(req: Request) {
  const { sessionId, userId, pnl } = await req.json()

  if (!sessionId || !userId || pnl === undefined) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  // Get session — no status filter, just find it
  const { data: session } = await supabaseAdmin
    .from('bot_sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  // Get wallet
  const { data: wallet } = await supabaseAdmin
    .from('wallets')
    .select('balance')
    .eq('user_id', userId)
    .single()

  if (!wallet) {
    return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })
  }

  // Prevent double-credit: if already completed and credited, skip
  if (session.status === 'completed' && session.credited === true) {
    return NextResponse.json({ ok: true, skipped: true, newBalance: wallet.balance })
  }

  const payout     = session.amount + pnl
  const newBalance = wallet.balance + payout

  // Credit wallet
  const { error: walletError } = await supabaseAdmin
    .from('wallets')
    .update({ balance: newBalance })
    .eq('user_id', userId)

  if (walletError) {
    return NextResponse.json({ error: 'Wallet update failed: ' + walletError.message }, { status: 500 })
  }

  // Close session and mark credited
  await supabaseAdmin
    .from('bot_sessions')
    .update({
      status: 'completed',
      ended_at: new Date().toISOString(),
      current_pnl: pnl,
      credited: true,
    })
    .eq('id', sessionId)

  return NextResponse.json({ ok: true, newBalance, payout })
}