import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(req: Request) {
  const { sessionId, pnl } = await req.json()
  await supabaseAdmin.from('bot_sessions').update({ current_pnl: pnl }).eq('id', sessionId)
  return NextResponse.json({ ok: true })
}