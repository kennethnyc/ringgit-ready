import { useState, useMemo } from 'react'
import './MoreCalcs.css'

// ── Shared helpers ────────────────────────────────────────────
const fmt = (n) => n.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtK = (n) => {
  if (n >= 1_000_000) return `RM ${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000)     return `RM ${(n / 1_000).toFixed(1)}K`
  return `RM ${fmt(n)}`
}

const TAX_BRACKETS = [
  { min: 0,        max: 5000,     rate: 0.00, cumulative: 0 },
  { min: 5000,     max: 20000,    rate: 0.01, cumulative: 0 },
  { min: 20000,    max: 35000,    rate: 0.03, cumulative: 150 },
  { min: 35000,    max: 50000,    rate: 0.06, cumulative: 600 },
  { min: 50000,    max: 70000,    rate: 0.11, cumulative: 1500 },
  { min: 70000,    max: 100000,   rate: 0.19, cumulative: 3700 },
  { min: 100000,   max: 400000,   rate: 0.25, cumulative: 9400 },
  { min: 400000,   max: 600000,   rate: 0.26, cumulative: 84400 },
  { min: 600000,   max: 2000000,  rate: 0.28, cumulative: 136400 },
  { min: 2000000,  max: Infinity, rate: 0.30, cumulative: 528400 },
]

function calcAnnualTax(income) {
  if (income <= 0) return 0
  for (const b of TAX_BRACKETS) {
    if (income <= b.max) return b.cumulative + (income - b.min) * b.rate
  }
  return 0
}

function CalcInput({ label, prefix, value, onChange, placeholder, min, max, step, type = 'number' }) {
  return (
    <div className="calc-field">
      <label>{label}</label>
      <div className="calc-input-wrap">
        {prefix && <span className="calc-prefix">{prefix}</span>}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          min={min} max={max} step={step}
        />
      </div>
    </div>
  )
}

function CalcSelect({ label, value, onChange, options }) {
  return (
    <div className="calc-field">
      <label>{label}</label>
      <div className="calc-input-wrap select">
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    </div>
  )
}

function InfoTip({ text }) {
  const [open, setOpen] = useState(false)
  return (
    <span className="infotip">
      <button
        className="infotip-btn"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen(o => !o)}
        aria-label="What does this mean?"
      >i</button>
      {open && <span className="infotip-box">{text}</span>}
    </span>
  )
}

function ResultCard({ label, value, sub, accent, info }) {
  return (
    <div className={`result-card ${accent ? 'accent' : ''}`}>
      <p className="result-label">
        {label}
        {info && <InfoTip text={info} />}
      </p>
      <p className="result-value">{value}</p>
      {sub && <p className="result-sub">{sub}</p>}
    </div>
  )
}

// ── 1. Home Loan ──────────────────────────────────────────────
function HomeLoanCalc({ grossSalary }) {
  const [price, setPrice]       = useState('400000')
  const [downPct, setDownPct]   = useState('10')
  const [rate, setRate]         = useState('4.00')
  const [tenure, setTenure]     = useState('30')

  const result = useMemo(() => {
    const P = parseFloat(price) || 0
    const dp = (parseFloat(downPct) || 10) / 100
    const loan = P * (1 - dp)
    const annualRate = (parseFloat(rate) || 4.35) / 100
    const r = annualRate / 12
    const n = (parseFloat(tenure) || 30) * 12
    if (loan <= 0 || r === 0) return null
    const monthly = loan * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1)
    const totalPay = monthly * n
    const totalInterest = totalPay - loan
    const stampDuty = loan <= 100000 ? loan * 0.01
      : loan <= 500000 ? 1000 + (loan - 100000) * 0.02
      : loan <= 1000000 ? 9000 + (loan - 500000) * 0.03
      : 24000 + (loan - 1000000) * 0.04
    const maxAffordable = grossSalary > 0 ? grossSalary / 3 : null
    const dsr = grossSalary > 0 ? (monthly / grossSalary) * 100 : null
    return { loan, monthly, totalPay, totalInterest, stampDuty, dsr, maxAffordable }
  }, [price, downPct, rate, tenure, grossSalary])

  return (
    <div className="calc-layout">
      <div className="calc-inputs">
        <CalcInput label="Property Price (RM)" prefix="RM" value={price} onChange={setPrice} placeholder="400000" step="10000" />
        <CalcSelect label="Down Payment" value={downPct} onChange={setDownPct}
          options={[{ value:'10', label:'10%' },{ value:'15', label:'15%' },{ value:'20', label:'20% (No MRTA req.)' },{ value:'30', label:'30%' }]} />
        <CalcInput label="Interest Rate % (p.a.)" prefix="%" value={rate} onChange={setRate} placeholder="4.00" step="0.05" min="1" max="15" />
        <CalcInput label="Loan Tenure (years)" prefix="yr" value={tenure} onChange={setTenure} placeholder="30" step="1" min="1" max="35" />
        <p className="calc-note">Stamp duty on loan agreement: RM {result ? fmt(result.stampDuty) : '—'}</p>
      </div>

      <div className="calc-results">
        {result ? (
          <>
            <ResultCard accent label="Monthly Instalment" value={`RM ${fmt(result.monthly)}`} sub={`Loan amount: RM ${fmt(result.loan)}`}
              info="This is how much you pay the bank every single month. Like a fixed subscription — you pay this same amount every month until the loan is fully settled, usually over 20–35 years." />
            <ResultCard label="Total Interest Paid" value={`RM ${fmt(result.totalInterest)}`}
              info="This is the extra money the bank charges you for lending you the money. It's on top of what you actually borrowed. The longer your loan tenure, the more interest you end up paying." />
            <ResultCard label="Total Payment" value={fmtK(result.totalPay)}
              info="This is the true total cost of your home — your original loan amount plus all the interest combined. For example, a RM400k loan might cost you RM650k in total by the time it's fully paid off." />
            {result.dsr !== null && (
              <div className={`dsr-bar ${result.dsr > 60 ? 'danger' : result.dsr > 40 ? 'warn' : 'ok'}`}>
                <p className="dsr-label">
                  Debt Service Ratio (DSR)
                  <InfoTip text="Banks use DSR to decide whether to approve your loan. It measures what percentage of your monthly salary goes towards paying debts (including this loan). Most Malaysian banks require DSR to be below 60–70%. If yours is too high, the bank may reduce your loan amount or reject the application." />
                </p>
                <div className="dsr-track">
                  <div className="dsr-fill" style={{ width: `${Math.min(result.dsr, 100)}%` }} />
                </div>
                <p className="dsr-value">
                  {result.dsr.toFixed(1)}% of gross salary
                  {result.dsr > 60 ? ' — may exceed bank limits' : result.dsr > 40 ? ' — manageable' : ' — comfortable'}
                </p>
              </div>
            )}
          </>
        ) : <p className="no-result">Enter property details to calculate.</p>}
      </div>
    </div>
  )
}

// ── 2. Car Loan ───────────────────────────────────────────────
function CarLoanCalc({ grossSalary }) {
  const [price, setPrice]     = useState('80000')
  const [downPct, setDownPct] = useState('10')
  const [rate, setRate]       = useState('3.0')
  const [tenure, setTenure]   = useState('7')

  const result = useMemo(() => {
    const P = parseFloat(price) || 0
    const dp = (parseFloat(downPct) || 10) / 100
    const loan = P * (1 - dp)
    const flatRate = (parseFloat(rate) || 3) / 100
    const years = parseFloat(tenure) || 7
    if (loan <= 0) return null
    const totalInterest = loan * flatRate * years
    const totalPay = loan + totalInterest
    const monthly = totalPay / (years * 12)
    const effectiveRate = flatRate * 1.85 // approx
    const dsr = grossSalary > 0 ? (monthly / grossSalary) * 100 : null
    return { loan, monthly, totalInterest, totalPay, effectiveRate, dsr }
  }, [price, downPct, rate, tenure, grossSalary])

  return (
    <div className="calc-layout">
      <div className="calc-inputs">
        <CalcInput label="Car Price (RM)" prefix="RM" value={price} onChange={setPrice} placeholder="80000" step="5000" />
        <CalcSelect label="Down Payment" value={downPct} onChange={setDownPct}
          options={[{ value:'10', label:'10% (Minimum)' },{ value:'15', label:'15%' },{ value:'20', label:'20%' },{ value:'30', label:'30%' }]} />
        <CalcSelect label="Flat Interest Rate (p.a.)" value={rate} onChange={setRate}
          options={[{ value:'2.5', label:'2.5% (New, promo)' },{ value:'3.0', label:'3.0% (New car avg)' },{ value:'3.5', label:'3.5%' },{ value:'4.0', label:'4.0% (Used car)' },{ value:'4.5', label:'4.5%' },{ value:'5.0', label:'5.0% (Used, older)' }]} />
        <CalcSelect label="Loan Tenure" value={tenure} onChange={setTenure}
          options={[{ value:'5', label:'5 years' },{ value:'7', label:'7 years' },{ value:'9', label:'9 years (Max)' }]} />
        <p className="calc-note">Malaysian car loans use flat rate. Effective rate ≈ {result ? (result.effectiveRate * 100).toFixed(1) : '—'}% p.a.</p>
      </div>

      <div className="calc-results">
        {result ? (
          <>
            <ResultCard accent label="Monthly Instalment" value={`RM ${fmt(result.monthly)}`} sub={`Loan amount: RM ${fmt(result.loan)}`} />
            <ResultCard label="Total Interest" value={`RM ${fmt(result.totalInterest)}`} />
            <ResultCard label="Total Payment" value={`RM ${fmt(result.totalPay)}`} />
            {result.dsr !== null && (
              <div className={`dsr-bar ${result.dsr > 30 ? 'danger' : result.dsr > 20 ? 'warn' : 'ok'}`}>
                <p className="dsr-label">% of Gross Salary</p>
                <div className="dsr-track">
                  <div className="dsr-fill" style={{ width: `${Math.min(result.dsr, 100)}%` }} />
                </div>
                <p className="dsr-value">{result.dsr.toFixed(1)}% — {result.dsr > 30 ? 'high commitment' : result.dsr > 20 ? 'moderate' : 'low'}</p>
              </div>
            )}
          </>
        ) : <p className="no-result">Enter car details to calculate.</p>}
      </div>
    </div>
  )
}

// ── 3. PTPTN ─────────────────────────────────────────────────
const PTPTN_SCHEDULE = [
  { maxSalary: 1000,   rate: 0 },
  { maxSalary: 2000,   rate: 0.02 },
  { maxSalary: 3000,   rate: 0.05 },
  { maxSalary: 4000,   rate: 0.08 },
  { maxSalary: 5000,   rate: 0.10 },
  { maxSalary: 6000,   rate: 0.12 },
  { maxSalary: 7000,   rate: 0.15 },
  { maxSalary: Infinity, rate: 0.20 },
]

function PTPTNCalc({ grossSalary }) {
  const [balance, setBalance]   = useState('30000')
  const [salary, setSalary]     = useState(String(grossSalary || ''))
  const [mode, setMode]         = useState('income')
  const [fixedPay, setFixedPay] = useState('300')

  // sync if salary prop changes and field hasn't been touched
  const effectiveSalary = parseFloat(salary) || parseFloat(grossSalary) || 0

  const result = useMemo(() => {
    const debt = parseFloat(balance) || 0
    const ujrahRate = 0.01 // 1% p.a. service charge
    if (debt <= 0) return null

    let monthly
    if (mode === 'income') {
      const bracket = PTPTN_SCHEDULE.find(b => effectiveSalary <= b.maxSalary)
      monthly = effectiveSalary * (bracket?.rate ?? 0.20)
      if (monthly < 150) monthly = 150 // PTPTN minimum RM150
    } else {
      monthly = parseFloat(fixedPay) || 150
    }

    if (monthly <= 0) return null

    // Simulate reducing balance with 1% p.a. ujrah
    const r = ujrahRate / 12
    let bal = debt, totalPaid = 0, months = 0
    while (bal > 0 && months < 600) {
      const interest = bal * r
      const principal = Math.min(monthly - interest, bal)
      if (principal <= 0) break
      bal -= principal
      totalPaid += monthly
      months++
    }
    const totalUjrah = totalPaid - debt
    const years = months / 12

    const discountedBalance = debt * 0.90 // 10% discount for direct debit (if applicable)

    return { monthly, months, years, totalPaid, totalUjrah, discountedBalance }
  }, [balance, effectiveSalary, mode, fixedPay])

  return (
    <div className="calc-layout">
      <div className="calc-inputs">
        <CalcInput label="Outstanding PTPTN Balance (RM)" prefix="RM" value={balance} onChange={setBalance} placeholder="30000" step="1000" />
        <CalcInput label="Monthly Gross Salary (RM)" prefix="RM" value={salary || String(grossSalary)} onChange={setSalary} placeholder="5000" step="100" />
        <CalcSelect label="Repayment Mode" value={mode} onChange={setMode}
          options={[{ value:'income', label:'Income-Based (PTPTN schedule)' },{ value:'fixed', label:'Fixed Monthly Amount' }]} />
        {mode === 'fixed' && (
          <CalcInput label="Fixed Monthly Payment (RM)" prefix="RM" value={fixedPay} onChange={setFixedPay} placeholder="300" step="50" min="150" />
        )}
        <div className="ptptn-tip">
          💡 Set up direct debit for a <strong>10% discount</strong> on your outstanding balance — you'd owe <strong>RM {result ? fmt(result.discountedBalance) : '—'}</strong> instead.
        </div>
      </div>

      <div className="calc-results">
        {result ? (
          <>
            <ResultCard accent label="Monthly Repayment" value={`RM ${fmt(result.monthly)}`}
              sub={mode === 'income' ? `Based on PTPTN income schedule` : 'Fixed amount'} />
            <ResultCard label="Time to Clear Debt" value={`${result.years.toFixed(1)} years`} sub={`${result.months} monthly payments`} />
            <ResultCard label="Total Ujrah (Service Charge)" value={`RM ${fmt(result.totalUjrah)}`} sub="At 1% p.a. on reducing balance" />
            <ResultCard label="Total Payment" value={`RM ${fmt(result.totalPaid)}`} />
          </>
        ) : <p className="no-result">Enter your PTPTN balance to calculate.</p>}
      </div>
    </div>
  )
}

// ── 4. Tax Relief ─────────────────────────────────────────────
const RELIEFS = [
  { key: 'epf',        label: 'EPF Contribution',             max: 4000,  auto: true },
  { key: 'lifeins',    label: 'Life Insurance Premium',        max: 3000,  auto: false },
  { key: 'medins',     label: 'Medical / Education Insurance', max: 3000,  auto: false },
  { key: 'education',  label: 'Education Fees (Self)',         max: 7000,  auto: false },
  { key: 'medical',    label: 'Medical Expenses',              max: 10000, auto: false },
  { key: 'lifestyle',  label: 'Lifestyle (Books, Internet, Electronics, Sports)', max: 2500, auto: false },
  { key: 'sspn',       label: 'SSPN (Education Savings)',      max: 8000,  auto: false },
  { key: 'ev',         label: 'EV Charging Facilities',        max: 2500,  auto: false },
]

function TaxReliefCalc({ grossSalary, annualEPF }) {
  const initValues = () => {
    const v = {}
    RELIEFS.forEach(r => { v[r.key] = r.key === 'epf' ? String(Math.min(annualEPF || 0, 4000)) : '' })
    return v
  }
  const [values, setValues] = useState(initValues)
  const [spouse, setSpouse]       = useState('no')
  const [children18, setChildren18]   = useState('0')
  const [childrenStudy, setChildrenStudy] = useState('0')

  const set = (key) => (val) => setValues(prev => ({ ...prev, [key]: val }))

  const result = useMemo(() => {
    const annualGross = (parseFloat(grossSalary) || 0) * 12
    const individual = 9000
    const spouseRelief = spouse === 'yes' ? 4000 : 0
    const childRelief = parseInt(children18 || 0) * 2000 + parseInt(childrenStudy || 0) * 8000

    let claimedRelief = 0
    const breakdown = RELIEFS.map(r => {
      const val = Math.min(parseFloat(values[r.key]) || 0, r.max)
      claimedRelief += val
      return { ...r, claimed: val }
    })

    const totalRelief = individual + spouseRelief + childRelief + claimedRelief
    const taxableIncome = Math.max(0, annualGross - totalRelief)
    const taxableNoRelief = Math.max(0, annualGross - individual)

    const annualTax = calcAnnualTax(taxableIncome)
    const annualTaxNoRelief = calcAnnualTax(taxableNoRelief)
    const taxSavings = annualTaxNoRelief - annualTax
    const monthlyPCB = annualTax / 12

    return { totalRelief, taxableIncome, annualTax, taxSavings, monthlyPCB, breakdown }
  }, [values, grossSalary, annualEPF, spouse, children18, childrenStudy])

  return (
    <div className="calc-layout relief-layout">
      <div className="calc-inputs relief-inputs">
        <p className="calc-note" style={{ marginBottom: '0.75rem' }}>Standard individual relief of RM9,000 is applied automatically.</p>

        {RELIEFS.map(r => (
          <div key={r.key} className="relief-row">
            <div className="relief-row-label">
              <span>{r.label}</span>
              <span className="relief-max">max RM {r.max.toLocaleString()}</span>
            </div>
            <div className="calc-input-wrap relief-input">
              <span className="calc-prefix">RM</span>
              <input
                type="number"
                value={values[r.key]}
                min="0" max={r.max} step="100"
                onChange={(e) => set(r.key)(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
        ))}

        <div className="relief-row">
          <div className="relief-row-label">
            <span>Spouse Relief</span>
            <span className="relief-max">RM 4,000</span>
          </div>
          <div className="calc-input-wrap select relief-input">
            <select value={spouse} onChange={e => setSpouse(e.target.value)}>
              <option value="no">No</option>
              <option value="yes">Yes (spouse not working)</option>
            </select>
          </div>
        </div>

        <div className="relief-row">
          <div className="relief-row-label">
            <span>Children under 18</span>
            <span className="relief-max">RM 2,000 each</span>
          </div>
          <div className="calc-input-wrap relief-input">
            <input type="number" min="0" max="10" value={children18} onChange={e => setChildren18(e.target.value)} placeholder="0" />
          </div>
        </div>

        <div className="relief-row">
          <div className="relief-row-label">
            <span>Children 18+ (studying)</span>
            <span className="relief-max">RM 8,000 each</span>
          </div>
          <div className="calc-input-wrap relief-input">
            <input type="number" min="0" max="10" value={childrenStudy} onChange={e => setChildrenStudy(e.target.value)} placeholder="0" />
          </div>
        </div>
      </div>

      <div className="calc-results">
        <ResultCard accent label="Estimated Monthly PCB" value={`RM ${fmt(result.monthlyPCB)}`} sub="After all reliefs applied" />
        <ResultCard label="Tax Savings vs No Reliefs" value={`RM ${fmt(result.taxSavings)} / yr`} sub={`RM ${fmt(result.taxSavings / 12)} per month`} />
        <ResultCard label="Total Relief Claimed" value={`RM ${(result.totalRelief).toLocaleString()}`} />
        <ResultCard label="Annual Taxable Income" value={`RM ${fmt(result.taxableIncome)}`} />
        <ResultCard label="Estimated Annual Tax" value={`RM ${fmt(result.annualTax)}`} />
      </div>
    </div>
  )
}

// ── Tab container ─────────────────────────────────────────────
const TABS = [
  { key: 'home-loan',   label: '🏠 Home Loan' },
  { key: 'car-loan',    label: '🚗 Car Loan' },
  { key: 'ptptn',       label: '🎓 PTPTN' },
  { key: 'tax-relief',  label: '💸 Tax Relief' },
]

export default function MoreCalcs({ grossSalary, annualEPF }) {
  const [active, setActive] = useState('home-loan')

  return (
    <section className="more-calcs">
      <div className="more-calcs-inner">
        <div className="more-calcs-header">
          <h2 className="more-calcs-title">More Calculators</h2>
          <p className="more-calcs-sub">Plan beyond your payslip.</p>
        </div>

        <div className="tab-bar">
          {TABS.map(t => (
            <button
              key={t.key}
              className={`tab-btn ${active === t.key ? 'active' : ''}`}
              onClick={() => setActive(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="tab-panel">
          {active === 'home-loan'  && <HomeLoanCalc grossSalary={grossSalary} />}
          {active === 'car-loan'   && <CarLoanCalc  grossSalary={grossSalary} />}
          {active === 'ptptn'      && <PTPTNCalc    grossSalary={grossSalary} />}
          {active === 'tax-relief' && <TaxReliefCalc grossSalary={grossSalary} annualEPF={annualEPF} />}
        </div>
      </div>
    </section>
  )
}
