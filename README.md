# Sungano

A React Native mobile app for trusted rotating savings circles and group savings goals.

## Overview

Sungano helps communities save together through:
- **Rounds** — Rotating savings circles (ajo/chama/susu) with payment proof and trust tracking
- **Goals** — Solo and group savings goals with milestone tracking and deposit history
- **Trust Score** — Reputation system based on payment consistency

## Design System

| Token | Value | Usage |
|---|---|---|
| `greenDeep` | `#1A7A4A` | Buttons, headers, active states |
| `greenAction` | `#2ECC71` | Success, milestones |
| `greenPale` | `#E8F8F0` | Card backgrounds |
| `greenSubtle` | `#C6EDD8` | Borders, dividers |
| `greenConfirm` | `#10B981` | Paid/confirmed states |
| `amber` | `#F59E0B` | Warning, grace period |
| `red` | `#EF4444` | Overdue, error |

**Fonts:** Fraunces (display/headings), DM Sans (body), JetBrains Mono (monetary amounts)

## Project Structure

```
sungano-app/
├── app/                    # Expo Router file-based routing
│   ├── _layout.tsx         # Root layout: font loading, SafeAreaProvider
│   ├── index.tsx           # App entry: splash → onboarding → main app
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── register.tsx
│   └── (app)/
│       ├── index.tsx       # Home tab
│       ├── rounds/
│       ├── goals/
│       └── profile.tsx
├── src/
│   ├── constants/
│   │   ├── theme.ts        # Colors, fonts, spacing
│   │   └── api.ts          # API endpoints
│   ├── types/
│   │   └── index.ts        # All TypeScript interfaces
│   ├── hooks/
│   │   ├── useAuth.ts      # Authentication state
│   │   ├── useRounds.ts    # Rounds data + actions
│   │   └── useGoals.ts     # Goals data + actions
│   ├── components/
│   │   ├── ui/             # Reusable UI primitives
│   │   ├── rounds/         # Round-specific components
│   │   ├── goals/          # Goal-specific components
│   │   └── brand/          # Logo, wordmark, pattern
│   ├── screens/            # Full screen components
│   └── navigation/         # Tab bar + app navigator
└── assets/
```

## Setup

### Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- iOS: Xcode + Simulator
- Android: Android Studio + emulator, or physical device with Expo Go

### Install & Run

```bash
cd sungano-app
npm install
npx expo start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan the QR code with **Expo Go** (iOS/Android) for physical device

### Demo

On the login screen tap **"Try Demo Account"** to sign in with mock data showcasing all features.

## Key Screens

| Screen | Description |
|---|---|
| Splash | Animated logo with Borromean rings pattern |
| Onboarding | 3-slide intro carousel |
| Login / Register | Phone + password auth |
| Home | Dashboard with trust ring, payment banners, rounds + goals overview |
| Round Detail | Cycle progress, recipient strip, member payment status, proof viewing |
| Proof Upload | Payment proof submission with fraud declaration |
| Goals Hub | All/Solo/Group filtered list with summary stats |
| Goal Detail | Ring progress, milestone strip, deposit schedule, member splits |
| Goal Deposit | Amount input with running total preview, proof attachment |
| Create Goal Flow | 6-step flow: type → details → schedule → account → members → review |
| Trust Score | Score ring, tier badge, stats grid, history timeline |

## Architecture Notes

- **Navigation**: Custom stack navigator in `src/navigation/AppNavigator.tsx` (not expo-router navigation hooks) to avoid router context requirements during development
- **State**: Local `useState` hooks with mock data — swap `useRounds.ts` / `useGoals.ts` to connect real API
- **Fonts**: Loaded once in `app/_layout.tsx` via `useFonts`, splash hidden after load
- **SVG**: All illustrations and the Borromean rings logo use `react-native-svg`
- **Animations**: `Animated` API for trust ring, goal ring, and progress bars

## Connecting a Real Backend

Replace mock implementations in:
- `src/hooks/useAuth.ts` — Call `/auth/login`, `/auth/register`, store JWT
- `src/hooks/useRounds.ts` — Fetch from `GET /rounds`, post to `POST /rounds/:id/payments`
- `src/hooks/useGoals.ts` — Fetch from `GET /goals`, post to `POST /goals/:id/deposits`

API base URL is in `src/constants/api.ts`.
