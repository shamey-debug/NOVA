import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(req: Request) {
  const { sessionId } = await req.json()
  await supabaseAdmin.from('bot_sessions').update({
    status: 'completed',
    ended_at: new Date().toISOString(),
  }).eq('id', sessionId)
  return NextResponse.json({ ok: true })
}