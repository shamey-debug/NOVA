import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(req: Request) {
  try {
    const { sessionId, userId, pnl } = await req.json()

    console.log('collect-session called:', { sessionId, userId, pnl })

    if (!sessionId || !userId || pnl === undefined) {
      console.log('Missing fields')
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Get session
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('bot_sessions')
      .select('amount, status')
      .eq('id', sessionId)
      .single()

    console.log('session:', session, 'sessionError:', sessionError)

    if (!session) {
      return NextResponse.json({ error: 'Session not found: ' + sessionError?.message }, { status: 404 })
    }

    // Prevent double-credit: if already completed, skip
    if (session.status === 'completed') {
      const { data: wallet } = await supabaseAdmin.from('wallets').select('balance').eq('user_id', userId).single()
      console.log('session already completed, skipping credit')
      return NextResponse.json({ ok: true, skipped: true, newBalance: wallet?.balance ?? 0 })
    }

    // Get wallet
    const { data: wallet, error: walletFetchError } = await supabaseAdmin
      .from('wallets')
      .select('balance')
      .eq('user_id', userId)
      .single()

    console.log('wallet:', wallet, 'walletFetchError:', walletFetchError)

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found: ' + walletFetchError?.message }, { status: 404 })
    }

    const payout     = session.amount + pnl
    const newBalance = wallet.balance + payout

    console.log('crediting:', { payout, newBalance })

    // Update wallet
    const { error: walletError } = await supabaseAdmin
      .from('wallets')
      .update({ balance: newBalance })
      .eq('user_id', userId)

    if (walletError) {
      console.log('wallet update error:', walletError)
      return NextResponse.json({ error: walletError.message }, { status: 500 })
    }

    // Close session
    await supabaseAdmin
      .from('bot_sessions')
      .update({ status: 'completed', ended_at: new Date().toISOString(), current_pnl: pnl })
      .eq('id', sessionId)

    console.log('collect-session success:', { newBalance, payout })
    return NextResponse.json({ ok: true, newBalance, payout })

  } catch (err: any) {
    console.error('collect-session exception:', err)
    return NextResponse.json({ error: err.message ?? 'Unknown error' }, { status: 500 })
  }
}