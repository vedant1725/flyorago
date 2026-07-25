# Flyorago Frontend ✈️

> Premium Luggage Sharing Marketplace — Landing Page

Built with **React + TypeScript + Vite + Tailwind CSS** delivering a Google/Stripe-level UI.

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x

### Installation & Run

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

> **Tip:** Start the backend at `http://localhost:5000` first for full API integration (waitlist form).

---

## 📁 Project Structure

```
flyora-frontend/
├── public/
│   └── flyora-icon.svg           # Brand favicon
├── src/
│   ├── assets/
│   │   └── hero-woman.png        # AI-generated hero image
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx        # Multi-variant button
│   │   │   ├── Card.tsx          # Glass/elevated card
│   │   │   └── Badge.tsx         # Trust & status badges
│   │   ├── Header.tsx            # Sticky nav with glassmorphism
│   │   ├── Hero.tsx              # Hero + search card + image
│   │   ├── TrustBadges.tsx       # Trust indicator strip
│   │   ├── HowItWorks.tsx        # 5-step process flow
│   │   ├── WhyChoose.tsx         # Features grid (dark bg)
│   │   ├── PopularRoutes.tsx     # Route cards with city visuals
│   │   ├── Stats.tsx             # Animated stat counters
│   │   ├── CTASection.tsx        # Email waitlist + CTA
│   │   └── Footer.tsx            # Advanced footer
│   ├── constants/
│   │   ├── routes.ts             # Nav + route data
│   │   ├── stats.ts              # Platform stats
│   │   └── features.ts           # Features & steps data
│   ├── pages/
│   │   └── LandingPage.tsx       # Page composer
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css                 # Global styles + Tailwind
├── index.html                    # Entry HTML with SEO
├── package.json
├── tsconfig.json
├── vite.config.ts                # Vite config + API proxy
├── tailwind.config.js            # Brand design system
└── postcss.config.js
```

---

## 🎨 Design System

### Brand Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `flyora-navy` | `#0A1628` | Primary text, hero bg |
| `flyora-teal` | `#0D9488` | Primary brand color |
| `flyora-teal-light` | `#14B8A6` | Gradient end, highlights |
| `flyora-blue` | `#1B4FD8` | Secondary accent |

### Sections
1. **Header** — Sticky glass nav with scroll animation
2. **Hero** — Full-screen with woman image + glassmorphism search card
3. **Trust Badges** — KYC, Escrow, Global, On-time, Smart
4. **How It Works** — 5-step process with animated connector
5. **Why Choose** — Dark section with feature grid + app mockup
6. **Popular Routes** — JFK→LHR, CDG→DXB, SIN→SYD, YYZ→LHR
7. **Stats** — 50K+ users, 120+ countries, 250K+ shipments, 99.8%
8. **CTA Banner** — Email waitlist connected to backend
9. **Footer** — Full links + social + app download

---

## 🛠️ Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (port 5173) |
| `npm run build` | Build production bundle |
| `npm run preview` | Preview production build |
| `npm run lint` | Lint TypeScript files |

---

## 🔗 API Integration

The frontend connects to the backend via Vite proxy (`/api/*` → `http://localhost:5000`).

| Action | API Endpoint |
|--------|-------------|
| Waitlist signup | `POST /api/waitlist` |

---

## 📦 Tech Stack

- **Framework:** React 18
- **Language:** TypeScript 5
- **Build Tool:** Vite 5
- **Styling:** Tailwind CSS 3
- **Icons:** Lucide React
- **Font:** Inter (Google Fonts)

---

*Flyorago — Your Journey Carries More Than You.*
