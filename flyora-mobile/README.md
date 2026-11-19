# FlyoraGo Mobile App ✈️📦

Official cross-platform mobile application for **FlyoraGo** — Global Peer-to-Peer Luggage Sharing & Parcel Delivery Network. Built with **React Native (0.88)** and **Expo SDK 58**.

---

## 🌟 Key Features

1. **Animated Brand Splash Screen**:
   - High-fidelity FlyoraGo logo glow and loading sequence.
2. **Authentication & Multi-Role Switching**:
   - Direct Email & Password authentication with JWT handling.
   - **One-tap Quick Demo Login** for **Sender Mode** and **Traveler Mode** (for instant previews).
   - Dynamic Persona switch without needing re-login.
3. **Flight Luggage Sharing (`TripsScreen`)**:
   - Browse international & domestic flight itineraries with available baggage weight (kg).
   - "List Your Flight" modal to post luggage capacity and set price per kg ($).
   - Escrow booking calculation modal.
4. **Parcel Delivery Marketplace (`ShipmentsScreen`)**:
   - Filter by parcel category (Electronics, Documents, Apparel, Medicines, Gifts).
   - Post package delivery requests with target delivery date and traveler bounty ($).
   - "Carry Package" instant match request.
5. **Bank-Grade Escrow Vault (`WalletScreen`)**:
   - Available balance, locked escrow vault balance, and lifetime earnings summary.
   - Interactive Add Funds (Deposit) and Withdraw Payout modals.
   - Comprehensive escrow transaction history logs.
6. **Identity & KYC Verification (`KycScreen`)**:
   - Government ID / Passport number submission.
   - Document upload & live face biometric check simulation.
   - Quick Demo toggle to simulate verified trust badge (4.95 rating).
7. **Direct Meetup Coordination (`ChatScreen`)**:
   - Real-time conversation view between travelers and senders.
   - Pinned Escrow security badge & delivery OTP handover confirmation.
   - Airport terminal quick-reply preset chips.
8. **Settings & Dynamic Server Endpoint (`ProfileScreen`)**:
   - Switch backend URL between Production (`https://api.flyorago.me`) and local emulator (`http://10.0.2.2:8000`).

---

## 🚀 Running the App

### 1. Start Metro Dev Server
```bash
cd flyora-mobile
npx expo start
```

### 2. Run on Devices / Emulators
- **Android Emulator**: Press `a` in the terminal, or run `npx expo start --android`
- **iOS Simulator** (macOS): Press `i` in the terminal, or run `npx expo start --ios`
- **Physical Device**: Scan the terminal QR code using the **Expo Go** app
- **Web Preview**: Press `w` in the terminal, or run `npx expo start --web`

### 3. Quality & Health Checks
```bash
npx expo-doctor       # 20/20 checks passed
npx tsc --noEmit      # Full TypeScript typecheck
```
