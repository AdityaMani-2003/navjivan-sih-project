# 📡 Navjivan × LastPuff API Documentation

Complete REST API documentation for the **Navjivan × LastPuff** backend server (`http://localhost:5000/api`).

All authenticated endpoints require an `Authorization: Bearer <jwt_token>` header.

---

## 🔐 1. Authentication (`/api/auth`)

### `POST /api/auth/signup`
Register a new user account with profile type.
- **Request Body**:
```json
{
  "name": "Aditya Sharma",
  "email": "aditya@example.com",
  "password": "Password123!",
  "userType": "smoker", // or "non-smoker"
  "age": 25,
  "height": 175,
  "weight": 70
}
```
- **Response**: `{ "token": "jwt...", "refreshToken": "jwt...", "user": { ... } }`

### `POST /api/auth/login`
Authenticate existing user.
- **Request Body**:
```json
{
  "email": "aditya@example.com",
  "password": "Password123!"
}
```
- **Response**: `{ "token": "jwt...", "refreshToken": "jwt...", "user": { ... } }`

### `PATCH /api/auth/profile`
Update user profile, smoker metrics, fitness targets, or emergency contact.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
  "userType": "smoker",
  "cigarettesPerDay": 10,
  "pricePerPack": 200,
  "smokerProfile": {
    "triggers": ["Chai", "Stress"],
    "quitStrategy": "gradual"
  },
  "emergencyContact": {
    "name": "Best Friend",
    "phone": "+919876543210"
  }
}
```

### `POST /api/auth/refresh-token`
Issue new access token using refresh token.
- **Request Body**: `{ "refreshToken": "jwt..." }`

---

## 🤖 2. Agentic AI & GenAI (`/api/ai`)

### `POST /api/ai/suggest-quit-plan`
Generate personalized 30-day smoking cessation protocol.
- **Request Body**: `{ "cigarettesPerDay": 12, "smokingYears": 4, "triggers": ["Chai"] }`

### `POST /api/ai/analyze-risk`
Compute organ disease pathology risks.
- **Request Body**: `{ "cigarettesPerDay": 12, "smokingYears": 4, "age": 25 }`

### `POST /api/ai/chat`
Conversational AI wellness copilot.
- **Request Body**:
```json
{
  "message": "I'm having a severe craving right now, what can I do?",
  "persona": "quit_smoking_coach" // or "fitness_coach"
}
```

### `POST /api/ai/fitness-plan`
Synthesize customized periodized workout routine.
- **Request Body**: `{ "goal": "weight_loss", "level": "intermediate", "daysPerWeek": 4 }`

### `POST /api/ai/confidence-script`
Generate mindset affirmation scripts for focus mode.
- **Request Body**: `{ "trigger": "Work Stress", "intensity": 8 }`

### `POST /api/ai/analyze-meal`
Gemini Vision multi-modal meal nutritional analysis.
- **Request Body**: `{ "imageBase64": "...", "mealDescription": "Dal Tadka and Roti" }`

### `POST /api/ai/goals-agent`
Run Agentic goal planner evaluation loop.

---

## 🚨 3. SOS Emergency & Cravings (`/api/sos`)

### `POST /api/sos/log-craving`
Log craving occurrence with severity.
- **Request Body**: `{ "intensity": 8, "trigger": "Chai Break", "notes": "Resisted using 4-7-8 breathing" }`

### `GET /api/sos/cravings-count`
Retrieve total count of resisted cravings.

---

## 📍 4. Geofencing & Hotspots (`/api/geofencing`)

### `GET /api/geofencing/hotspots`
Fetch nearby crowd-sourced smoking zones and safe areas.
- **Query Params**: `lat=28.6139&lng=77.2090&radius=5000`

### `POST /api/geofencing/hotspot`
Report a community smoking zone or safe landmark.
- **Request Body**:
```json
{
  "name": "Tea Stall Smoking Corner",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "category": "danger"
}
```

---

## 🚶 5. Steps & Padyatra (`/api/steps`)

### `POST /api/steps/sync`
Sync pedometer steps and distance.
- **Request Body**: `{ "steps": 8450, "distanceKm": 6.76, "caloriesBurned": 338 }`

### `GET /api/steps/padyatra`
Fetch user progress along Indian heritage routes (e.g. `dandi_march`, `char_dham`).

---

## 🥗 6. Nutrition (`/api/nutrition`)

### `POST /api/nutrition/log`
Log a meal with caloric and macronutrient values.
- **Request Body**:
```json
{
  "name": "Paneer Bhurji with 2 Rotis",
  "calories": 480,
  "protein": 24,
  "carbs": 52,
  "fats": 16,
  "mealType": "Lunch"
}
```

### `GET /api/nutrition/history`
Get paginated meal intake history.

---

## 🎯 7. Goals (`/api/goals`)

### `POST /api/goals/create`
Create a tracked micro-goal.
- **Request Body**: `{ "title": "Avoid 8 Cigs", "targetValue": 8, "unit": "cigs", "category": "Recovery" }`

### `GET /api/goals/my-goals`
Fetch user goals filtered by `?status=active` or `?status=completed`.

### `PATCH /api/goals/:id`
Update goal completion progress.

---

## 🛍️ 8. Rewards & Gamification (`/api/rewards`)

### `GET /api/rewards/xp`
Get user XP, current Level, and progress to next level.

### `POST /api/rewards/earn-xp`
Award XP for health actions.
- **Request Body**: `{ "amount": 50, "action": "craving_resisted" }`

### `GET /api/rewards/store`
List available Swadeshi brand coupons.

### `POST /api/rewards/redeem/:id`
Redeem XP for a partner promo code voucher.
