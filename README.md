# VocaLNQ - English Vocabulary Flashcards

> A simple, mobile-first full-stack Next.js web app for learning English vocabulary with flashcards.

---

## 🚀 Key Features

1. **Full-Stack Next.js Architecture**:
   - Modern App Router & Route Handlers (`/api/words`, `/api/auth/*`, `/api/progress`).
   - Server-Side Rendering (SSR) reading directly from local SQLite with near-instant loading.
   - Decoupled Clean Architecture with **Zustand** state engine for atomic re-renders and smooth UI.

2. **SQLite Database**:
   - Manages 1,265+ Cambridge & IELTS vocabulary words with relational 1:N schema (Categories ➔ Topics ➔ Words).
   - User account system (`users`) with secure Scrypt hashing and JWT sessions.
   - Real-time learning progress synchronization (`progress`).

3. **Interactive Learning Experience**:
   - **Flashcards**: 3D perspective flip card, touch swipe gestures, keyboard navigation (`↓` to flip, `←`/`→` to navigate), pronunciation, and copyable example sentences.
   - **Quiz Engine**: 4-choice algorithmic multiple-choice test (EN ➔ VI, VI ➔ EN, Mixed), streak counter, and celebratory confetti effects.
   - **Dictionary**: Instant search, Part-of-Speech filters (noun, verb, adj, adv), and Mastered/Learning status toggling.
   - **Telemetry & Stats**: Progress tracking across all units with adjustable speech synthesis velocity.
   - **Web Audio API**: Browser-synthesized sound effects (tap, flip, chime, correct, error) with zero external asset overhead.

---

## 🛠️ Quick Start & Local Development

### 1. Install dependencies:
```bash
npm install
```

### 2. Seed SQLite database:
```bash
npm run seed
```

### 3. Start the application:

#### Option A: Quick Launch at http://localhost:1234 (Recommended)
```bash
npm run local
```
Or directly run the helper scripts:
- **Windows (CMD / Double-click)**: `.\scripts\start_localhost_1234.bat`
- **PowerShell**: `.\scripts\start_localhost_1234.ps1`

#### Option B: Default Development Server (Port 3000)
```bash
npm run dev
# Open http://localhost:3000
```

#### Option C: Production Build & Run
```bash
npm run build
npm run start
```

---

## 📁 Project Structure

```text
├── public/                 # Static public assets (icons, fonts)
├── scripts/                # Utility scripts (database seeding, local runner)
│   ├── seed.js             # SQLite database initializer and seed script
│   ├── words.sql           # Normalized vocabulary SQL dump (1,265 words)
│   ├── start_localhost_1234.bat
│   └── start_localhost_1234.ps1
├── src/
│   ├── app/                # Next.js App Router (pages & API routes)
│   │   ├── api/            # Route handlers (auth, words, progress)
│   │   ├── layout.tsx      # Root HTML layout & fonts
│   │   └── page.tsx        # SSR entry point
│   ├── domain/             # Pure TypeScript domain entities & business logic
│   │   ├── entities/       # Domain models (Word, Category, Quiz, User)
│   │   └── engines/        # Filter & Quiz algorithms (Fisher-Yates, distractors)
│   ├── infrastructure/     # External adapters & device I/O
│   │   ├── api/            # Typed HTTP API clients (wordApi, authApi, progressApi)
│   │   ├── device/         # Web Audio API & SpeechSynthesis services
│   │   └── storage/        # Type-safe LocalStorage adapter
│   ├── application/        # Zustand stores & custom application hooks
│   │   ├── stores/         # useVocabStore, useAuthStore, useSettingsStore, useToastStore
│   │   └── hooks/          # useFlashcards, useQuiz, useDictionary
│   ├── presentation/       # User interface & React components
│   │   ├── shared/         # Reusable UI (Header, MobileNav, Toast)
│   │   ├── features/       # Feature views (flashcards, quiz, dictionary, stats, auth)
│   │   └── AppShell.tsx    # Responsive application shell
│   └── lib/                # SQLite connection pool & authentication utilities
├── Dockerfile              # Production multi-stage Docker build
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```
