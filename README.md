# 🌿 Navjivan × LastPuff

> **Smart India Hackathon 2025** — Production-Grade SaaS AI-Powered Dual-Profile Health, Clinical Smoking Cessation & Athletic Conditioning Platform.

[![React Native](https://img.shields.io/badge/React%20Native-0.86.3-61DAFB?logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo SDK](https://img.shields.io/badge/Expo%20SDK-57-000020?logo=expo&logoColor=white)](https://expo.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-Backend-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb&logoColor=white)](https://mongodb.com/)
[![Google Gemini](https://img.shields.io/badge/GenAI-Gemini%202.5%20Flash-4285F4?logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![Vector DB](https://img.shields.io/badge/Vector%20DB-ChromaDB%20%2B%20Cosine%20RAG-8B5CF6)](https://www.trychroma.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%20(0%20errors)-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

---

## 🌟 Executive Summary

**Navjivan × LastPuff** is an enterprise-grade, full-stack SaaS wellness platform built specifically for the Indian demographic. Engineered from the ground up with solid dark elevation, strict micro-interactions, real MongoDB persistence, deterministic clinical decision engines, and RAG-grounded Gemini AI.

1. **🚭 LastPuff (Clinical Cessation Track)**:
   - Fagerström Tolerance Questionnaire with deterministic clinical dependence scoring (0–10)
   - Cold Turkey vs. 30-Day Gradual Reduction recommendation engine with weekly task structures
   - 24/7 SOS Craving Shield with 180s countdown and immediate cognitive disruption
   - Interactive 4-7-8 Pranayama Breathing game with real-time SVG expansion visualizer
   - Bubble Burst kinetic multi-touch distraction game with floating physics and XP rewards
   - Daily cigarette counter with active stepper and live log persistence
   - Actuarial Disease Risk Radar with pack-year exposure calculations and organ reversal timelines
   - Geofencing Radar with Google Maps dark theme, custom trigger zone creation, and proximity detection

2. **⚡ Navjivan (Athletic Conditioning & Vitality Track)**:
   - 34-question fitness onboarding with cardiovascular safety screening
   - Padyatra Virtual Pilgrimage across 3 historical trails (*Dandi Salt March*, *Golden Triangle*, *Kashi Corridor*)
   - Real step synchronization, milestone unlock celebrations, and cultural dispatch cards
   - Desi Macro & Nutrition Tracker with 1-tap Indian presets, AI meal analysis, and hydration stepper
   - FitSquads community accountability groups with member limits, shared goals, and live join workflows

3. **🤖 Agentic AI & RAG Copilot**:
   - Live Gemini 2.5 Flash clinical copilot with vector retrieval over WHO Cessation Guidelines, 5-4-3-2-1 grounding, and withdrawal timelines
   - Persistent chat history in MongoDB and local cache with action shortcut chips
   - Weekly autonomous agent reviews and daily streak monitoring powered by `node-cron`
   - Community Tribe feed with role-based filtering (All, Smokers, Fitness, Achievements) and optimistic likes

---

## 🎨 Design System & Aesthetic Standards

The platform strictly adheres to a **Solid Dark SaaS Aesthetic** with zero cheap glassmorphism or translucent cards:

| Token Category | Specification |
|---|---|
| **Backgrounds** | `#0D0D14` (Deep Canvas), `#14141F` (Surface), `#1C1C2A` (Elevated Surface), `#242435` (High Elevation) |
| **Borders** | `#2A2A3D` (Subtle 1px Borders), `#3A3A52` (Focused / Active Borders) |
| **Smoker Palette** | `#10B981` (Emerald), `#34D399` (Light Emerald), `rgba(16, 185, 129, 0.12)` (Tint) |
| **Fitness Palette** | `#8B5CF6` (Violet), `#A78BFA` (Light Violet), `rgba(139, 92, 246, 0.12)` (Tint) |
| **Iconography** | Strictly `lucide-react-native` (24px headers/nav, 20px content) |
| **Touch Targets** | 44×44px minimum touch targets across all interactive buttons |

---

## 📱 Architecture & User Flow

```mermaid
graph TD
    A[Launch / Splash] --> B{Role Branching}
    B -->|Smoker Path| C[5-Section Smoker Questionnaire]
    B -->|Fitness Path| D[6-Section Fitness Questionnaire]
    
    C --> E[Deterministic Cessation Scoring Engine]
    D --> F[Athletic Safety & Metabolic Readiness Engine]
    
    E --> G[Plan Recommendation & Weekly Structure]
    F --> G
    
    G --> H[(Tabs) Role-Aware Navigation]
    
    H --> H1[Home: Real Recovery Ticker & Daily Tasks]
    H --> H2[Quit Plan: Week Tasks & Cigarette Stepper]
    H --> H3[SOS Mode: 180s Timer & Interventions]
    H --> H4[Community Tribe & FitSquads]
    H --> H5[Analytics & Biometric SVG Charts]
    H --> H6[Profile & 3x3 Trophy Vault]
    
    H3 --> I[4-7-8 Breathing Game]
    H3 --> J[Bubble Burst Kinetic Game]
    H --> K[Gemini RAG Copilot Chatbot]
    H --> L[Padyatra Heritage Pilgrimage]
    H --> M[Disease Risk Actuarial Radar]
    H --> N[Nutrition & Desi Macro Logger]
```

---

## 🛠️ API & Endpoint Map

All endpoints are versioned under `/api/v1/*` with real database operations:

| Module | Route | Methods | Description |
|---|---|---|---|
| **System** | `/api/v1/health` | `GET` | Health status, uptime, and MongoDB connection status |
| **Auth** | `/api/v1/auth/signup` | `POST` | 2-step user registration with password hashing |
| | `/api/v1/auth/login` | `POST` | User authentication & JWT issuance |
| | `/api/v1/auth/me` | `GET` | Authenticated profile telemetry |
| **Questionnaire** | `/api/v1/questionnaire/submit` | `POST` | Saves responses & updates user profile |
| **Recommendation**| `/api/v1/recommendation/generate` | `POST` | Runs Fagerström clinical scoring & creates Plan |
| **Plans** | `/api/v1/plan/current` | `GET` | Current active cessation or fitness protocol |
| **Tasks** | `/api/v1/tasks/today` | `GET` | Today's action tasks with completion states |
| | `/api/v1/tasks/week` | `GET` | Full week task schedule |
| | `/api/v1/tasks/:id/complete` | `PUT` | Mark task completed and award XP |
| **Progress** | `/api/v1/progress/stats` | `GET` | Recovery metrics, money saved, and streak |
| | `/api/v1/progress/checkin` | `POST` | Daily check-in verification (+25 XP) |
| | `/api/v1/progress/log-craving` | `POST` | Record craving intensity and outcome (+100 XP) |
| | `/api/v1/progress/log-cigarettes` | `POST` | Log daily cigarette decrement |
| **Chat (RAG)** | `/api/v1/chat/message` | `POST` | Gemini 2.5 Flash RAG query over knowledge base |
| | `/api/v1/chat/history` | `GET`, `DELETE` | Retrieve or clear persistent message history |
| **Community** | `/api/v1/community/posts` | `GET`, `POST` | Feed with userType/postType filters & post creation |
| | `/api/v1/community/posts/:id/like` | `POST` | Toggle post like |
| **FitSquads** | `/api/v1/fitsquad` | `GET`, `POST` | List public squads or create new tribe |
| | `/api/v1/fitsquad/:id/join` | `POST` | Join an accountability tribe |
| **Geofencing** | `/api/v1/geofencing/hotspots` | `GET`, `POST` | Proximity query ($near) for smoking hotspots |
| | `/api/v1/geofencing/add-hotspot`| `POST` | Create custom trigger geofence |
| **Padyatra** | `/api/v1/steps/sync` | `POST` | Sync steps and advance on heritage trails |
| | `/api/v1/steps/padyatra` | `GET` | Route telemetry across Dandi, Golden Triangle, Kashi |
| **Nutrition** | `/api/v1/nutrition/log` | `POST` | Log meals, macros, and water intake |
| | `/api/v1/nutrition/today` | `GET` | Today's macro totals and meal breakdown |
| **AI Intelligence**| `/api/v1/ai/disease-risk` | `POST` | Actuarial disease risk calculation via Gemini |
| | `/api/v1/ai/daily-tip` | `GET` | Daily AI tip of the day |
| | `/api/v1/ai/analyze-meal` | `POST` | Indian meal nutrient analysis |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.0 or higher
- **MongoDB**: Local MongoDB or MongoDB Atlas URI
- **Google Gemini API Key**: from [Google AI Studio](https://aistudio.google.com/)
- **Expo CLI**: `npx expo`

### 2. Environment Configuration
Copy `.env.example` in both root and `lastpuff-backend/express-app/`:
```bash
cp .env.example lastpuff-backend/express-app/.env
```
Ensure the following variables are configured:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/lastpuff?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
CHROMA_URL=http://localhost:8000
VECTOR_DB_PROVIDER=chroma
```

### 3. Backend Execution
```bash
cd lastpuff-backend/express-app
npm install
node server.js
```
Verify backend health:
```bash
curl http://localhost:5000/api/v1/health
# Returns: { "status": "ok", "db": "connected" }
```

### 4. Frontend Execution
```bash
cd lastpuff-frontend
npm install
npx expo start -c
```
Press `w` for web, `a` for Android emulator, or scan the QR code with Expo Go on your mobile device.

### 5. Type Safety Check
```bash
cd lastpuff-frontend
npx tsc --noEmit
# Must exit cleanly with 0 errors
```

---

## 🛡️ License
Built for Smart India Hackathon (SIH) 2025. Proprietary and Open for Healthcare Innovation.
