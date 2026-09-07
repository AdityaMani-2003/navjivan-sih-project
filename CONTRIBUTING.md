# 🤝 Contributing to Navjivan × LastPuff

Thank you for contributing to the **Navjivan × LastPuff** project! This guide outlines the development standards, architecture rules, and pull request workflow.

---

## 📌 Development Philosophy & Code Quality

1. **Zero Errors**: Every file must compile cleanly. The CI/CD pipeline enforces `npx tsc --noEmit` on the frontend and syntax checks on the backend.
2. **TypeScript Strict Mode**: No untyped code or unnecessary `any` types.
3. **Design System Adherence**: Always use tokens from `constants/theme.ts` (`COLORS`, `TYPOGRAPHY`, `SPACING`, `RADIUS`, `SHADOWS`) and UI components from `components/ui/` (`GlassCard`, `GradientButton`, `ProgressRing`, `Badge`, `SectionHeader`).
4. **Graceful Fallbacks**: Every API call must be enclosed in try/catch with fallback states for offline usage.

---

## 🛠️ Local Environment Setup

### 1. Repository Setup
```bash
git clone https://github.com/AdityaMani-2003/navjivan-sih-project.git
cd navjivan-sih-project
```

### 2. Backend Server
```bash
cd lastpuff-backend/express-app
npm install
cp .env.example .env
node server.js
```

### 3. Frontend Mobile App
```bash
cd lastpuff-frontend
npm install
npx expo start
```

---

## 🧪 Pre-Commit Verification

Before submitting a pull request, run:

```bash
# Verify Frontend TypeScript Compilation
cd lastpuff-frontend
npx tsc --noEmit

# Verify Backend Syntax
cd ../lastpuff-backend/express-app
node --check server.js
```

---

## 🌿 Branching & PR Guidelines

- `feature/<feature-name>`: For new features or screen additions.
- `fix/<bug-name>`: For bug fixes and styling corrections.
- `docs/<doc-name>`: For documentation updates.

Submit all Pull Requests against the `main` branch with a clear description and screenshot/recording of changes.
