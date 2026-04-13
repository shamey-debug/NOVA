import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(req: Request) {
  const { userId, amount } = await req.json()

  const { data: wallet } = await supabaseAdmin
    .from('wallets')
    .select('balance')
    .eq('user_id', userId)
    .single()

  if (!wallet || wallet.balance < amount) {
    return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
  }

  await supabaseAdmin
    .from('wallets')
    .update({ balance: wallet.balance - amount })
    .eq('user_id', userId)

  return NextResponse.json({ ok: true })
}