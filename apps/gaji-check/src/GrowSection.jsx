import { useState, useMemo } from 'react'
import './GrowSection.css'

// ── Drop your referral links here ──────────────────────────────
const REFERRALS = {
  stashaway: { url: '#', code: '' },
  versa:     { url: '#', code: '' },
  moomoo:    { url: '#', code: '' },
  webull:    { url: '#', code: '' },
}
// ───────────────────────────────────────────────────────────────

const fmt = (n) =>
  n.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const fmtK = (n) => {
  if (n >= 1_000_000) return `RM ${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000)     return `RM ${(n / 1_000).toFixed(1)}K`
  return `RM ${fmt(n)}`
}

function projectEPF({ currentBalance, monthlyContribution, currentAge, retirementAge, annualRate }) {
  const months = Math.max(0, (retirementAge - currentAge) * 12)
  const r = Math.pow(1 + annualRate, 1 / 12) - 1
  if (r === 0) return currentBalance + monthlyContribution * months
  const fv =
    currentBalance * Math.pow(1 + r, months) +
    monthlyContribution * ((Math.pow(1 + r, months) - 1) / r)
  return Math.max(0, fv)
}

const PLATFORMS = [
  {
    key: 'stashaway',
    name: 'StashAway',
    tagline: 'Smart investing, on autopilot',
    type: 'Robo-Advisor',
    pitch: 'Globally diversified portfolios built for your risk appetite. Set it and forget it.',
    returns: '4–12% p.a. (risk-dependent)',
    risk: 'Low – High',
    color: '#0062ff',
    emoji: '📈',
  },
  {
    key: 'versa',
    name: 'Versa',
    tagline: 'Your money, always earning',
    type: 'Cash Management',
    pitch: 'Park your extra cash and earn more than a savings account — fully liquid, no lock-in.',
    returns: '~3.5–4% p.a.',
    risk: 'Very Low',
    color: '#7c3aed',
    emoji: '💰',
  },
  {
    key: 'moomoo',
    name: 'moomoo',
    tagline: 'Trade smarter, invest better',
    type: 'Stock Broker',
    pitch: 'Access Malaysian, US, HK and SG markets with competitive commissions and advanced tools.',
    returns: 'Market-dependent',
    risk: 'Medium – High',
    color: '#f97316',
    emoji: '🐄',
  },
  {
    key: 'webull',
    name: 'Webull',
    tagline: 'Commission-free trading',
    type: 'Stock Broker',
    pitch: 'Trade US and MY stocks with zero commission. Real-time data and powerful charting built in.',
    returns: 'Market-dependent',
    risk: 'Medium – High',
    color: '#06b6d4',
    emoji: '⚡',
  },
]

function PlatformCard({ p }) {
  const ref = REFERRALS[p.key]
  return (
    <div className="platform-card">
      <div className="platform-header" style={{ borderColor: p.color }}>
        <span className="platform-emoji">{p.emoji}</span>
        <div>
          <p className="platform-name" style={{ color: p.color }}>{p.name}</p>
          <p className="platform-type">{p.type}</p>
        </div>
      </div>
      <p className="platform-pitch">{p.pitch}</p>
      <div className="platform-stats">
        <div className="platform-stat">
          <span className="stat-label">Est. Returns</span>
          <span className="stat-value">{p.returns}</span>
        </div>
        <div className="platform-stat">
          <span className="stat-label">Risk Level</span>
          <span className="stat-value">{p.risk}</span>
        </div>
      </div>
      <a
        href={ref.url}
        target="_blank"
        rel="noopener noreferrer"
        className="platform-cta"
        style={{ background: p.color }}
      >
        Get Started {ref.code ? `· Use code ${ref.code}` : '→'}
      </a>
    </div>
  )
}

export default function GrowSection({ monthlyEPFTotal }) {
  const [currentBalance, setCurrentBalance] = useState('')
  const [currentAge, setCurrentAge] = useState('30')
  const [retirementAge, setRetirementAge] = useState('55')
  const [dividendRate, setDividendRate] = useState('5.5')

  const projection = useMemo(() => {
    const pmt = monthlyEPFTotal || 0
    const pv = parseFloat(currentBalance) || 0
    const age = parseInt(currentAge) || 30
    const retire = parseInt(retirementAge) || 55
    const rate = (parseFloat(dividendRate) || 5.5) / 100
    const years = Math.max(0, retire - age)
    const totalContributed = pmt * 12 * years
    const projected = projectEPF({ currentBalance: pv, monthlyContribution: pmt, currentAge: age, retirementAge: retire, annualRate: rate })
    const growth = projected - pv - totalContributed
    return { projected, totalContributed, growth, years }
  }, [monthlyEPFTotal, currentBalance, currentAge, retirementAge, dividendRate])

  return (
    <section className="grow-section">
      <div className="grow-inner">
        <div className="grow-header">
          <div>
            <h2 className="grow-title">Make Your Money Work Harder</h2>
            <p className="grow-sub">Your salary is a starting point — here's how to build on it.</p>
          </div>
        </div>

        {/* ── EPF Projection ── */}
        <div className="epf-projection-wrap">
          <div className="card projection-card">
            <h3 className="card-title">EPF Growth Projection</h3>
            <p className="projection-note">
              Based on RM {fmt(monthlyEPFTotal)} / month total EPF (you + employer).
            </p>

            <div className="projection-inputs">
              <div className="proj-field">
                <label>Current EPF Balance (RM)</label>
                <div className="proj-input-wrap">
                  <input
                    type="number"
                    placeholder="0"
                    value={currentBalance}
                    onChange={(e) => setCurrentBalance(e.target.value)}
                  />
                </div>
              </div>
              <div className="proj-field">
                <label>Current Age</label>
                <div className="proj-input-wrap">
                  <input
                    type="number"
                    min="18" max="70"
                    value={currentAge}
                    onChange={(e) => setCurrentAge(e.target.value)}
                  />
                </div>
              </div>
              <div className="proj-field">
                <label>Retire At</label>
                <div className="proj-input-wrap select-wrap">
                  <select value={retirementAge} onChange={(e) => setRetirementAge(e.target.value)}>
                    <option value="55">55 (Early)</option>
                    <option value="60">60 (Standard)</option>
                    <option value="65">65 (Extended)</option>
                  </select>
                </div>
              </div>
              <div className="proj-field">
                <label>EPF Dividend Rate</label>
                <div className="proj-input-wrap select-wrap">
                  <select value={dividendRate} onChange={(e) => setDividendRate(e.target.value)}>
                    <option value="4.5">4.5% (Conservative)</option>
                    <option value="5.5">5.5% (Historical Avg)</option>
                    <option value="6.0">6.0% (Optimistic)</option>
                    <option value="6.5">6.5% (Best Case)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="projection-results">
              <div className="proj-result-main">
                <p className="proj-result-label">Projected EPF at Age {retirementAge}</p>
                <p className="proj-result-value">{fmtK(projection.projected)}</p>
                <p className="proj-result-sub">in {projection.years} years</p>
              </div>
              <div className="proj-result-breakdown">
                <div className="proj-stat">
                  <span>Total contributed</span>
                  <span>{fmtK(projection.totalContributed)}</span>
                </div>
                <div className="proj-stat">
                  <span>Dividends earned</span>
                  <span className="proj-stat-green">{fmtK(Math.max(0, projection.growth))}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="invest-teaser">
            <div className="teaser-icon">💡</div>
            <h3>Got extra after expenses?</h3>
            <p>
              EPF is great, but it's locked until you're 55. The platforms below let you grow money
              that stays accessible — from low-risk cash management to global stock markets.
            </p>
            <p className="teaser-small">
              Even RM 100–200 a month invested consistently makes a meaningful difference over time.
            </p>
          </div>
        </div>

        {/* ── Platform Cards ── */}
        <div className="platforms-grid">
          {PLATFORMS.map((p) => <PlatformCard key={p.key} p={p} />)}
        </div>

        <p className="grow-disclaimer">
          Returns shown are estimates based on platform marketing materials and historical data. Past performance is not a guarantee of future returns. This is not financial advice.
        </p>
      </div>
    </section>
  )
}
