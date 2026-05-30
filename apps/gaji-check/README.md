# GajiCheck — Net Salary Calculator

> Calculate your Malaysian take-home pay after EPF, SOCSO, EIS, and PCB deductions.

---

## What This Does

Input your gross monthly salary → see a full breakdown of:
- **EPF** — Employee contribution (11% default, optional 9%)
- **SOCSO** — Perkeso contribution (employee portion)
- **EIS** — Employment Insurance System
- **PCB** — Monthly tax deduction (Potongan Cukai Berjadual)
- **Net take-home** in MYR

---

## Setup

```bash
# From ringgit-ready root
cd apps/gaji-check

# Scaffold (run once)
npm create vite@latest . -- --template react
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

npm run dev
```

> App runs at http://localhost:5173

---

## Planned Component Structure

```
src/
├── App.jsx
├── components/
│   ├── SalaryInput.jsx        ← Gross salary + options (EPF rate, marital status)
│   ├── DeductionBreakdown.jsx ← Table showing each deduction line
│   ├── NetSalaryCard.jsx      ← Big take-home number, monthly + annual
│   └── Disclaimer.jsx        ← "Estimates only, not financial advice"
├── utils/
│   ├── epf.js                 ← EPF calculation logic
│   ├── socso.js               ← SOCSO table lookup
│   ├── eis.js                 ← EIS calculation
│   └── pcb.js                 ← PCB monthly tax table (this is the complex one)
└── constants/
    └── taxTables.js           ← 2024 PCB tables, SOCSO caps, EIS rates
```

---

## Calculation Reference

### EPF
- Employee: 11% of gross (or 9% optional)
- Employer: 13% (≤ RM5,000) or 12% (> RM5,000) — display only, not deducted from employee
- Capped contributions apply above RM100,000/month (edge case)

### SOCSO (Perkeso)
- Only applies to employees earning ≤ RM5,000/month for full scheme
- Employee rate: 0.5% of gross
- Capped at RM19.75/month (based on RM4,000 wage ceiling table)
- Reference: [SOCSO Contribution Table](https://www.perkeso.gov.my)

### EIS
- Employee: 0.2% of gross
- Capped at RM7.90/month (wage ceiling RM4,000)
- Reference: [EIS Contribution Table](https://www.perkeso.gov.my)

### PCB (Monthly Tax)
- Derived from LHDN's yearly tax table, divided monthly
- Varies by: gross salary, marital status, number of children
- Simplification for MVP: single, no children
- Reference: [LHDN PCB Calculator](https://calcpcb.hasil.gov.my)
- Stretch: Use the full PCB schedule from LHDN's published tables

---

## MVP Scope (Weekend 1)

- [x] Gross salary input
- [x] EPF deduction (11% / 9% toggle)
- [x] SOCSO deduction
- [x] EIS deduction
- [x] PCB estimate (simplified — single, no children)
- [x] Net take-home display (monthly + annual)
- [x] Clean, mobile-friendly UI

## Stretch Goals (Weekend 2+)

- [ ] Marital status + children inputs for accurate PCB
- [ ] Employer EPF contribution display
- [ ] Annual bonus calculator
- [ ] Compare two salary offers side-by-side
- [ ] Export breakdown as PDF
- [ ] Share link with pre-filled values

---

## Validation Criteria

This becomes a real project (not a spike) when:
- At least 1 person who isn't me says they'd use it, OR
- 100 unique visitors organically, OR
- RM1 in revenue (ads, tip jar, anything)

---

## Resume Prompt (use this with Claude)

Paste this when resuming work:

```
I'm building GajiCheck, a Malaysian net salary calculator as part of the RinggitReady suite.
Stack: React + Vite + Tailwind CSS.
Current task: [describe what you're working on]
Relevant file: [paste the file content]
```

---

*Last updated: May 2026*
