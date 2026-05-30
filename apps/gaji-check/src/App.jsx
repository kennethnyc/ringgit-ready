import { useState, useMemo } from 'react'
import { calculate } from './calculator'
import GrowSection from './GrowSection'
import MoreCalcs from './MoreCalcs'
import './App.css'

const fmt = (n) =>
  n.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const EPF_EMPLOYEE_MIN = 11
const EPF_EMPLOYER_MIN = 12

const employeeEPFOptions = Array.from({ length: 16 }, (_, i) => {
  const pct = EPF_EMPLOYEE_MIN + i
  return { value: String(pct / 100), label: `${pct}%${pct === EPF_EMPLOYEE_MIN ? ' (Statutory Min)' : ''}` }
})

const employerEPFOptions = Array.from({ length: 16 }, (_, i) => {
  const pct = EPF_EMPLOYER_MIN + i
  return { value: String(pct / 100), label: `${pct}%${pct === EPF_EMPLOYER_MIN ? ' (Statutory Min)' : pct === 13 ? ' (Salary ≤ RM5k)' : ''}` }
})

const NAV_ITEMS = [
  { key: 'salary', label: 'Salary Calculator', icon: '💼' },
  { key: 'grow',   label: 'Grow My Money',     icon: '📈' },
  { key: 'tools',  label: 'More Calculators',  icon: '🧮' },
]

function Field({ label, children }) {
  return (
    <div className="field">
      <label className="field-label">{label}</label>
      {children}
    </div>
  )
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div className="option-field">
      <label className="option-label">{label}</label>
      <div className="select-wrapper">
        <select className="option-select" value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <span className="select-arrow">▾</span>
      </div>
    </div>
  )
}

function DeductionRow({ label, amount, sub }) {
  return (
    <div className={`deduction-row ${sub ? 'sub' : ''}`}>
      <span className="deduction-label">{label}</span>
      <span className="deduction-amount">RM {fmt(amount)}</span>
    </div>
  )
}

export default function App() {
  const [page, setPage] = useState('salary')

  // Salary calculator state — kept here so data persists across page navigation
  const [grossInput, setGrossInput]               = useState('5000')
  const [bonus, setBonus]                         = useState('')
  const [taxCategory, setTaxCategory]             = useState('single')
  const [taxResident, setTaxResident]             = useState('yes')
  const [employeeEPFRate, setEmployeeEPFRate]     = useState(String(EPF_EMPLOYEE_MIN / 100))
  const [employerEPFRate, setEmployerEPFRate]     = useState(String(EPF_EMPLOYER_MIN / 100))
  const [socsoCategory, setSocsoCategory]         = useState('both')
  const [includeEIS, setIncludeEIS]               = useState('yes')
  const [allowableDeduction, setAllowableDeduction] = useState('')

  const result = useMemo(
    () =>
      calculate({
        grossMonthly: grossInput,
        bonus,
        taxCategory,
        taxResident: taxResident === 'yes',
        employeeEPFRate: parseFloat(employeeEPFRate),
        employerEPFRate: parseFloat(employerEPFRate),
        socsoCategory,
        includeEIS: includeEIS === 'yes',
        allowableDeduction,
      }),
    [grossInput, bonus, taxCategory, taxResident, employeeEPFRate, employerEPFRate, socsoCategory, includeEIS, allowableDeduction]
  )

  const empEPFLabel = `${(parseFloat(employeeEPFRate) * 100).toFixed(1).replace('.0', '')}%`
  const socsoLabel  = socsoCategory === 'both' ? '0.5%' : socsoCategory === 'injury-only' ? '0%' : '—'

  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">RM</span>
            <div>
              <h1 className="logo-title">GajiCheck</h1>
              <p className="logo-sub">Malaysian Net Salary Calculator</p>
            </div>
          </div>
          <span className="badge">{new Date().getFullYear()} Rates</span>
        </div>

        <nav className="nav">
          <div className="nav-inner">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                className={`nav-btn ${page === item.key ? 'active' : ''}`}
                onClick={() => setPage(item.key)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </nav>
      </header>

      {/* ── Pages ── */}
      {page === 'salary' && (
        <main className="main">
          <div className="inputs-col">
            <div className="card">
              <h2 className="card-title">Salary</h2>
              <Field label="Monthly Gross Salary (RM)">
                <div className="input-wrapper">
                  <span className="input-prefix">RM</span>
                  <input type="number" className="salary-input" value={grossInput} min="0" step="100"
                    onChange={(e) => setGrossInput(e.target.value)} placeholder="e.g. 5000" />
                </div>
              </Field>
              <Field label="Bonus (RM) — optional">
                <div className="input-wrapper">
                  <span className="input-prefix">RM</span>
                  <input type="number" className="salary-input" value={bonus} min="0" step="100"
                    onChange={(e) => setBonus(e.target.value)} placeholder="0" />
                </div>
              </Field>
            </div>

            <div className="card">
              <h2 className="card-title">Salary Options</h2>
              <div className="options-grid">
                <SelectField label="Tax Category" value={taxCategory} onChange={setTaxCategory}
                  options={[
                    { value: 'single', label: 'Single' },
                    { value: 'married-working', label: 'Married (Spouse Working)' },
                    { value: 'married-not-working', label: 'Married (Spouse Not Working)' },
                  ]} />
                <SelectField label="Employee EPF Rate" value={employeeEPFRate} onChange={setEmployeeEPFRate} options={employeeEPFOptions} />
                <SelectField label="Tax Resident" value={taxResident} onChange={setTaxResident}
                  options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No (Flat 30%)' }]} />
                <SelectField label="Employer EPF Rate" value={employerEPFRate} onChange={setEmployerEPFRate} options={employerEPFOptions} />
                <SelectField label="SOCSO Category" value={socsoCategory} onChange={setSocsoCategory}
                  options={[
                    { value: 'both', label: 'Employment Injury & Invalidity' },
                    { value: 'injury-only', label: 'Employment Injury Only' },
                    { value: 'none', label: 'Not Applicable' },
                  ]} />
                <SelectField label="EIS Contribution" value={includeEIS} onChange={setIncludeEIS}
                  options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]} />
              </div>
              <div className="field" style={{ marginTop: '1rem' }}>
                <label className="option-label">Allowable Deduction / Additional Relief (RM)</label>
                <div className="input-wrapper">
                  <span className="input-prefix">RM</span>
                  <input type="number" className="salary-input" value={allowableDeduction} min="0" step="100"
                    onChange={(e) => setAllowableDeduction(e.target.value)} placeholder="e.g. 2400 (lifestyle relief)" />
                </div>
              </div>
              <div className="disclaimer">
                <p>PCB uses standard individual relief (RM9,000) + EPF relief (max RM4,000/yr) + any allowable deduction entered. Actual tax may vary — consult LHDN for your full relief entitlements.</p>
              </div>
            </div>
          </div>

          <div className="results-col">
            <div className="net-card">
              {result.bonus ? (
                <>
                  <p className="net-label">Net Take-home This Month (incl. bonus)</p>
                  <p className="net-amount">RM {fmt(result.netSalary + result.bonus.net)}</p>
                  <p className="net-rate">RM {fmt(result.netSalary)} salary &nbsp;+&nbsp; RM {fmt(result.bonus.net)} bonus</p>
                </>
              ) : (
                <>
                  <p className="net-label">Monthly Net Salary</p>
                  <p className="net-amount">RM {fmt(result.netSalary)}</p>
                  <p className="net-rate">Effective deduction rate: {result.effectiveRate}%</p>
                </>
              )}
            </div>

            <div className="card breakdown-card">
              <h2 className="card-title">{result.bonus ? 'Breakdown — Bonus Month' : 'Breakdown'}</h2>

              <div className="deduction-row gross-row">
                <span className="deduction-label">Gross Salary</span>
                <span className="deduction-amount gross-amount">RM {fmt(result.gross)}</span>
              </div>
              {result.bonus && (
                <div className="deduction-row gross-row">
                  <span className="deduction-label">Bonus</span>
                  <span className="deduction-amount gross-amount">RM {fmt(result.bonus.gross)}</span>
                </div>
              )}
              {result.bonus && (
                <div className="deduction-row total-gross-row">
                  <span className="deduction-label">Total Gross</span>
                  <span className="deduction-amount gross-amount">RM {fmt(result.gross + result.bonus.gross)}</span>
                </div>
              )}

              <div className="divider" />
              <p className="section-label">Salary Deductions</p>
              <DeductionRow label={`EPF / KWSP (${empEPFLabel})`} amount={result.epf} sub />
              <DeductionRow label={`SOCSO / PERKESO (${socsoLabel})`} amount={result.socso} sub />
              <DeductionRow label={`EIS / SIP (${includeEIS === 'yes' ? '0.2%' : '—'})`} amount={result.eis} sub />
              <DeductionRow label="PCB / Income Tax" amount={result.pcb} sub />

              {result.bonus && (
                <>
                  <div className="divider" />
                  <p className="section-label">Bonus Deductions (EPF applies · SOCSO &amp; EIS do not)</p>
                  <DeductionRow label={`EPF / KWSP (${empEPFLabel})`} amount={result.bonus.epf} sub />
                  <DeductionRow label="PCB — incremental tax on bonus" amount={result.bonus.pcb} sub />
                </>
              )}

              <div className="divider" />
              <div className="deduction-row total-row">
                <span className="deduction-label">Total Deductions</span>
                <span className="deduction-amount total-amount">
                  − RM {fmt(result.bonus ? result.totalDeductions + result.bonus.totalDeductions : result.totalDeductions)}
                </span>
              </div>
              <div className="divider thick" />
              <div className="deduction-row net-row">
                <span className="deduction-label net-label-sm">{result.bonus ? 'Net Take-home' : 'Net Salary'}</span>
                <span className="deduction-amount net-amount-sm">
                  RM {fmt(result.bonus ? result.netSalary + result.bonus.net : result.netSalary)}
                </span>
              </div>

              <div className="epf-summary">
                <p className="epf-summary-title">EPF / KWSP Savings This Month</p>
                <div className="epf-summary-row">
                  <span>Your contribution ({empEPFLabel})</span>
                  <span>RM {fmt(result.epf + (result.bonus?.epf ?? 0))}</span>
                </div>
                <div className="epf-summary-row">
                  <span>Employer's contribution ({Math.round(parseFloat(employerEPFRate) * 100)}%)</span>
                  <span>RM {fmt(result.employer.epf + (result.bonus?.epfEmployer ?? 0))}</span>
                </div>
                <div className="epf-summary-row epf-summary-total">
                  <span>Total deposited to EPF</span>
                  <span>RM {fmt(result.epf + (result.bonus?.epf ?? 0) + result.employer.epf + (result.bonus?.epfEmployer ?? 0))}</span>
                </div>
              </div>
            </div>

            <div className="page-nudge">
              <p>Want to see how your EPF grows over time?</p>
              <button className="nudge-btn" onClick={() => setPage('grow')}>📈 Grow My Money →</button>
            </div>
          </div>
        </main>
      )}

      {page === 'grow' && (
        <GrowSection monthlyEPFTotal={result.epf + result.employer.epf} />
      )}

      {page === 'tools' && (
        <MoreCalcs grossSalary={result.gross} annualEPF={result.epf * 12} />
      )}

      <footer className="footer">
        <p>Built for Malaysia · Rates based on {new Date().getFullYear()} legislation · For reference only, not tax advice</p>
      </footer>
    </div>
  )
}
