'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const G = {
  gold: '#F5C518',
  goldDim: 'rgba(245,197,24,0.10)',
  goldBorder: 'rgba(245,197,24,0.22)',
  bg: '#070707',
  bg2: 'rgba(255,255,255,0.03)',
  border: 'rgba(255,255,255,0.07)',
  muted: '#555',
  sec: '#888',
  text: '#e8e8e8',
}

function getEmbedSrc(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`
  const vimeo = url.match(/vimeo\.com\/(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`
  return null
}

function toWhatsappHref(value: string): string {
  if (!value) return ''
  if (value.startsWith('http')) return value
  return `https://wa.me/${value.replace(/[\s+\-()]/g, '')}`
}

function toTelegramHref(value: string): string {
  if (!value) return ''
  if (value.startsWith('http')) return value
  return `https://t.me/${value.replace('@', '')}`
}

export default function TutorialPage() {
  const router = useRouter()
  const [videoUrl, setVideoUrl] = useState('')
  const [telegramLink, setTelegramLink] = useState('')
  const [whatsappLink, setWhatsappLink] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/tutorial-config')
      .then(res => res.json())
      .then(data => {
        setVideoUrl(data.videoUrl ?? '')
        setTelegramLink(data.telegramLink ?? '')
        setWhatsappLink(data.whatsappLink ?? '')
      })
      .finally(() => setLoading(false))
  }, [])

  const embedSrc = videoUrl ? getEmbedSrc(videoUrl) : null

  return (
    <div style={{
      background: G.bg, minHeight: '100vh', color: G.text,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
    }}>
      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', height: 56, borderBottom: `1px solid ${G.border}`,
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(7,7,7,0.96)', backdropFilter: 'blur(24px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => router.push('/')}>
          <div style={{
            width: 32, height: 32, background: G.goldDim,
            border: `1px solid ${G.goldBorder}`, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
          }}>⚡</div>
          <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: '0.14em', color: G.gold }}>archespeak</span>
        </div>
      </nav>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '40px 20px 72px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 10, color: G.gold, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 10 }}>
            Getting Started
          </div>
          <h1 style={{ fontSize: 'clamp(24px, 6vw, 34px)', fontWeight: 900, letterSpacing: '-0.02em', margin: '0 0 12px' }}>
            Watch the tutorial, then continue.
          </h1>
          <p style={{ fontSize: 14, color: G.sec, lineHeight: 1.7, maxWidth: 420, margin: '0 auto' }}>
            A quick walkthrough of how archespeak works. Once you're done, pick a channel below to keep going.
          </p>
        </div>

        {/* Video */}
        <div style={{
          background: G.bg2, border: `1px solid ${G.border}`, borderRadius: 16,
          overflow: 'hidden', aspectRatio: '16 / 9', marginBottom: 32,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {loading ? (
            <span style={{ color: G.muted, fontSize: 13 }}>Loading…</span>
          ) : embedSrc ? (
            <iframe
              src={embedSrc}
              style={{ width: '100%', height: '100%', border: 'none' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : videoUrl ? (
            <video controls style={{ width: '100%', height: '100%' }} src={videoUrl} />
          ) : (
            <span style={{ color: G.muted, fontSize: 13 }}>Tutorial video coming soon</span>
          )}
        </div>

        {/* Continue options */}
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <div style={{ fontSize: 12, color: G.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Continue via
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <a
            href={telegramLink ? toTelegramHref(telegramLink) : undefined}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              padding: '15px 24px', borderRadius: 12, fontSize: 15, fontWeight: 800,
              background: telegramLink ? '#229ED9' : G.bg2,
              color: telegramLink ? '#fff' : G.muted,
              border: telegramLink ? 'none' : `1px solid ${G.border}`,
              cursor: telegramLink ? 'pointer' : 'not-allowed',
              pointerEvents: telegramLink ? 'auto' : 'none',
              textDecoration: 'none',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M9.417 15.181l-.397 5.584c.568 0 .814-.244 1.109-.537l2.663-2.545 5.518 4.041c1.012.564 1.725.267 1.998-.931L23.98 3.096c.399-1.816-.579-2.523-1.934-2.06L1.75 9.302c-1.708.667-1.688 1.62-.293 2.06l5.242 1.635 12.192-7.678c.575-.398 1.099-.178.667.223L9.417 15.181z"/></svg>
            Open Telegram
          </a>

          <a
            href={whatsappLink ? toWhatsappHref(whatsappLink) : undefined}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              padding: '15px 24px', borderRadius: 12, fontSize: 15, fontWeight: 800,
              background: whatsappLink ? '#25D366' : G.bg2,
              color: whatsappLink ? '#06210f' : G.muted,
              border: whatsappLink ? 'none' : `1px solid ${G.border}`,
              cursor: whatsappLink ? 'pointer' : 'not-allowed',
              pointerEvents: whatsappLink ? 'auto' : 'none',
              textDecoration: 'none',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.535 5.859L.057 23.428a.75.75 0 0 0 .906.919l5.687-1.494A11.934 11.934 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.718 9.718 0 0 1-4.953-1.354l-.355-.212-3.683.968.983-3.589-.232-.369A9.718 9.718 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/></svg>
            Open WhatsApp
          </a>
        </div>

        {!loading && !telegramLink && !whatsappLink && (
          <p style={{ textAlign: 'center', fontSize: 12, color: G.muted, marginTop: 16 }}>
            Contact options haven't been set up yet. Check back soon.
          </p>
        )}
      </div>
    </div>
  )
}
