import { PlayCircle } from 'lucide-react'
import { SiteNav } from '@/components/site-nav'
import { Button, Card, SoftPanel } from '@/components/ui/ui'

export default function LessonPage() {
  return (
    <div className="page">
      <SiteNav />
      <main className="container section split split-3">
        <Card><div className="card-pad"><div className="eyebrow"><PlayCircle size={14} /> Lesson Preview</div><h1 className="h2">How to read candles and market structure.</h1><p className="lead">This lesson page keeps things simple: video or chart explanation at the top, plain-English notes below, and clear next steps so users do not get lost.</p><div className="panel-soft mt-24 card-pad"><div className="center-box"><div><div className="brand-badge" style={{margin:'0 auto',width:64,height:64,borderRadius:999}}><PlayCircle size={30} /></div><div style={{fontSize:'1.4rem',fontWeight:700,marginTop:16}}>Video / Chart Explainer Area</div><div className="small mt-16">Fast lesson block with notes, walkthroughs, and annotations.</div></div></div></div><div className="market-grid mt-24" style={{gridTemplateColumns:'1fr 1fr'}}>{['A green candle shows price moved up during that time period.','Long wicks often show rejection or indecision.','Never enter a trade because price is moving fast alone.','Look for confirmation, not excitement.'].map(t=><SoftPanel key={t} className="card-pad">{t}</SoftPanel>)}</div></div></Card>
        <div className="split">
          <Card><div className="card-pad"><div className="kicker">Lesson Actions</div><div className="list mt-16"><Button>Mark as Complete</Button><Button href="/simulator" outline>Practice In Simulator</Button></div></div></Card>
          <Card><div className="card-pad"><div className="kicker">Next Lessons</div><div className="list mt-16">{['Support & Resistance','Risk-to-Reward','Stop Loss Basics'].map(t=><SoftPanel key={t} className="card-pad">{t}</SoftPanel>)}</div></div></Card>
        </div>
      </main>
    </div>
  )
}
