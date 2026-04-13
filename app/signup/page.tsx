'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Lock } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const steps = [
  'Create your account',
  'Fund your wallet',
  'Choose your bot',
  'Start trading',
]

export default function SignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignup = async () => {
    setError('')
    if (!fullName || !email || !password) {
      setError('All fields are required.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    const { error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    })
    setLoading(false)

    if (signupError) {
      setError(signupError.message)
      return
    }

    router.push('/dashboard')
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* LEFT — Form */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col gap-6">
          <div className="flex items-center gap-2 text-cyan-400 text-sm font-medium">
            <Lock size={14} />
            <span>Create Your Account</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">Start trading smarter.</h1>
            <p className="text-zinc-400 mt-2 text-sm">
              Sign up in seconds. Fund your wallet, pick a bot, and let it work.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-400">Full Name</label>
              <input
                type="text"
                placeholder="John Kamau"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-cyan-500 transition"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-400">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-cyan-500 transition"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-400">Password</label>
              <input
                type="password"
                placeholder="Min. 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-cyan-500 transition"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            onClick={handleSignup}
            disabled={loading}
            className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-semibold rounded-lg px-6 py-3 transition text-sm"
          >
            {loading ? 'Creating account...' : 'Create Account →'}
          </button>

          <p className="text-zinc-500 text-xs text-center">
            Already have an account?{' '}
            <a href="/login" className="text-cyan-400 hover:underline">
              Log in
            </a>
          </p>
        </div>

        {/* RIGHT — What happens next */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col gap-6">
          <div className="text-xs text-zinc-500 uppercase tracking-widest font-medium">
            What happens next
          </div>
          <h2 className="text-2xl font-bold">
            From signup to profit in 4 steps.
          </h2>
          <div className="flex flex-col gap-4 mt-2">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-4">
                <span className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <span className="text-sm text-zinc-300">{s}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-zinc-800 pt-6 flex flex-col gap-3 mt-2">
            {[
              'No trading experience needed',
              'Bots run 24/7 automatically',
              'Withdraw anytime',
              'Minimum deposit $85',
            ].map(item => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 size={16} className="text-cyan-400 flex-shrink-0" />
                <span className="text-sm text-zinc-400">{item}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  )
}