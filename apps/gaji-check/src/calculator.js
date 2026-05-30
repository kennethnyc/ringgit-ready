const TAX_BRACKETS = [
  { min: 0,         max: 5000,     rate: 0.00, cumulative: 0 },
  { min: 5000,      max: 20000,    rate: 0.01, cumulative: 0 },
  { min: 20000,     max: 35000,    rate: 0.03, cumulative: 150 },
  { min: 35000,     max: 50000,    rate: 0.06, cumulative: 600 },
  { min: 50000,     max: 70000,    rate: 0.11, cumulative: 1500 },
  { min: 70000,     max: 100000,   rate: 0.19, cumulative: 3700 },
  { min: 100000,    max: 400000,   rate: 0.25, cumulative: 9400 },
  { min: 400000,    max: 600000,   rate: 0.26, cumulative: 84400 },
  { min: 600000,    max: 2000000,  rate: 0.28, cumulative: 136400 },
  { min: 2000000,   max: Infinity, rate: 0.30, cumulative: 528400 },
]

function calcAnnualTax(annualIncome) {
  if (annualIncome <= 0) return 0
  for (const bracket of TAX_BRACKETS) {
    if (annualIncome <= bracket.max) {
      return bracket.cumulative + (annualIncome - bracket.min) * bracket.rate
    }
  }
  return 0
}

const INDIVIDUAL_RELIEF = {
  single: 9000,
  'married-working': 9000,
  'married-not-working': 13000,
}

const round2 = (n) => Math.round(n * 100) / 100

export function calculate({
  grossMonthly,
  bonus = 0,
  taxCategory = 'single',
  taxResident = true,
  employeeEPFRate = 0.11,
  employerEPFRate = 0.12,
  socsoCategory = 'both',
  includeEIS = true,
  allowableDeduction = 0,
}) {
  const gross = parseFloat(grossMonthly) || 0
  const bonusAmt = parseFloat(bonus) || 0

  // ── Monthly salary deductions ──────────────────────────
  const epf = gross * employeeEPFRate
  const epfEmployer = gross * employerEPFRate

  const socsoWage = Math.min(gross, 5000)
  let socso = 0
  let socsoEmployer = 0
  if (socsoCategory === 'both') {
    socso = socsoWage * 0.005
    socsoEmployer = socsoWage * 0.0175
  } else if (socsoCategory === 'injury-only') {
    socso = 0
    socsoEmployer = socsoWage * 0.0125
  }

  const eisWage = Math.min(gross, 5000)
  const eis = includeEIS ? eisWage * 0.002 : 0
  const eisEmployer = includeEIS ? eisWage * 0.002 : 0

  // Monthly PCB is estimated from annual salary only (bonus has its own PCB)
  const epfRelief = Math.min(epf * 12, 4000)
  const personalRelief = INDIVIDUAL_RELIEF[taxCategory] ?? 9000
  const extraDeduction = parseFloat(allowableDeduction) || 0
  const totalRelief = epfRelief + personalRelief + extraDeduction

  let pcb = 0
  if (taxResident) {
    const annualSalaryOnly = gross * 12
    const taxableAnnual = Math.max(0, annualSalaryOnly - totalRelief)
    pcb = calcAnnualTax(taxableAnnual) / 12
  } else {
    pcb = (gross * 12 * 0.30) / 12
  }

  const totalDeductions = epf + socso + eis + pcb
  const netSalary = gross - totalDeductions

  // ── Bonus deductions (separate from monthly) ────────────
  // EPF applies to bonus. SOCSO and EIS do NOT apply to bonus (one-time payments).
  // PCB on bonus = incremental tax from adding bonus to annual income.
  let bonusResult = null
  if (bonusAmt > 0) {
    const bonusEPF = bonusAmt * employeeEPFRate
    const bonusEPFEmployer = bonusAmt * employerEPFRate

    let bonusPCB = 0
    if (taxResident) {
      const annualSalaryOnly = gross * 12
      const taxWithoutBonus = calcAnnualTax(Math.max(0, annualSalaryOnly - totalRelief))
      const taxWithBonus = calcAnnualTax(Math.max(0, annualSalaryOnly + bonusAmt - totalRelief))
      bonusPCB = taxWithBonus - taxWithoutBonus
    } else {
      bonusPCB = bonusAmt * 0.30
    }

    const bonusTotalDeductions = bonusEPF + bonusPCB
    const bonusNet = bonusAmt - bonusTotalDeductions

    bonusResult = {
      gross: round2(bonusAmt),
      epf: round2(bonusEPF),
      epfEmployer: round2(bonusEPFEmployer),
      pcb: round2(bonusPCB),
      totalDeductions: round2(bonusTotalDeductions),
      net: round2(bonusNet),
    }
  }

  const effectiveRate = gross > 0 ? (totalDeductions / gross) * 100 : 0

  return {
    gross: round2(gross),
    epf: round2(epf),
    socso: round2(socso),
    eis: round2(eis),
    pcb: round2(pcb),
    totalDeductions: round2(totalDeductions),
    netSalary: round2(netSalary),
    effectiveRate: Math.round(effectiveRate * 10) / 10,
    bonus: bonusResult,
    employer: {
      epf: round2(epfEmployer),
      socso: round2(socsoEmployer),
      eis: round2(eisEmployer),
      total: round2(epfEmployer + socsoEmployer + eisEmployer),
    },
  }
}
