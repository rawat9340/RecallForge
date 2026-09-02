# RecallForge — AI Study & Revision Assistant

> **Turn knowledge into lasting memory.**

RecallForge is a production-grade, interview-ready study assistant built with **React**, **TypeScript**, **Vite**, **Node.js**, **Express**, and the **Google Gemini API** with strict **Zod** schema validation.

Rather than acting as a generic conversational chatbot, RecallForge takes raw lecture notes or study topics, queries an LLM through a backend proxy for structured JSON, validates the response with runtime schemas, and renders a focused interactive study suite featuring active-recall flashcards, real-time scored quizzes, and targeted incorrect-answer retesting.

---

## Architecture Flow

```
┌──────────────────────────────────────────────────────────┐
│                      React UI Layer                      │
│   (HomePage: topic input, counts, difficulty selector)   │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼ (AbortController cancellation)
┌──────────────────────────────────────────────────────────┐
│                   Frontend API Service                   │
│         (src/services/api.ts -> fetch /api/study)         │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│                  Express Backend Proxy                   │
│        (server/routes/study.ts: POST /generate)          │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│                   Gemini LLM Service                     │
│    (Dedicated Prompt Builder + application/json mode)     │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼ (Raw text output)
┌──────────────────────────────────────────────────────────┐
│                       JSON.parse                         │
│            (Catches syntax/truncation bugs)              │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│                  Strict Zod Validation                   │
│     (server/schemas/studySchema.ts: StudySetSchema)      │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼ (Validated StudySet)
┌──────────────────────────────────────────────────────────┐
│                 Interactive React Views                  │
│  ┌───────────────────────────┬─────────────────────────┐ │
│  │      Flashcard Deck       │     Scored Quiz Deck    │ │
│  │ (3D flip, Space/Arrow nav)│ (Instant feedback, locks│ │
│  └───────────────────────────┴────────────┬────────────┘ │
│                                           │              │
│                                           ▼              │
│                              Retest Missed Questions     │
│                              (In-Memory Reuse, No LLM)   │
└──────────────────────────────────────────────────────────┘
```

---

## Features

- **Focused Study Interface**: Purpose-built developer-tool aesthetic (dark/light theme, clean typography, keyboard navigation) avoiding chatbot paradigms.
- **Strict Zod Runtime Validation**: Every incoming request and outgoing LLM payload is validated against strict TypeScript/Zod schemas; invalid AI output never reaches React components.
- **Race Condition Immunity**: Uses `AbortController` in the frontend API layer to cancel in-flight requests, ensuring that slower stale responses never overwrite newer submissions.
- **Interactive 3D Flashcards**: Flip cards on click or with `Space`, navigate with `ArrowLeft` / `ArrowRight`, track card progress and completion.
- **Interactive Quiz with Instant Feedback**: 4 options per question, instant correctness highlight (green check / red cross), locked selections after answer submission, and rich concept explanations.
- **Zero-Network Wrong Answer Retest**: Retesting missed questions creates a new session containing *only* previously incorrect questions directly in memory without redundant LLM calls.
- **Secure Backend Proxy**: The `GEMINI_API_KEY` remains strictly server-side and is never exposed to the client or browser bundle.
- **Dual Mode Execution**: Automatically uses live Gemini API when `GEMINI_API_KEY` is provided, and gracefully defaults to an offline development fallback mock generator when running without credentials.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Native React Hooks (`useState`, `useEffect`, `useCallback`, `useMemo`, `useRef`) |
| **Styling** | Vanilla CSS Design System with CSS Variables, Dark/Light mode, 3D CSS transforms |
| **Backend** | Node.js, Express, TypeScript (`tsx` runtime) |
| **AI Integration** | Google Gemini API (`@google/generative-ai` with `gemini-1.5-flash`) |
| **Validation** | Zod (strict schema definitions and inferred TypeScript types) |
| **Testing** | Vitest (25 unit tests covering schemas, quiz utilities, and race condition handling) |

---

## Getting Started

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **npm**: v9+

### 2. Installation
```bash
git clone <your-repo-url>
cd recallforge
npm install
```

### 3. Environment Configuration
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```
Open `.env` and insert your Gemini API Key:
```env
PORT=3001
GEMINI_API_KEY=AIzaSy...
```
*(Note: If you run without a `GEMINI_API_KEY`, RecallForge will automatically run in local development mock mode, allowing offline inspection and testing immediately.)*

### 4. Run Locally
To run both the Express backend and the Vite frontend concurrently with a single command:
```bash
npm start
```
Or:
```bash
npm run dev
```

Open your browser at **`http://localhost:5173/`**.

To run services individually:
- **Backend**: `npm run server` (runs at `http://localhost:3001`)
- **Frontend**: `npm run client` (runs at `http://localhost:5173`)

### 5. Run Automated Tests
```bash
npm test
```
Runs 25 unit tests verifying Zod schemas, quiz score calculations, incorrect question extraction, and request race condition handling.

---

## Deploying to Render (Unified Full-Stack Web Service)

RecallForge is architected to deploy as a single, unified Node.js Web Service on **Render**, where Express serves both the backend API endpoints and the compiled React frontend static files.

### Option A: 1-Click Render Blueprint (Recommended)
1. In your [Render Dashboard](https://dashboard.render.com/), click **New +** and select **Blueprint**.
2. Connect your GitHub repository: `rawat9340/RecallForge`.
3. Render will automatically read [`render.yaml`](render.yaml) and configure:
   - **Build Command**: `npm install --include=dev && npm run build`
   - **Start Command**: `npm run start:prod`
4. In the Environment section, enter your `GEMINI_API_KEY`.
5. Click **Apply**. Render will build and deploy your full-stack app!

### Option B: Manual Web Service Setup
1. In Render Dashboard, click **New +** and select **Web Service**.
2. Connect your repository `https://github.com/rawat9340/RecallForge`.
3. Fill in the service configuration:
   - **Name**: `recallforge`
   - **Runtime**: `Node`
   - **Build Command**: `npm install --include=dev && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Plan**: `Free`
4. Under **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `GEMINI_API_KEY`: *(your Google AI Studio API key)*
5. Click **Create Web Service**.

---

## AI Failure Handling

Handling unpredictable LLM output is the central pillar of RecallForge:

| Failure Mode | How RecallForge Handles It | User Experience |
|---|---|---|
| **Malformed JSON** | `JSON.parse` fails in `llmService.ts`; caught and translated into controlled `AppError('AI_PARSE_ERROR')` with HTTP 502. | Clear error card: *"Couldn't understand the AI response. Please try again."* with a direct **Try Again** button. |
| **Invalid Schema / Missing Fields** | `StudySetSchema.safeParse` fails in `llmService.ts`; caught and translated into `AppError('AI_SCHEMA_ERROR')` with HTTP 502. | User receives structured error banner without application crash; invalid data is rejected before reaching React. |
| **Empty AI Response** | Detected when string length is 0; rejected before parsing as `AI_PARSE_ERROR`. | User sees graceful error state with one-click retry. |
| **Rate Limit (429)** | Server catches Gemini quota errors and maps them to HTTP 429 `RATE_LIMIT_ERROR`. | Friendly message: *"Gemini API rate limit exceeded. Please wait a moment and try again."* |
| **Network & Auth Failures (401/403/500)** | Centralized Express `errorHandler.ts` catches network errors; maps internal issues without leaking server stack traces. | Clean error state with error code badge and retry trigger. |
| **Slow Response** | Generation button is disabled; `LoadingState` displays skeleton indicator with *"Building your study set..."*. | Prevents accidental duplicate submissions and indicates background progress. |
| **Stale Responses / Race Conditions** | `src/services/api.ts` maintains an active `AbortController`. When a new request starts, the previous request is aborted, and its promise is ignored. | Stale or slow responses can never overwrite fresher requests. |

---

## AI Usage Note

AI tools were used to assist with brainstorming, debugging, and code review. The final architecture, data models, state transitions, and implementation were designed, reviewed, and understood by the author.

---

## Known Limitations

1. **In-Memory Session Persistence**: Study sessions are currently managed in React component state and are not persisted to a database or browser `localStorage` across hard page reloads.
2. **Offline Quiz Mode**: While quizzes can be taken offline once generated, creating new topics without an internet connection requires the local fallback mock mode.
3. **Single LLM Provider**: Currently optimized specifically for the Google Gemini API (`gemini-1.5-flash`), though the modular `llmService.ts` abstraction makes adding OpenAI or Anthropic trivial.

---

## Time Spent

**Time spent:** 6.5 hours
