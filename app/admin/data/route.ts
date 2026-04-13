import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET() {
  const [{ data: deposits }, { data: users }, { data: sessions }] = await Promise.all([
    supabaseAdmin.from('deposits').select('*, profiles(full_name, email)').order('created_at', { ascending: false }),
    supabaseAdmin.from('profiles').select('*, wallets(balance)').order('created_at', { ascending: false }),
    supabaseAdmin.from('bot_sessions').select('*, profiles(full_name, email)').order('started_at', { ascending: false }),
  ])

  return NextResponse.json({ deposits: deposits ?? [], users: users ?? [], sessions: sessions ?? [] })
}