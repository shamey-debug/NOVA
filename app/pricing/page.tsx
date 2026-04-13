import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

const plans = [
  {
    name: 'Starter',
    price: '$85',
    description: 'Minimum deposit to get started with any bot.',
    features: ['Access to all 3 bots', 'Live P&L dashboard', 'Deposit via BTC or USDT', 'Basic support'],
    cta: 'Get Started',
    featured: false,
  },
  {
    name: 'Growth',
    price: '$500',
    description: 'Higher capital, higher returns. Best value tier.',
    features: ['Everything in Starter', 'Priority deposit confirmation', 'Higher daily return potential', 'Dedicated support'],
    cta: 'Start Growing',
    featured: true,
  },
  {
    name: 'Elite',
    price: '$2,000+',
    description: 'For serious traders who want maximum exposure.',
    features: ['Everything in Growth', 'Custom P&L targets', 'VIP support', 'Early access to new bots'],
    cta: 'Go Elite',
    featured: false,
  },
]

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-20">
      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-16">
          <div className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Pricing</div>
          <h1 className="text-4xl font-bold mb-4">Simple deposit tiers.</h1>
          <p className="text-zinc-400 max-w-xl mx-auto">No subscriptions. No hidden fees. Deposit your capital, activate a bot, and let it work.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map(plan => (
            <div key={plan.name} className={`rounded-2xl p-8 flex flex-col gap-6 border ${plan.featured ? 'border-yellow-500/40 bg-yellow-500/5' : 'border-zinc-800 bg-zinc-900'}`}>
              {plan.featured && (
                <div className="text-xs text-yellow-400 font-bold uppercase tracking-widest">⭐ Most Popular</div>
              )}
              <div>
                <div className="text-sm text-zinc-400 mb-1">{plan.name}</div>
                <div className="text-4xl font-black text-white">{plan.price}</div>
                <p className="text-sm text-zinc-500 mt-2">{plan.description}</p>
              </div>
              <div className="flex flex-col gap-3 flex-1">
                {plan.features.map(f => (
                  <div key={f} className="flex items-center gap-3">
                    <CheckCircle2 size={16} className="text-cyan-400 flex-shrink-0" />
                    <span className="text-sm text-zinc-300">{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/signup"
                className={`text-center py-3 rounded-xl font-bold text-sm transition ${plan.featured ? 'bg-yellow-400 text-black hover:bg-yellow-300' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}>
                {plan.cta} →
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-zinc-600 text-sm mt-12">Minimum deposit is $85 · $1 network fee applies · Withdraw anytime</p>
      </div>
    </main>
  )
}