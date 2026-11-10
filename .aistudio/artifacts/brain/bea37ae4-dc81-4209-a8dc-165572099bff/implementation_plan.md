# Capitec Card Payment Integration, Real Android VPN Key & Connection Optimizer

Architectural implementation plan for **SALVATION MAHUMANE VPN TOP SA** introducing authentic Capitec card payments directly routed to account `1707317036` (MS CT MAHUMANE), instant app-link code activation, high-latency "Improve Connection" South African route optimizer, and the native Android system status bar real VPN key (`🔑`) display.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Confirmed Payment & Activation Routing (Phase 1 User Clarifications)**:
> - **Capitec Bank Account**: Card payments route directly to admin income account:
>   - **Account Holder**: `MS CT MAHUMANE`
>   - **Account Number**: `1707317036`
>   - **Bank**: `Capitec Bank` (Branch Code: `470010`)
> - **Delivery Flow ("App link")**: Customers receive an instant in-app activation link (`?code=SALV-...`) and one-tap "Load & Connect" button directly in the checkout modal, coupled with an automated WhatsApp payment proof dispatch to `+27 63 824 9382` for admin income tracking.
> - **Real VPN Key Indicator (`🔑`)**: Matches native Android `android.net.VpnService` behavior by rendering an authentic top Android status bar with an active golden/cyan key icon (`🔑`) and status banner whenever the tunnel is live.

---

## 1. Overview & Core Concept

1. **Capitec Card & Bank Checkout ("App Link" Delivery)**:
   - When a user selects any data or unlimited plan (MTN & Telkom Unlimited, Cell C Premium, or 100GB/180GB packages), they can tap **"Pay with Card / Capitec"**.
   - Displays a secure Capitec payment voucher card with account holder **MS CT MAHUMANE** and account number **1707317036**.
   - Supports customer reference generation, proof upload/confirmation, and generates the single-phone locked access code with a direct **App Activation Link** (`https://applet-url/?code=SALV-...`) plus an instant **"Activate on This Phone"** button.
   - Automatically prepares a formatted WhatsApp receipt to `+27 63 824 9382` so the admin receives notification and income verification.
   - Admin Console is equipped with an **Income & Revenue Tracker** summarizing total ZAR collected to the Capitec account.

2. **Native Android Status Bar with Real VPN Key (`🔑`)**:
   - Recreates the authentic Android 14 status bar at the top of the mobile frame (time `13:11`, network indicator `4G VoLTE`, battery status).
   - When the VPN tunnel establishes (`CONNECTED`), a glowing Golden Key icon (`🔑`) animates into the status bar, exactly like native Android `VpnService` on Samsung/Xiaomi/Tecno devices.
   - Accompanied by a native Android VPN notification pull-down banner: `🔑 Salvation Mahumane VPN · Active tunnel to JNB-1 (10.84.x.x)`.

3. **High-Latency "Improve Connection" Card & Routing Optimizer**:
   - When round-trip ping exceeds threshold (> 45ms or cellular jitter), an **"⚡ Improve Connection"** recommendation card smoothly slides in below the telemetry stats.
   - Analyzes real-time South African mobile carrier conditions:
     - Suggests switching APN profiles (MTN `mydata.mtn.co.za` vs Telkom `telkom.internet` vs Vodacom direct tunnel).
     - Suggests shifting traffic between South African core nodes (Johannesburg JNB-1 vs Cape Town CPT-1 vs Durban DUR-1).
     - Features a 1-tap **"Optimize My Route"** action that re-benchmarks nodes and switches to the fastest path automatically.

---

## 2. User Experience & Visual Design

### Key User Flows

```
[ Plan Selector / Top Banner ]
           │
           ▼
[ "Pay with Card / Capitec" ] ──► [ Modal: MS CT MAHUMANE · 1707317036 ]
                                          │
                                          ├─► Copy Account / Pay via Banking App
                                          ├─► Click "Verify & Generate App Link"
                                          │
                                          ▼
                         [ Single-Phone SALV Code Generated ]
                                          │
                                          ├─► "Open App Link & Auto-Connect" (One-Tap)
                                          └─► "Notify Admin on WhatsApp (+27 63 824 9382)"
```

```
[ User Connects to VPN ]
           │
           ▼
[ Handshake Established ] ──► [ Real Android Status Bar Shows 🔑 Icon ]
                                          │
                                          ├─► Top Bar: "13:11  ●  4G+  🔑  12%"
                                          ├─► Active Banner: "🔑 VPN Tunnel Active"
                                          └─► Stadium Button: "🔑 CONNECTED"
```

```
[ High Latency / Network Jitter Detected (> 45ms) ]
           │
           ▼
[ "⚡ Improve Connection" Card Appears ]
           │
           ├─► Displays Carrier Health & Diagnostic Note (e.g. "MTN APN Congestion")
           └─► 1-Tap "Optimize Route" ──► Auto-switches to Lowest Latency SA Node
```

### Visual Identity & Theme Tokens
- **Theme**: Dark navy & void black cyber-infrastructure aesthetic (`#02050D`, `#060E21`, `#09152B`).
- **Capitec Brand Accents**: Deep Capitec navy (`#002B49`), electric cyan (`#00E5FF`), and Mastercard red/gold emblems.
- **Android System UI**: High-fidelity Android 14 status bar typography, crisp vector battery, cellular signal bars, and glowing Android VPN Key (`🔑`).
- **Status Indicator**: Golden-amber key (`#F59E0B`) with subtle radial pulse when tunnel encryption is engaged.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Direct Capitec Account Details (`1707317036` · `MS CT MAHUMANE`)**:
  - *Chosen Approach*: Embed the verified account details from the user's Capitec debit card screenshot directly into an interactive checkout card with instant copy-to-clipboard for Account Number (`1707317036`) and Branch (`470010`).
  - *Why*: Eliminates third-party payment gateway fees, avoids complex merchant approvals, and enables direct income into the admin's personal bank account.
- **Decision 2: App Link Code Activation**:
  - *Chosen Approach*: Upon completing or submitting card details, the app immediately provides a clickable in-app link (`?code=SALV-...`) and an "Apply Code & Connect" action that loads the code into the client engine without requiring manual typing.
  - *Why*: Directly honors the user's chosen "App link" answer and provides frictionless mobile onboarding.
- **Decision 3: Android Status Bar VPN Key (`🔑`) Integration**:
  - *Chosen Approach*: Integrate an Android system bar header at the top of the mobile viewport container that dynamically reveals the system Key icon `🔑` upon cryptographic handshake completion.
  - *Why*: Directly fulfills the user's request ("Show key 🔑 as a real VPN when I connect") and provides unmistakable visual reassurance of active tunnel encryption.
- **Decision 4: High Latency Diagnostic Card**:
  - *Chosen Approach*: Non-intrusive collapsible diagnostic alert that triggers when ping > 45ms or when packet jitter is measured, offering automated node re-routing.
  - *Why*: Solves South African mobile network congestion issues (load shedding, peak tower congestion) without interrupting active sessions.

---

## 4. Technical Architecture & Component Mapping

```
┌────────────────────────────────────────────────────────────────────────┐
│                   SALVATION MAHUMANE VPN TOP SA                        │
├────────────────────────────────────────────────────────────────────────┤
│ 📱 AndroidStatusBar.tsx (Clock, 4G, Battery, 🔑 Real VPN Key Icon)    │
│ 💬 WhatsAppTopBanner.tsx (+27 63 824 9382 / "Always Online 24/7")     │
│ 🌐 GlobeGraphic.tsx (South Africa Orbital Core Beacon)                 │
│ 📶 CarrierSelector.tsx (MTN / Telkom / Cell C / Vodacom)               │
│ 📊 StatsGrid.tsx (Upload, Download, Ping Latency, Virtual IP)          │
│ ⚡ ImproveConnectionCard.tsx (High-latency detection & Node Optimizer) │
│ 💳 CapitecPaymentModal.tsx (MS CT MAHUMANE · 1707317036 · App Link)    │
│ 🔘 ConnectButton.tsx (Stadium Capsule Button · 🔑 Connected State)     │
│ 📋 BottomNav.tsx (Home · Usage · Plans · Logs · Settings)              │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│               Client Services & Server Backend (server.ts)             │
├────────────────────────────────────────────────────────────────────────┤
│ • vpnEngine.ts: Latency monitoring, connection state & key event bus   │
│ • /api/vpn/verify-code: Single-phone lock check & trial verification   │
│ • /api/vpn/connect: Cryptographic handshake & virtual IP assignment   │
│ • /api/payments/capitec/create: Capitec order & app-link generation    │
│ • /api/admin/income: Total income analytics for admin console          │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Execution Strategy

1. **Android Status Bar & Real VPN Key**:
   - Create `src/components/AndroidStatusBar.tsx` displaying live device clock, network status, battery level, and dynamic `🔑` key icon when `connectionState === 'CONNECTED'`.
   - Update `src/components/ConnectButton.tsx` and `src/components/ActivePlanCard.tsx` to display the verified Android VPN Key badge.
2. **Capitec Card Payment Modal & App Link Delivery**:
   - Create `src/components/CapitecPaymentModal.tsx` displaying the Capitec card details for **MS CT MAHUMANE** (Account: `1707317036`, Branch: `470010`).
   - Add in-app link generation with one-tap activation and pre-formatted WhatsApp payment notification to `+27 63 824 9382`.
   - Add "Pay with Card / Capitec" buttons in `DataPlansList.tsx` for all data and duration plans.
3. **High-Latency Connection Optimizer**:
   - Create `src/components/ImproveConnectionCard.tsx` that monitors `telemetry.latencyMs` and renders smart South African routing recommendations when latency is elevated.
   - Implement "Optimize Route" logic in `vpnEngine.ts` to switch to the lowest latency node seamlessly.
4. **Backend Income & Payment Endpoints**:
   - Update `server.ts` to record paid card orders and track total admin income in `AdminConsole.tsx`.
5. **Verification**:
   - Run `compile_applet` and `lint_applet` together to verify flawless build and TypeScript compliance.
