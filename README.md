# RinggitReady

> A suite of personal finance tools built for Malaysians — covering salary, EPF, LHDN, and investments.

---

## Vision

Most financial calculators online are built for the US or UK. RinggitReady is built specifically for the Malaysian context — EPF contribution rates, PCB tax tables, LHDN reliefs, and MYR-first thinking.

---

## Apps

| App | Description | Status |
|---|---|---|
| [`gaji-check`](./apps/gaji-check/) | Net salary calculator — gross to take-home after EPF, SOCSO, EIS, PCB | 🔨 In Progress |
| `epf-projector` | Retirement projection with EPF-aware contribution rates | 📋 Planned |
| `lhdn-estimator` | YA tax estimator — reliefs, chargeable income, estimated tax payable | 📋 Planned |
| `investment-tracker` | Aggregate StashAway + Versa + Moomoo + ASNB into one dashboard | 📋 Planned |

---

## Folder Structure

```
ringgit-ready/
├── README.md
├── apps/
│   ├── gaji-check/          ← Start here
│   ├── epf-projector/
│   ├── lhdn-estimator/
│   └── investment-tracker/
├── shared/
│   └── ui/                  ← Reusable React components across apps
├── docs/
│   └── decisions/           ← Architecture decision records
└── spikes/                  ← Throwaway experiments, no cleanup needed
```

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Backend (later) | .NET Core Minimal API |
| Database (later) | PostgreSQL → Azure |
| Hosting (later) | Azure Static Web Apps / App Service |
| CI/CD (later) | GitHub Actions |

---

## Getting Started

Each app is self-contained. Start with `gaji-check`:

```bash
cd apps/gaji-check
npm install
npm run dev
```

See [`apps/gaji-check/README.md`](./apps/gaji-check/README.md) for full setup and build notes.

---

## Working Rules

- No perfect code in spikes — get it running first
- One active app at a time — finish or kill before starting another
- Document non-obvious decisions in `/docs/decisions/`
- AI is a copilot, not the builder

---

*Last updated: May 2026*
