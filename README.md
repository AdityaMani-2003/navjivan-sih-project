<div align="center">

# 🏆 LastPuff — SIH 2025 Winner

### *AI-Powered Wellness & Habit Transformation Platform*

[![Smart India Hackathon](https://img.shields.io/badge/🏆_SIH_2025-National_Winner-gold?style=for-the-badge&labelColor=1a1a2e)](https://www.sih.gov.in/)
[![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-77.8%25-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

<br/>

> **LastPuff** is an award-winning, AI-driven wellness companion that helps users break unhealthy habits and build sustainable, healthier lifestyles — recognized at India's premier national innovation challenge.

<br/>

---

</div>

## 📋 Table of Contents

- [🏅 About the Achievement](#-about-the-achievement)
- [✨ Key Features](#-key-features)
- [🏗️ System Architecture](#️-system-architecture)
- [🛠️ Tech Stack](#️-tech-stack)
- [📁 Project Structure](#-project-structure)
- [⚡ Getting Started](#-getting-started)
- [🔌 API Endpoints](#-api-endpoints)
- [👥 Team](#-team)
- [📄 License](#-license)

---

## 🏅 About the Achievement

<table>
<tr>
<td width="60">🏆</td>
<td><strong>Smart India Hackathon (SIH) 2025 — National Winner</strong></td>
</tr>
<tr>
<td>🇮🇳</td>
<td>Organized by the <strong>Government of India</strong> — India's largest open innovation platform</td>
</tr>
<tr>
<td>🎯</td>
<td>Selected from <strong>thousands of competing teams nationwide</strong> for innovation, scalability & real-world impact</td>
</tr>
<tr>
<td>🌍</td>
<td>Domain: <strong>Public Health & Wellness</strong> — Preventive healthcare & sustainable habit change</td>
</tr>
</table>

LastPuff began as a smoking-cessation solution and evolved into a **comprehensive health and fitness companion**. The platform stood out for its practical approach to **preventive healthcare**, combining AI-driven personalization with community support and real-time geofencing technology.

---

## ✨ Key Features

<table>
<tr>
<td align="center" width="25%">
<h3>🤖</h3>
<strong>Agentic AI Engine</strong>
<br/><sub>Personalized recommendations that adapt to individual user behavior using GenAI-powered insights</sub>
</td>
<td align="center" width="25%">
<h3>📊</h3>
<strong>Smart Dashboard</strong>
<br/><sub>Real-time analytics with streak tracking, health score metrics, and savings calculator</sub>
</td>
<td align="center" width="25%">
<h3>📍</h3>
<strong>Geofencing Alerts</strong>
<br/><sub>Location-aware notifications using expo-location & expo-task-manager for trigger zone avoidance</sub>
</td>
<td align="center" width="25%">
<h3>🆘</h3>
<strong>SOS Mode</strong>
<br/><sub>Instant craving intervention with guided breathing exercises and emergency coping strategies</sub>
</td>
</tr>
<tr>
<td align="center" width="25%">
<h3>🏋️</h3>
<strong>Fitness Plans</strong>
<br/><sub>Structured workout routines and wellness goals tailored to the user's recovery stage</sub>
</td>
<td align="center" width="25%">
<h3>👥</h3>
<strong>Community Hub</strong>
<br/><sub>Social feed with posts, comments, likes, and image sharing via Cloudinary integration</sub>
</td>
<td align="center" width="25%">
<h3>🔐</h3>
<strong>Secure Auth</strong>
<br/><sub>JWT-based authentication with bcrypt password hashing and protected API routes</sub>
</td>
<td align="center" width="25%">
<h3>📱</h3>
<strong>Cross-Platform</strong>
<br/><sub>Native Android & iOS experience built with React Native + Expo with haptic feedback</sub>
</td>
</tr>
</table>

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      LASTPUFF ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │              📱 MOBILE APP (React Native + Expo)         │   │
│   │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │   │
│   │  │Dashboard │ │Geofencing│ │Community │ │  Profile   │  │   │
│   │  │& Stats   │ │& Maps    │ │& Social  │ │  & Auth    │  │   │
│   │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └─────┬─────┘  │   │
│   │       │             │            │             │         │   │
│   │  ┌────┴─────────────┴────────────┴─────────────┴─────┐  │   │
│   │  │           Services Layer (Axios + API)             │  │   │
│   │  └───────────────────────┬───────────────────────────┘  │   │
│   └──────────────────────────┼──────────────────────────────┘   │
│                              │ HTTPS                            │
│   ┌──────────────────────────┼──────────────────────────────┐   │
│   │              🖥️ BACKEND (Node.js + Express)              │   │
│   │  ┌───────────────────────┴───────────────────────────┐  │   │
│   │  │              REST API Gateway                      │  │   │
│   │  └───────────────────────┬───────────────────────────┘  │   │
│   │       ┌──────────────────┼──────────────────┐           │   │
│   │  ┌────┴────┐  ┌─────────┴───────┐  ┌───────┴────────┐  │   │
│   │  │  Auth   │  │   Dashboard     │  │    Posts &      │  │   │
│   │  │ Routes  │  │   Controller    │  │    Comments     │  │   │
│   │  └────┬────┘  └─────────┬───────┘  └───────┬────────┘  │   │
│   │       │                 │                   │           │   │
│   │  ┌────┴─────────────────┴───────────────────┴────────┐  │   │
│   │  │     Middleware (JWT Auth + Multer Uploads)         │  │   │
│   │  └───────────────────────┬───────────────────────────┘  │   │
│   └──────────────────────────┼──────────────────────────────┘   │
│                              │                                  │
│   ┌──────────────────────────┼──────────────────────────────┐   │
│   │              💾 DATA & STORAGE LAYER                     │   │
│   │  ┌──────────────┐  ┌─────────────┐  ┌───────────────┐  │   │
│   │  │   MongoDB    │  │ Cloudinary  │  │ AsyncStorage  │  │   │
│   │  │  (Mongoose)  │  │  (Media)    │  │   (Local)     │  │   │
│   │  └──────────────┘  └─────────────┘  └───────────────┘  │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend (Mobile)
| Technology | Purpose | Version |
|:---|:---|:---|
| **React Native** | Cross-platform mobile framework | `0.81.5` |
| **Expo SDK** | Managed workflow & native modules | `54.x` |
| **TypeScript** | Type-safe development | `5.9.x` |
| **Expo Router** | File-based navigation | `6.x` |
| **React Native Reanimated** | Smooth 60fps animations | `4.1.x` |
| **React Native Maps** | Geofencing & map visualization | `1.20.x` |
| **Expo Location** | Background location tracking | `19.x` |
| **Expo Notifications** | Push notification alerts | `0.32.x` |
| **Expo Image Picker** | Camera & gallery integration | `17.x` |

### Backend (API Server)
| Technology | Purpose | Version |
|:---|:---|:---|
| **Node.js** | Server-side JavaScript runtime | `LTS` |
| **Express.js** | RESTful API framework | `4.22.x` |
| **MongoDB** | NoSQL document database | `Latest` |
| **Mongoose** | ODM for MongoDB | `8.20.x` |
| **JWT** | Stateless authentication tokens | `9.x` |
| **bcrypt.js** | Password hashing & verification | `2.4.x` |
| **Cloudinary** | Cloud-based media management | `2.8.x` |
| **Multer** | Multipart file upload handling | `2.0.x` |

### AI & Intelligence
| Technology | Purpose |
|:---|:---|
| **Agentic AI** | Autonomous habit analysis & personalized intervention |
| **Generative AI** | Context-aware wellness recommendations |
| **Geofencing AI** | Location-based trigger prediction & avoidance |

---

## 📁 Project Structure

```
LastPuff/
├── 📱 lastpuff-frontend/               # React Native + Expo Mobile App
│   ├── app/
│   │   ├── (tabs)/
│   │   │   ├── index.tsx               # Home Dashboard (streak, stats, savings)
│   │   │   ├── stats.tsx               # Detailed analytics & progress charts
│   │   │   ├── geofencing.tsx          # Location-based trigger zone mapping
│   │   │   ├── explore.tsx             # Wellness content & recommendations
│   │   │   └── profile.tsx             # User profile & settings
│   │   ├── auth/                       # Login & registration screens
│   │   ├── community/                  # Social feed & interactions
│   │   ├── goals.tsx                   # Goal setting & tracking
│   │   ├── sos.tsx                     # Emergency craving intervention
│   │   └── _layout.tsx                 # Root navigation layout
│   ├── components/
│   │   ├── PostCard.tsx                # Community post component
│   │   ├── Shine.tsx                   # Premium UI shine effect
│   │   ├── parallax-scroll-view.tsx    # Parallax scrolling container
│   │   └── ui/                         # Reusable UI primitives
│   ├── services/
│   │   ├── api.ts                      # HTTP client & interceptors
│   │   ├── dashboard.ts               # Dashboard data fetching
│   │   └── posts.ts                    # Community post CRUD operations
│   ├── context/                        # React Context providers
│   ├── hooks/                          # Custom React hooks
│   ├── constants/                      # App-wide constants & config
│   └── assets/                         # Images, fonts & static resources
│
├── 🖥️ lastpuff-backend/                # Node.js + Express API Server
│   └── express-app/
│       ├── server.js                   # Express app entry point
│       ├── config/                     # Database & app configuration
│       ├── controllers/
│       │   ├── AuthController.js       # User signup, login, token refresh
│       │   ├── dashboardController.js  # User stats, streaks & analytics
│       │   ├── post.controller.js      # Community posts CRUD + image upload
│       │   └── comment.controller.js   # Post comments & interactions
│       ├── models/
│       │   ├── User.js                 # User schema (auth, profile, habits)
│       │   ├── post.model.js           # Community post schema
│       │   └── comment.model.js        # Comment schema with references
│       ├── routes/
│       │   ├── authRoutes.js           # /api/auth/* endpoints
│       │   ├── dashboardRoutes.js      # /api/dashboard/* endpoints
│       │   ├── post.routes.js          # /api/posts/* endpoints
│       │   ├── comment.routes.js       # /api/comments/* endpoints
│       │   └── uploadTest.routes.js    # Media upload testing
│       ├── middlewares/                # JWT verification & request validation
│       └── utils/                      # Utility functions & helpers
│
└── 📄 README.md                        # Project documentation (you are here)
```

---

## ⚡ Getting Started

### Prerequisites

```bash
node >= 18.x
npm >= 9.x
MongoDB (local or Atlas)
Expo CLI
Android Studio / Xcode (for emulators)
```

### 1. Clone the Repository

```bash
git clone https://github.com/AdityaMani-2003/navjivan-sih-project.git
cd navjivan-sih-project
```

### 2. Backend Setup

```bash
cd lastpuff-backend/express-app

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, Cloudinary credentials

# Start development server
npm run dev
```

### 3. Frontend Setup

```bash
cd lastpuff-frontend

# Install dependencies
npm install

# Start Expo development server
npx expo start

# Run on Android
npx expo run:android

# Run on iOS
npx expo run:ios
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|:---|:---|:---|
| `POST` | `/api/auth/signup` | Register new user |
| `POST` | `/api/auth/login` | Authenticate & receive JWT |

### Dashboard
| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/api/dashboard/stats` | Fetch user statistics & streaks |
| `GET` | `/api/dashboard/analytics` | Get detailed health analytics |

### Community
| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/api/posts` | List all community posts |
| `POST` | `/api/posts` | Create new post (with image) |
| `PUT` | `/api/posts/:id/like` | Like/unlike a post |
| `DELETE` | `/api/posts/:id` | Delete own post |
| `POST` | `/api/comments` | Add comment to a post |
| `GET` | `/api/comments/:postId` | Get comments for a post |

---

## 👥 Team

This project was built as a collaborative effort by a dedicated team of developers for SIH 2025.

| Role | Contribution |
|:---|:---|
| **Full-Stack Development** | React Native mobile app, Express.js API, MongoDB data modeling |
| **AI/ML Integration** | Agentic AI engine, GenAI-powered personalization |
| **UI/UX Design** | Premium mobile interface, animations, haptic feedback |
| **DevOps & Testing** | Deployment pipeline, API testing, performance optimization |

---

## 🔮 Future Roadmap

- [ ] 🧠 Advanced ML model for relapse prediction
- [ ] ⌚ Wearable device integration (smartwatch heart rate monitoring)
- [ ] 🌐 Multi-language support (Hindi, Tamil, Bengali, and more)
- [ ] 📊 Weekly PDF health reports with AI-generated insights
- [ ] 🏥 Healthcare provider dashboard for clinical monitoring
- [ ] 🎮 Gamification system with badges and leaderboards

---

## 📄 License

This project was developed as part of the **Smart India Hackathon 2025** initiative by the Government of India.

---

<div align="center">

**Built with ❤️ for a healthier India**

[![SIH](https://img.shields.io/badge/Smart_India_Hackathon-2025-orange?style=flat-square)](https://www.sih.gov.in/)
[![Made with React Native](https://img.shields.io/badge/Made_with-React_Native-61DAFB?style=flat-square&logo=react)](https://reactnative.dev/)
[![Powered by AI](https://img.shields.io/badge/Powered_by-Agentic_AI-blueviolet?style=flat-square)](https://github.com/AdityaMani-2003/navjivan-sih-project)

*If you found this project interesting, please consider giving it a ⭐*

</div>
