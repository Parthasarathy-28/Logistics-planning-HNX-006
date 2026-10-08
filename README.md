# 🚚 ROUTERESCUE
> **Disruption-Aware Logistics Decision Support System**

RouteRescue helps logistics operations teams respond to unexpected delivery disruptions in real time. Unlike traditional navigation systems that focus strictly on point-to-point vehicle routing (*"How should this vehicle travel?"*), RouteRescue evaluates full operational context (*"What happens to all affected shipments, SLA deadlines, and alternative fleet resources when something goes wrong, and what should the operator do next?"*).

---

## 🎯 Decision Support Framework

RouteRescue strictly enforces a locked, 6-stage operational pipeline:

```
    WHAT CHANGED?
          ↓
   WHAT IS AFFECTED?
          ↓
    WHAT IS AT RISK?
          ↓
   WHAT SHOULD WE DO?
          ↓
    WHO APPROVES IT?
          ↓
WHAT DOES THE DRIVER DO NEXT?
```

---

## 🚨 Problem Statement

Logistics fleets encounter unpredictable events daily—engine breakdowns, flat tyres, accidents, heavy rainfall, floods, and road blockages. 

Existing fleet management tools present three core limitations:
1. **Isolated Navigation**: Navigation apps reroute a single vehicle without considering delivery SLA deadlines for individual customers.
2. **High Driver Friction**: Traditional disruption reporting requires filling out complex forms on tiny screens while on the road.
3. **Lack of Decision Intelligence**: Operators must manually cross-reference spreadsheets, available backup vehicles, and customer deadlines to figure out recovery actions.

---

## 💡 Solution Overview

RouteRescue transforms a driver's disruption report into an impact-aware, scored recovery plan with full operator control:

- **Driver Experience**: Ultra-simple, high-readability UI supporting **Voice (English, Tamil, Tanglish)**, **Tap**, or **Text** reporting.
- **Impact Cascade**: Visual dependency chain tracing **Disturbance → Route → Vehicle → Deliveries → SLA Deadline Risks**.
- **Risk Calculation**: Deterministic calculation comparing new projected ETAs against committed delivery deadlines.
- **Recovery Engine**: Generates 5 realistic recovery actions (Vehicle Swap, Reroute, Cargo Drone Dispatch, Reschedule, Cancel).
- **Scoring & Explainability**: Evaluates actions from 0–100 and generates data-driven explanations of *why* an action was recommended.
- **Owner Control**: Operations dashboard for 1-click **Accept**, **Reject**, or **Modify** actions and dispatching new plans to drivers.
- **Measurable Impact**: Displays **Before vs After** metrics (e.g. 48 min delay reduced to 10 min; 38 minutes potential delay avoided!).

---

## ✨ Key Features & Intelligence Modules

### 🎙️ 1. Multilingual Voice & Multimodal Disruption Reporting
- **Voice Language Support**: English (`en-IN`), Tamil (`ta-IN`), and mixed Tamil + English (Tanglish) speech recognition using the browser Web Speech API.
- **Confidence-Aware UI**: Displays simple confidence ratings (*High Confidence*, *Medium Confidence*, *Please Verify*).
- **Logistics Entity Extraction**: Automatically extracts Route (`R01`–`R05`), Disturbance Category (`Vehicle` / `Natural Disaster`), and Type (`Engine Issue`, `Accident`, `Flat Tyre`, `Flood`, etc.).
- **Explicit Driver Confirmation**: Displays a preview card showing the recognized transcript and extracted details before the driver explicitly confirms submission.
- **Multimodal Fallback**: Large, driver-friendly **Tap** buttons and simple **Text** input ensure reporting works even without microphone access.

### ⛓️ 2. Visual Disruption Cascade
- Visual dependency mapping:
  ```
  🚨 DISTURBANCE (Engine Issue)
         ↓
  🛣 ROUTE (Industrial Corridor R03)
         ↓
  🚚 VEHICLE (KA-04-ED-4004 / V04)
         ↓
  📦 DELIVERIES (D101 🔴, D102 🟡, D103 🟢)
         ↓
  ⚠️ DEADLINE RISK (D101 — 8 Minutes Overdue)
  ```

### ⏱️ 3. Deterministic Risk Engine
- Calculates projected ETA for each shipment: $\text{New ETA} = \text{Current ETA} + \text{Disruption Delay}$.
- Compares $\text{New ETA}$ against committed customer SLA deadline.
- Classifies risk levels (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) and generates human-readable risk explanations.

### 🧠 4. Recovery & Scoring Engine
- Generates 5 alternative recovery options:
  1. **CHANGE VEHICLE** (Reassign critical delivery D101 to standby vehicle V05)
  2. **NEW ROUTE** (Reroute V04 around disruption corridor)
  3. **USE DRONE** (Dispatch emergency cargo drone for high-priority payload D101)
  4. **RESCHEDULE** (Postpone lower-priority delivery D103)
  5. **CANCEL DELIVERY** (Cancel D101 to maintain remaining schedule)
- Evaluates options on a 0–100 scale considering delay overhead, SLA risk elimination, vehicle readiness, and operational penalty.
- Auto-recommends top-scoring action with data-driven explainability text.

### 👔 5. Owner Operations Control Dashboard
- Prominent **🚨 DISTURBANCE FOUND** alert card with vehicle, route, severity, time, and **"View Impact"** action.
- Interactive decision actions: **✓ Accept Action**, **✕ Reject**, **✎ Modify Action**.
- 1-click **"Send Plan to Driver"** dispatch.

### 🚚 6. Driver Execution & Lifecycle Tracking
- Driver dashboard receives **INCOMING NEW DELIVERY PLAN** banners in real time.
- **ACKNOWLEDGE & CONTINUE** button transitions plan status to `DRIVER_ACKNOWLEDGED` → `IN_PROGRESS`.
- **Mark Delivery Completed** button closes the lifecycle (`DELIVERY_COMPLETED`).

### 📊 7. Before vs After Impact Comparison
- Highlights measurable operational savings:
  - **BEFORE**: 48 min delay | 1 critical risk | 3 affected deliveries
  - **AFTER**: 10 min delay | 0 critical risks | 1 reassigned delivery
  - **SAVINGS**: **38 Minutes Potential Delay Avoided!**

### 🎛️ 8. What-If Scenario Simulation
- Interactive scenario modeling allowing operators to select 2h, 4h, 6h, or 8h disruption durations.
- Dynamically recalculates delays, SLA risks, and recommended actions.

### ⚡ 9. Hackathon Demo Mode
- **Load Demo**: 1-click button pre-loading the baseline Engine Issue scenario on Route R03 (Vehicle V04).
- **Reset Demo**: Restores SQLite database to clean baseline state.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React.js, Vite, JavaScript, Tailwind CSS (`@tailwindcss/vite`), Lucide Icons |
| **Backend** | Node.js, Express.js, REST APIs |
| **Database** | SQLite (`better-sqlite3`), Local persistent database |
| **Audio / Voice** | Browser Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`) |

*Note: RouteRescue is designed to run completely locally without cloud database dependencies.*

---

## 🏗️ Architecture & Data Flow

```
+------------------+         REST APIs          +------------------------+
|  DRIVER / OWNER  | <========================> |    EXPRESS BACKEND     |
|   REACT FRONTEND |                            |     SERVER (:5000)     |
+------------------+                            +------------------------+
         |                                                  |
         | (Web Speech / Tap)                               | (SQL Queries)
         v                                                  v
+------------------+                            +------------------------+
|  VOICE REPORTER  |                            |     SQLITE DATABASE    |
| & IMPACT CASADE  |                            |    (routerescue.db)    |
+------------------+                            +------------------------+
                                                            |
                                                            v
                                                +------------------------+
                                                | INTELLIGENCE ENGINES:  |
                                                |  • ImpactEngine        |
                                                |  • RiskEngine          |
                                                |  • RecoveryEngine      |
                                                |  • ScoringEngine       |
                                                +------------------------+
```

---

## 📁 Project Folder Structure

```
c:\Users\praga\OneDrive\Desktop\HACK\
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── appController.js       # Express controllers for auth, driver, owner, decision APIs
│   │   ├── db/
│   │   │   ├── database.js            # SQLite schema definition & column migrations
│   │   │   └── seed.js                # Seed script (5 Vehicles, 5 Routes, 10 Deliveries)
│   │   ├── engine/
│   │   │   ├── impactEngine.js        # Disturbance -> Route -> Vehicle -> Delivery dependency tracer
│   │   │   ├── riskEngine.js          # Deterministic ETA vs Deadline risk calculator
│   │   │   ├── recoveryEngine.js      # 5 alternative recovery action generator
│   │   │   └── scoringEngine.js       # 0-100 scoring engine & explainability generator
│   │   ├── routes/
│   │   │   └── api.js                 # REST API router endpoints
│   │   ├── utils/
│   │   │   └── transcriptParser.js    # Multilingual (English/Tamil/Tanglish) NLP parser
│   │   └── server.js                  # Express backend entry point (Port 5000)
│   ├── routerescue.db                 # Persistent SQLite database file
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx             # Top bar, role toggle, demo action buttons
│   │   │   ├── VisualCascade.jsx      # Live dependency cascade component
│   │   │   ├── BeforeAfterCard.jsx    # Comparative metrics card
│   │   │   ├── VoiceReporter.jsx      # Multilingual Web Speech reporter & confirmation modal
│   │   │   └── Toast.jsx              # Status notification toasts
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx          # 1-click seeded driver/owner login
│   │   │   ├── DriverDashboard.jsx    # Safety-first driver interface (Voice/Tap/Text)
│   │   │   ├── OwnerDashboard.jsx     # Situational awareness dashboard & active alerts
│   │   │   ├── DisturbanceDetailsPage.jsx # 5 core questions view
│   │   │   ├── ImpactAnalysisPage.jsx # Impact cascade & delivery risk breakdown table
│   │   │   ├── RecoveryDecisionPage.jsx # Recovery options, explainability, decision actions
│   │   │   └── SimulationPage.jsx     # What-If duration scenario testing
│   │   ├── services/
│   │   │   └── api.js                 # API client service
│   │   ├── App.jsx                    # Application container & page router
│   │   ├── index.css                  # Tailwind imports & custom animations
│   │   └── main.jsx
│   ├── vite.config.js                 # Vite configuration
│   └── package.json
└── README.md
```

---

## 🚀 How to Run the Application

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **npm** (v9+ recommended)

### 2. Start Backend API Server
```bash
cd backend
npm install
node src/server.js
```
*The backend server will start at `http://localhost:5000` and automatically initialize and seed `routerescue.db`.*

### 3. Start Frontend Development Server
In a separate terminal window:
```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1
```
*The frontend application will be accessible at `http://127.0.0.1:5173/`.*

---

## 🎬 Step-by-Step Demo Guide (End-to-End Test)

1. Open **[http://127.0.0.1:5173/](http://127.0.0.1:5173/)** in Google Chrome.
2. Click **"Load Demo"** in the top navigation bar to initialize the disruption scenario (*Engine Issue on Route R03 for Vehicle V04*).
3. **Driver View**:
   - Navigate to **Driver Dashboard**.
   - Select **🎙 VOICE** tab, pick **Tamil + English**, and click **🎙 REPORT BY VOICE** or select a test phrase (*"R03 route-la engine problem aayiduchu"*).
   - Review extracted logistics details and click **✓ Confirm & Send**.
4. **Owner View**:
   - Switch role to **Owner** in the top right corner or click **Owner Alerts**.
   - Observe the **🚨 DISTURBANCE FOUND** alert card.
   - Click **View Impact** to inspect the **Visual Disruption Cascade** and delivery SLA risk table (Delivery `D101` flagged as **CRITICAL** risk).
   - Click **GENERATE RECOVERY OPTIONS**.
   - Observe **Change Vehicle (Reassign D101 to V05)** recommended with a score of **100/100** and data-driven explainability.
   - Click **✓ Accept Action** → **Send Plan to Driver**.
5. **Completion**:
   - Switch back to **Driver Dashboard**.
   - View the **INCOMING NEW DELIVERY PLAN** banner (`Original: V04 → D101`, `New: V05 → D101`).
   - Click **ACKNOWLEDGE & CONTINUE** → **Mark Delivery Completed**.
   - Review **BEFORE VS AFTER** card showing **38 minutes potential delay avoided**.

---

## 👥 Hackathon Information

- **Project Name**: RouteRescue
- **Repository**: [Logistics-planning-HNX-006](https://github.com/Parthasarathy-28/Logistics-planning-HNX-006.git)
- **Concept**: Disruption-Aware Logistics Decision Support System
