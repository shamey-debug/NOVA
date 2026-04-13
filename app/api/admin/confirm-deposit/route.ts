import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(req: Request) {
  const { depositId, userId, netAmount } = await req.json()

  await supabaseAdmin.from('deposits').update({
    status: 'confirmed',
    confirmed_at: new Date().toISOString(),
  }).eq('id', depositId)

  const { data: wallet } = await supabaseAdmin
    .from('wallets').select('balance').eq('user_id', userId).single()

  await supabaseAdmin.from('wallets').update({
    balance: (wallet?.balance ?? 0) + netAmount
  }).eq('user_id', userId)

  return NextResponse.json({ ok: true })
}