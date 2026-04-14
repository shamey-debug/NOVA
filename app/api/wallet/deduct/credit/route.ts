import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(req: Request) {
  const { userId, amount } = await req.json()

  const { data: wallet } = await supabaseAdmin
    .from('wallets')
    .select('balance')
    .eq('user_id', userId)
    .single()

  if (!wallet) {
    return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })
  }

  const newBalance = wallet.balance + amount   // ← ADD, not subtract

  await supabaseAdmin
    .from('wallets')
    .update({ balance: newBalance })
    .eq('user_id', userId)

  return NextResponse.json({ ok: true, newBalance })
}