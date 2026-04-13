'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/dashboard')
  }, [router])
  return (
    <div style={{ height: '100vh', background: '#070707', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F5C518', fontSize: 14 }}>
      Redirecting...
    </div>
  )
}