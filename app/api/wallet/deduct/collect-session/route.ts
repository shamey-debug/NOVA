import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(req: Request) {
  const { sessionId, userId, pnl } = await req.json()

  if (!sessionId || !userId || pnl === undefined) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  // 1. Get session to confirm it exists and is active
  const { data: session } = await supabaseAdmin
    .from('bot_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('status', 'active')
    .single()

  if (!session) {
    return NextResponse.json({ error: 'Session not found or already closed' }, { status: 404 })
  }

  // 2. Get wallet
  const { data: wallet } = await supabaseAdmin
    .from('wallets')
    .select('balance')
    .eq('user_id', userId)
    .single()

  if (!wallet) {
    return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })
  }

  const payout     = session.amount + pnl          // principal + profit
  const newBalance = wallet.balance + payout

  // 3. Credit wallet
  await supabaseAdmin
    .from('wallets')
    .update({ balance: newBalance })
    .eq('user_id', userId)

  // 4. Close session
  await supabaseAdmin
    .from('bot_sessions')
    .update({ status: 'completed', ended_at: new Date().toISOString(), current_pnl: pnl })
    .eq('id', sessionId)

  return NextResponse.json({ ok: true, newBalance, payout })
}