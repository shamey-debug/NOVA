import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET() {
  const [{ data: deposits }, { data: users }, { data: sessions }] = await Promise.all([
    supabaseAdmin
      .from('deposits')
      .select('id, user_id, currency, amount, fee, net_amount, status, confirmed_at, created_at, profiles!deposits_user_id_fkey(full_name, email)')
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, role, created_at, wallets(balance)')
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('bot_sessions')
      .select('id, user_id, amount, current_pnl, target_profit, target_loss, status, started_at, profiles!bot_sessions_user_id_fkey(full_name, email)')
      .order('started_at', { ascending: false }),
  ])

  return NextResponse.json({
    deposits: deposits ?? [],
    users: users ?? [],
    sessions: sessions ?? [],
  })
}