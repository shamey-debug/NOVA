import { CheckCircle2, Star } from 'lucide-react'
import { SiteNav } from '@/components/site-nav'
import { Button, Card, SoftPanel } from '@/components/ui/ui'

const pricing = [
  { name: 'Starter', price: 'Free', description: 'Perfect for first-time learners who want to understand the market before spending.', features: ['3 lessons', 'Market watchlist', 'Demo dashboard preview', 'Basic glossary'], cta: 'Start Free', featured: false },
  { name: 'Pro Academy', price: '$19/mo', description: 'Built for structured lessons, guided simulations, and premium learning tools.', features: ['Full lesson library', 'Demo trading simulator', 'Trade journal', 'Progress tracking', 'Private member area'], cta: 'Go Pro', featured: true },
  { name: 'Mentorship+', price: '$79/mo', description: 'For users who want live reviews, accountability, and a serious learning environment.', features: ['Everything in Pro', 'Weekly live review', 'Priority support', 'Private strategy room'], cta: 'Apply Now', featured: false },
]

export default function PricingPage() {
  return (
    <div className="page">
      <SiteNav />
      <main className="container section">
        <div className="section-head"><div className="kicker">Pricing</div><h1 className="h2">Free entry, premium learning, easy upgrade path.</h1><p className="lead">This model lets users enter freely, get value fast, and move up when they are ready for deeper learning and mentorship.</p></div>
        <div className="pricing-grid">
          {pricing.map(plan => <Card key={plan.name} className={`pricing-card ${plan.featured ? 'featured' : ''}`}><div>{plan.featured && <div className="badge"><Star size={14} /> Most Popular</div>}<div className="kicker mt-16">{plan.name}</div><div style={{fontSize:'2.4rem',fontWeight:700,marginTop:10}}>{plan.price}</div><p className="lead" style={{fontSize:'1rem'}}>{plan.description}</p><div className="list mt-24">{plan.features.map(feature => <SoftPanel key={feature} className="card-pad"><div style={{display:'flex',gap:10,alignItems:'flex-start'}}><CheckCircle2 size={16} color="#22d3ee" /><span>{feature}</span></div></SoftPanel>)}</div><div className="mt-24"><Button>{plan.cta}</Button></div></div></Card>)}
        </div>
      </main>
    </div>
  )
}
