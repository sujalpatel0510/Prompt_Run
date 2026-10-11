# KuberZ — Gen-Z 30-Day ₹10,000 Financial Engine & What-If Decision Simulator ⚡

> **PROMPT RUN Hackathon Submission**  
> *Transforming the ₹10,000 / 30-Day Budget Challenge into an Interconnected Consumer FinTech Experience.*

---

## 🚀 Overview

**KuberZ** is an interactive, consumer-grade personal finance application tailored for Gen Z college students and young professionals managing a limited **₹10,000 budget across 30 days**.

Traditional expense trackers are static logs that only tell you what you already lost. **KuberZ goes beyond basic tracking** by treating personal finance as a dynamic, interconnected ecosystem where every choice—from an iced latte to a weekend freelance gig—creates immediate, visible ripples across:

- **Liquid Cash Balance** vs. **Locked Reserves**
- **Safe Daily Allowance** (₹/day dynamically adjusted for remaining days)
- **Essential Commitments** (Wi-Fi, PG/Hostel dues, 5G recharge)
- **Recurring Subscriptions Burn** (Spotify, Netflix, AI tools)
- **Savings Goals** (Goa Trip, Emergency Cushion, Wireless Earbuds)
- **Financial Risk Level** (Safe, Moderate, High Risk, Critical/Cooked)
- **Financial Health Score (FHS 0–100)** with letter grades (S, A, B, C, F)
- **30-Day Solvency Forecast** (Surplus or Deficit Day countdown)

---

## 🌟 Flagship Feature: The What-If Decision Simulator

The application features a dedicated **What-If Sandbox** that allows users to test any financial decision **before spending a single rupee**:

1. **Instant Delta Comparison Matrix**:
   - Side-by-side view of **Current Reality** vs. **Simulated State**.
   - Displays real-time delta badges: `±₹ Balance`, `±₹ Daily Allowance/day`, `±pts Health Score`, and `±% Risk Meter Shift`.
2. **Consequence Forecast**:
   - Warns if a decision will trigger month-end cash exhaustion (e.g., *"Triggers a deficit by Day 23!"*).
   - Shows how discretionary spending delays target savings goals (e.g., *"Delays Goa Trip by 5 days"*).
3. **1-Click Presets & Custom Builder**:
   - Quick-test real-world Gen-Z scenarios:
     * *Late-Night Zomato Feast (₹480)*
     * *Cancel Netflix & Spotify (-₹208/mo recurring savings)*
     * *Weekend Freelance Gig (+₹1,800 inflow)*
     * *Music Concert Ticket (₹2,100)*
     * *Cook at Home for 4 Days (+₹400 saved)*
     * *Lock ₹800 into Goa Trip Goal*
4. **Commit to Reality**:
   - One click permanently commits the simulated scenario into the live budget with interactive audio and haptic feedback.

---

## 🛠️ Other Key Features

- **30-Day Interactive Timeline & Day Stepper**:
  - Interactive SVG Cashflow Trajectory Chart showing actual spend curve, projected runway, and the ₹0 danger line.
  - 30-day interactive calendar strip to inspect and travel between days.
  - "Advance to Next Day" button supporting regular living days or ₹0 frugal days.
- **Subscriptions & Commitments Vault**:
  - Track renewal dates and toggle/cancel subscriptions in 1 click to instantly recover daily allowance.
  - Manage essential monthly bills (Wi-Fi, PG rent share, Mobile recharge).
- **Smart Savings Goals with Vault Locks**:
  - Goals with progress rings and completion tracking.
  - Depositing funds into goals locks them from liquid spending.
  - Confetti celebration upon goal completion.
- **VibeCheck Gen-Z AI Roaster & Coach**:
  - Switch between **Savage Roaster** (*"Bestie you have ₹110/day left, a single boba will bankrupt you"*) and **Gentle Coach** (*"Meal-prep for 3 days to recover your buffer"*).
  - Contextual real-time financial tips based on your live health score and spending habits.
- **Wild Card Life Event Card Draw**:
  - Simulate unexpected real-world shocks (cracked phone screens, peer pressure birthday dinners, freelance windfalls, lucky cashback).
- **Preset Scenarios**:
  - Switch between: *Day 8 Realistic Student*, *Day 1 Fresh Start (₹10,000)*, *Day 15 Crisis Mode*, and *Frugal Monk*.
- **Tactile Web Audio Synthesizer**:
  - Synthesized native audio for clicks, coins, warnings, and success fanfares (zero external audio file dependencies).
- **Export & Share Report Card**:
  - Download or copy certified 30-day solvency health summaries.

---

## 💻 Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler & Tooling**: Vite 8
- **Styling**: Tailwind CSS v4 (fintech glassmorphism, light & dark themes via a header toggle)
- **Icons**: Lucide React
- **Animations & Effects**: Framer Motion, Canvas Confetti
- **Audio**: Web Audio API (Synthesized procedural sound effects)
- **Testing**: Vitest unit tests for the finance engine
- **Build**: 100% type-safe, zero compilation warnings, optimized production bundle.

---

## 🏃 Getting Started

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build production bundle
npm run build
```

## 🧪 Testing & Quality

```bash
npm test           # Vitest unit tests (finance engine)
npm run lint       # oxlint
npm run typecheck  # tsc --build
```
