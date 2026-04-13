import { Wallet } from 'lucide-react'
import { SiteNav } from '@/components/site-nav'
import { Button, Card, SoftPanel } from '@/components/ui/ui'

const demoTrades = [
  { pair: 'BTC/USDT', side: 'Buy', entry: '$84,010', pnl: '+$128', status: 'Open' },
  { pair: 'ETH/USDT', side: 'Sell', entry: '$4,205', pnl: '+$46', status: 'Closed' },
  { pair: 'SOL/USDT', side: 'Buy', entry: '$189.20', pnl: '-$22', status: 'Open' },
]

export default function SimulatorPage() {
  return (
    <div className="page">
      <SiteNav />
      <main className="container section split split-2">
        <div className="split">
          <Card><div className="card-pad"><div style={{display:'flex',justifyContent:'space-between',gap:16,flexWrap:'wrap'}}><div><div className="kicker">Demo Trading Simulator</div><h1 className="h2">Practice without risking real money.</h1></div><div className="pill">Demo balance: $10,000</div></div><div className="panel-soft mt-24 card-pad"><div className="chart-bars" style={{height:420}}>{[34,48,61,56,70,92,88,104,98,122,116,140,132,155].map((h,i)=><div key={i} className="chart-bar" style={{height:`${h * 2}px`}} />)}</div></div></div></Card>
          <Card><div className="card-pad"><div className="small" style={{display:'flex',gap:8,alignItems:'center'}}><Wallet size={15} /> Account Summary</div><div className="list mt-16">{[['Total P&L','+$152'],['Win Rate','67%'],['Trades Taken','12'],['Risk Score','Low']].map(([l,v])=><SoftPanel key={l} className="card-pad"><div style={{display:'flex',justifyContent:'space-between',gap:10}}><span className="small">{l}</span><strong style={{color:'#22d3ee'}}>{v}</strong></div></SoftPanel>)}</div></div></Card>
        </div>
        <div className="split">
          <Card><div className="card-pad"><div className="kicker">Trade Ticket</div><div className="list mt-16">{['Market: BTC/USDT','Side: Buy','Size: 0.25 BTC','Stop loss: -2%','Take profit: +4%'].map(t=><SoftPanel key={t} className="card-pad">{t}</SoftPanel>)}<Button>Place Demo Trade</Button></div></div></Card>
          <Card><div className="card-pad"><div className="kicker">Recent Demo Trades</div><div className="list mt-16">{demoTrades.map(trade=><SoftPanel key={trade.pair + trade.entry} className="card-pad"><div style={{display:'flex',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}><div><div style={{fontWeight:700}}>{trade.pair}</div><div className="small mt-16">{trade.side} at {trade.entry}</div></div><div style={{textAlign:'right'}}><div className="small">{trade.status}</div><div className={trade.pnl.startsWith('+') ? 'green mt-16' : 'red mt-16'}>{trade.pnl}</div></div></div></SoftPanel>)}</div></div></Card>
        </div>
      </main>
    </div>
  )
}
