# ADR-001: GajiCheck — Initial Tech Decisions

**Date:** May 2026  
**Status:** Accepted

---

## Decision: Frontend-only MVP, no backend

**Context:** PCB calculation logic is complex but stateless. No user data needs to be persisted for v1.

**Decision:** Build as a pure React + Vite app. No backend, no database, no auth.

**Consequences:**
- Fast to build and deploy (Azure Static Web Apps or Vercel)
- PCB tables live in `src/constants/taxTables.js` — needs manual update if LHDN changes rates
- If we add user accounts or saved history later, introduce a .NET backend at that point

---

## Decision: Tailwind CSS for styling

**Context:** Need a clean, responsive UI fast. No design system yet.

**Decision:** Tailwind CSS utility-first. No component library for now (avoid MUI/shadcn overhead in a spike).

**Consequences:** Faster to prototype, slightly verbose JSX. Acceptable for spike stage.

---

## Decision: PCB simplified for MVP

**Context:** LHDN's full PCB table accounts for marital status, number of children, spouse income, and more. Implementing the full table is a weekend on its own.

**Decision:** MVP assumes single, no children. Add a disclaimer. Expand in v2.

**Reference:** https://calcpcb.hasil.gov.my

---

## Decision: SOCSO and EIS capped values hardcoded

**Context:** SOCSO and EIS have wage ceiling tables that change infrequently.

**Decision:** Hardcode the 2024 tables in `src/constants/taxTables.js`. Flag for annual review.

---
