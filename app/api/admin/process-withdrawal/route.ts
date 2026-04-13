import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(req: Request) {
  const { withdrawalId, action } = await req.json()
  await supabaseAdmin.from('withdrawals').update({ status: action }).eq('id', withdrawalId)
  return NextResponse.json({ ok: true })
}