import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

const KEYS = ['tutorial_video_url', 'tutorial_telegram_link', 'tutorial_whatsapp_link']

export async function GET() {
  const { data } = await supabaseAdmin
    .from('app_config')
    .select('key, value')
    .in('key', KEYS)

  const config: Record<string, string> = {}
  data?.forEach(row => { config[row.key] = row.value })

  return NextResponse.json({
    videoUrl: config.tutorial_video_url ?? '',
    telegramLink: config.tutorial_telegram_link ?? '',
    whatsappLink: config.tutorial_whatsapp_link ?? '',
  })
}
