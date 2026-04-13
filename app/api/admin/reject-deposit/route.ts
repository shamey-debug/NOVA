import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(req: Request) {
  const { depositId } = await req.json()
  await supabaseAdmin.from('deposits').update({ status: 'rejected' }).eq('id', depositId)
  return NextResponse.json({ ok: true })
}