# RecallForge — Interview Notes & Technical Decisions

This document provides in-depth, interview-ready explanations for all architectural, technical, and implementation decisions made in **RecallForge**, with direct references to the source code.

---

### 1. Why React hooks?
**Code Reference:** [`src/hooks/useStudySession.ts`](file:///c:/Users/arunr/Desktop/RECALL%20FORGE/src/hooks/useStudySession.ts), [`src/hooks/useQuiz.ts`](file:///c:/Users/arunr/Desktop/RECALL%20FORGE/src/hooks/useQuiz.ts)

React Hooks (`useState`, `useEffect`, `useCallback`, `useMemo`, `useRef`) allow us to encapsulate and isolate stateful logic into composable, reusable modules without class boilerplate. By writing custom hooks like `useStudySession()` and `useQuiz()`, we separate business logic (API orchestration, score calculation, index advancement, retest filtering) completely out of the UI components (`HomePage.tsx`, `StudySessionPage.tsx`), making the components clean, declarative, and easily testable.

---

### 2. Why TypeScript?
**Code Reference:** [`server/schemas/studySchema.ts`](file:///c:/Users/arunr/Desktop/RECALL%20FORGE/server/schemas/studySchema.ts), [`src/types/study.ts`](file:///c:/Users/arunr/Desktop/RECALL%20FORGE/src/types/study.ts)

TypeScript provides compile-time safety across the frontend-backend boundary. In LLM applications, output shapes are fundamentally dynamic and untrusted. TypeScript guarantees that once data is validated, all downstream consumers (e.g. `Flashcard.tsx`, `QuizCard.tsx`) receive strictly typed objects. Furthermore, using `z.infer<typeof StudySetSchema>` guarantees that the TypeScript types and runtime Zod schemas stay perfectly in sync without duplicated type definitions.

---

### 3. Why Express?
**Code Reference:** [`server/index.ts`](file:///c:/Users/arunr/Desktop/RECALL%20FORGE/server/index.ts), [`server/routes/study.ts`](file:///c:/Users/arunr/Desktop/RECALL%20FORGE/server/routes/study.ts)

Express is lightweight, battle-tested, and transparent. For an internship assignment, Express introduces minimal overhead compared to full-stack frameworks, making the request-response lifecycle and middleware pipeline (`cors`, `express.json`, centralized `errorHandler`) explicit and straightforward to explain during a code walk-through.

---

### 4. Why keep API key on backend?
**Code Reference:** [`server/services/llmService.ts:L114`](file:///c:/Users/arunr/Desktop/RECALL%20FORGE/server/services/llmService.ts#L114), [`.env.example`](file:///c:/Users/arunr/Desktop/RECALL%20FORGE/.env.example)

Shipping an API key (like `GEMINI_API_KEY`) to the client or bundling it in Vite frontend environment variables (e.g. `VITE_GEMINI_API_KEY`) exposes it to anyone inspecting browser network calls or client bundles. Malicious actors could extract the key, exhaust API quotas, or incur substantial financial charges. Keeping the key server-side ensures the backend acts as a gatekeeper, validating requests and enforcing rate limits.

---

### 5. Why structured JSON?
**Code Reference:** [`server/services/llmService.ts:buildStudyPrompt`](file:///c:/Users/arunr/Desktop/RECALL%20FORGE/server/services/llmService.ts)

Free-form LLM text or conversational markdown output cannot be reliably mapped to deterministic UI components like flip cards, selectable option buttons, or scoring algorithms. Requesting structured JSON allows our application to transform AI generations into stateful, interactive software primitives.

---

### 6. Why Zod?
**Code Reference:** [`server/schemas/studySchema.ts`](file:///c:/Users/arunr/Desktop/RECALL%20FORGE/server/schemas/studySchema.ts)

TypeScript types exist only at compile time and are stripped in the compiled JavaScript. An LLM can return syntactically valid JSON that violates structural assumptions (e.g., passing 3 options instead of 4, or a string instead of a number for `correctAnswer`). Zod performs runtime validation, enforcing that only structurally sound data reaches React components.

---

### 7. What happens if Gemini returns malformed JSON?
**Code Reference:** [`server/services/llmService.ts:L157-L167`](file:///c:/Users/arunr/Desktop/RECALL%20FORGE/server/services/llmService.ts#L157-L167), [`src/components/common/ErrorState.tsx`](file:///c:/Users/arunr/Desktop/RECALL%20FORGE/src/components/common/ErrorState.tsx)

If the model outputs unparseable JSON (e.g. truncated brackets or stray tokens), `JSON.parse` throws an error. The backend catches this in `llmService.ts` and throws an `AppError('AI_PARSE_ERROR', "Couldn't understand the AI response. Please try again.", 502)`. The frontend receives this structured error and renders `ErrorState.tsx` with a **"Try Again"** button, completely preventing a crash.

---

### 8. What happens if the schema is wrong?
**Code Reference:** [`server/services/llmService.ts:L169-L179`](file:///c:/Users/arunr/Desktop/RECALL%20FORGE/server/services/llmService.ts#L169-L179)

If the JSON parses but fails validation (e.g., missing `explanation`, fewer than 4 options, or invalid `correctAnswer`), `StudySetSchema.safeParse` returns `success: false`. The backend logs the schema violations and returns a controlled `AI_SCHEMA_ERROR` with HTTP 502. The corrupt payload is halted at the server boundary and never reaches the frontend.

---

### 9. How is loading handled?
**Code Reference:** [`src/hooks/useStudySession.ts`](file:///c:/Users/arunr/Desktop/RECALL%20FORGE/src/hooks/useStudySession.ts), [`src/components/common/LoadingState.tsx`](file:///c:/Users/arunr/Desktop/RECALL%20FORGE/src/components/common/LoadingState.tsx), [`src/pages/HomePage.tsx:L148`](file:///c:/Users/arunr/Desktop/RECALL%20FORGE/src/pages/HomePage.tsx#L148)

When the user submits the form, `isLoading` is set to `true`. The primary CTA button is disabled to prevent duplicate submissions, and `LoadingState.tsx` displays a spinner and skeleton with the message `"Building your study set..."`. The request is asynchronous, preserving browser responsiveness throughout generation.

---

### 10. How are API failures handled?
**Code Reference:** [`server/middleware/errorHandler.ts`](file:///c:/Users/arunr/Desktop/RECALL%20FORGE/server/middleware/errorHandler.ts), [`server/services/llmService.ts:L133-L151`](file:///c:/Users/arunr/Desktop/RECALL%20FORGE/server/services/llmService.ts#L133-L151)

Network failures, invalid credentials (401/403), and rate limits (429) are trapped in `llmService.ts` and mapped to controlled `AppError` categories. The Express error middleware formats these into a uniform response: `{ error: { code, message } }`. Raw stack traces are never exposed to the client.

---

### 11. How do you prevent stale responses?
**Code Reference:** [`src/services/api.ts:L14-L60`](file:///c:/Users/arunr/Desktop/RECALL%20FORGE/src/services/api.ts#L14-L60)

If a user initiates Request A, modifies parameters, and quickly submits Request B, network latency could cause Request A to return *after* Request B. RecallForge maintains a module-level `activeAbortController` in `src/services/api.ts`. Whenever `generateStudySet()` is called, it first aborts any existing controller (`activeAbortController.abort()`), ensuring only Request B can update state.

---

### 12. Why AbortController?
**Code Reference:** [`src/services/api.ts:L33-L45`](file:///c:/Users/arunr/Desktop/RECALL%20FORGE/src/services/api.ts#L33-L45)

`AbortController` is the standard Web API for cancelling HTTP fetch requests. Cancelling at the transport layer terminates socket connection processing, frees browser memory, and immediately rejects in-flight promises without requiring complex manual request-id tracking.

---

### 13. How does flashcard state work?
**Code Reference:** [`src/pages/StudySessionPage.tsx:L25-L65`](file:///c:/Users/arunr/Desktop/RECALL%20FORGE/src/pages/StudySessionPage.tsx#L25-L65), [`src/components/flashcards/Flashcard.tsx`](file:///c:/Users/arunr/Desktop/RECALL%20FORGE/src/components/flashcards/Flashcard.tsx)

Flashcard state is managed via two distinct state variables: `flashcardIndex` (number) and `isFlipped` (boolean). When flipping, `isFlipped` triggers a CSS 3D transform (`transform: rotateY(180deg)`). When advancing cards, `isFlipped` automatically resets to `false` so the next card always presents the question first.

---

### 14. How does quiz scoring work?
**Code Reference:** [`src/utils/quiz.ts:calculateScore`](file:///c:/Users/arunr/Desktop/RECALL%20FORGE/src/utils/quiz.ts), [`src/hooks/useQuiz.ts`](file:///c:/Users/arunr/Desktop/RECALL%20FORGE/src/hooks/useQuiz.ts)

User responses are stored as a map of `{ [questionId]: selectedOptionIndex }`. The pure utility function `calculateScore` iterates through active questions and compares `selected === question.correctAnswer`. Score and percentage are memoized via `useMemo` in `useQuiz.ts`.

---

### 15. How does retest work?
**Code Reference:** [`src/hooks/useQuiz.ts:startRetest`](file:///c:/Users/arunr/Desktop/RECALL%20FORGE/src/hooks/useQuiz.ts), [`src/utils/quiz.ts:getIncorrectQuestions`](file:///c:/Users/arunr/Desktop/RECALL%20FORGE/src/utils/quiz.ts)

Retesting wrong answers is executed purely in memory. `getIncorrectQuestions(activeQuestions, userAnswers)` filters the array to only questions where `selected !== question.correctAnswer`. `startRetest()` updates `activeQuestions` with this subset, resets answers and current index to 0, and starts the retest session without making any network or LLM calls.

---

### 16. Why didn't you use Redux?
**Code Reference:** [`src/hooks/useStudySession.ts`](file:///c:/Users/arunr/Desktop/RECALL%20FORGE/src/hooks/useStudySession.ts), [`src/hooks/useQuiz.ts`](file:///c:/Users/arunr/Desktop/RECALL%20FORGE/src/hooks/useQuiz.ts)

Redux introduces significant boilerplate (actions, reducers, dispatchers, store configuration) that is unnecessary for an application with localized state lifecycles. Native React hooks provide all necessary state isolation without external dependencies, resulting in smaller bundle size and cleaner interview explainability.

---

### 17. Why didn't you use a database?
**Code Reference:** [`server/routes/study.ts`](file:///c:/Users/arunr/Desktop/RECALL%20FORGE/server/routes/study.ts)

The goal of RecallForge is an ephemeral, rapid study session assistant. Introducing a database (e.g. SQLite, PostgreSQL) adds connection management, migrations, and schema coupling without benefiting the core active-recall flow. Sessions are held in memory during the user's revision flow.

---

### 18. How would you add authentication?
**Code Reference:** [`server/index.ts`](file:///c:/Users/arunr/Desktop/RECALL%20FORGE/server/index.ts)

I would integrate JWT-based sessions or an identity provider (e.g. Clerk or Firebase Auth). An Express auth middleware `authenticateUser` would extract the `Bearer <token>`, verify the signature, and attach `req.user` before reaching `/api/study/generate`, enabling per-user rate limits and study history storage.

---

### 19. How would you scale this application?
1. **Caching**: Cache generated study sets in Redis keyed by hash of `(topic, difficulty, counts)` to serve repeated requests with zero LLM cost and sub-50ms latency.
2. **Horizontal Scaling**: Run stateless Express backend instances behind an Nginx or AWS ALB load balancer.
3. **Queueing**: For high concurrency, offload generation requests to a BullMQ / Redis job queue.

---

### 20. How would you reduce LLM cost?
1. **Response Caching**: As noted in scaling, common CS topics (e.g. "Operating Systems Paging") would hit cache 95% of the time.
2. **Model Selection**: Use smaller, cost-effective models (e.g. `gemini-1.5-flash`) rather than expensive flagship models.
3. **Concise Prompts**: Optimize prompt token count and use schema-constrained generation to avoid verbose markdown filler.

---

### 21. How would you improve AI accuracy?
1. **Few-Shot Prompt Examples**: Provide 1-2 curated example pairs of high-yield questions in the system prompt.
2. **Retrieval-Augmented Generation (RAG)**: Chunk and embed user study notes using vector embeddings so the LLM queries exact textbook excerpts rather than relying solely on parametric memory.
3. **Structured Validation Retries**: If Zod schema validation fails, pass the exact Zod error back to the LLM in an automated repair turn.

---

### 22. What would you change if you had another week?
1. **LocalStorage Session Persistence**: Persist generated decks to browser `localStorage` or `IndexedDB` so refreshing the page does not wipe the study session.
2. **Audio Pronunciation & Spoken Answers**: Integrate Web Speech API to read flashcards aloud and support voice answering.
3. **Spaced Repetition Algorithm (SM-2)**: Implement the SuperMemo-2 algorithm to schedule card reviews over 1, 3, 7, and 30-day intervals.
4. **Export Deck**: Support exporting flashcard decks directly to Anki (`.apkg`) or CSV format.
