# Claude Resume Prompts — RinggitReady

Use these when starting a new Claude session mid-build.
Paste the relevant block into Claude (claude.ai or Copilot in VS Code).

---

## Starting GajiCheck from scratch

```
I'm building GajiCheck — a Malaysian net salary calculator — as part of a project called RinggitReady.

Stack: React + Vite + Tailwind CSS. Frontend only for now (no backend).

The app takes a gross monthly salary and calculates:
- EPF (11% employee, toggle for 9%)
- SOCSO (0.5%, capped at RM19.75)
- EIS (0.2%, capped at RM7.90)
- PCB (simplified — single, no children, based on LHDN tables)
- Net take-home (monthly + annual)

Component structure:
src/
├── App.jsx
├── components/
│   ├── SalaryInput.jsx
│   ├── DeductionBreakdown.jsx
│   ├── NetSalaryCard.jsx
│   └── Disclaimer.jsx
└── utils/
    ├── epf.js
    ├── socso.js
    ├── eis.js
    └── pcb.js

Help me build [COMPONENT/UTIL NAME].
```

---

## Resuming mid-feature

```
I'm continuing work on GajiCheck (Malaysian net salary calculator), part of RinggitReady.
Stack: React + Vite + Tailwind CSS.

I was working on: [describe what you were doing]

Here's the relevant code:
[paste file content]

The problem / next step is: [describe it]
```

---

## Debugging

```
GajiCheck — React + Vite + Tailwind.
I'm getting this error: [paste error]
In this file: [paste file]
Context: [what you were trying to do]
```

---

## Adding a new feature

```
GajiCheck is a Malaysian net salary calculator built with React + Vite + Tailwind.
It currently calculates EPF, SOCSO, EIS, PCB and shows net take-home.

I want to add: [feature description]
Relevant existing code: [paste if needed]
Keep it consistent with the existing component structure.
```

---

*Last updated: May 2026*
