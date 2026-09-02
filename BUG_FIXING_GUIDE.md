# RecallForge — Bug Simulation & Fixing Guide

This guide details 5 realistic bugs that an interviewer could introduce into **RecallForge**, along with the exact files, debugging strategies, fixes, and architectural explanations.

---

## Bug 1: Quiz Score Always Remains Zero

### Bug Description
Regardless of how many questions the user answers correctly, the Quiz Summary screen always shows `Score: 0 / N` (0%).

### Likely Cause
1. Type mismatch during comparison (e.g. comparing string indices like `"0"` with number `0` using strict equality `===`).
2. The score calculation function is reading the wrong key or not looking up the user's answers dictionary by question ID properly.

### File / Function to Inspect
- **File:** [`src/utils/quiz.ts`](file:///c:/Users/arunr/Desktop/RECALL%20FORGE/src/utils/quiz.ts)
- **Function:** `calculateScore(questions, answers)`

### Debugging Approach
1. Add a `console.log({ selected, correctAnswer: q.correctAnswer, areEqual: selected === q.correctAnswer })` inside the `reduce` loop of `calculateScore`.
2. Inspect if `answers` is keyed by `index` instead of `q.id`, or if `selected` is `undefined` due to a key mismatch in `userAnswers`.

### Fix
Ensure `answers` lookup uses `q.id` and types match:
```ts
export const calculateScore = (
  questions: QuizQuestion[],
  answers: Record<string, number>
): number => {
  if (!questions || questions.length === 0) return 0;

  return questions.reduce((acc, q) => {
    const selected = answers[q.id];
    // Strict equality check between numbers
    return selected !== undefined && Number(selected) === Number(q.correctAnswer)
      ? acc + 1
      : acc;
  }, 0);
};
```

### Why the Fix Works
Looking up `answers[q.id]` accurately retrieves the zero-based option index that the user clicked, and converting both sides to `Number` protects against any accidental string coercion from event targets.

---

## Bug 2: Old AI Response Overwrites a Newer Response

### Bug Description
A user generates a study set for "Topic A", then immediately realizes a typo, types "Topic B", and clicks "Generate Study Set". If Request A takes 3 seconds and Request B takes 1 second, the screen briefly shows Topic B, but then flashes and permanently displays Topic A.

### Likely Cause
Absence or improper implementation of request cancellation and race condition handling in the frontend API layer.

### File / Function to Inspect
- **File:** [`src/services/api.ts`](file:///c:/Users/arunr/Desktop/RECALL%20FORGE/src/services/api.ts)
- **Function:** `generateStudySet(params)`

### Debugging Approach
1. Open the browser Network tab, throttle network to "Slow 3G".
2. Submit a request, immediately submit a second request.
3. Observe whether the first request's HTTP status changes to `(canceled)` in DevTools.
4. Check whether `activeAbortController.abort()` was invoked before creating the new controller.

### Fix
Implement `AbortController` in `src/services/api.ts`:
```ts
let activeAbortController: AbortController | null = null;

export const generateStudySet = async (params: GenerateStudySetParams): Promise<StudySet> => {
  // Cancel previous in-flight request
  if (activeAbortController) {
    activeAbortController.abort('Superceded by newer request');
  }

  activeAbortController = new AbortController();
  const currentSignal = activeAbortController.signal;

  try {
    const response = await fetch('/api/study/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      signal: currentSignal,
    });
    // Check signal after await
    if (currentSignal.aborted) throw new ApiError('Aborted', 'REQUEST_ABORTED', true);
    return await response.json();
  } catch (err: any) {
    if (err.name === 'AbortError' || currentSignal.aborted) {
      throw new ApiError('Request aborted', 'REQUEST_ABORTED', true);
    }
    throw err;
  }
};
```

### Why the Fix Works
The browser cancels Request A at the network layer. If Request A finishes just as Request B starts, the abort flag causes Request A to reject immediately, preventing its stale payload from invoking `setStudyData`.

---

## Bug 3: Flashcard Doesn't Flip

### Bug Description
Clicking the flashcard or pressing the `Space` key does not flip the card to reveal the answer side; the question remains visible.

### Likely Cause
1. In `Flashcard.tsx`, the CSS class `.is-flipped` is not being applied dynamically based on the `isFlipped` prop.
2. In `index.css`, missing 3D transform properties (`perspective`, `transform-style: preserve-3d`, `backface-visibility: hidden`).
3. Click event listener or keydown listener propagation is stopped or missing.

### File / Function to Inspect
- **Files:** [`src/components/flashcards/Flashcard.tsx`](file:///c:/Users/arunr/Desktop/RECALL%20FORGE/src/components/flashcards/Flashcard.tsx), [`src/index.css`](file:///c:/Users/arunr/Desktop/RECALL%20FORGE/src/index.css)
- **Functions:** `handleFlip()`, CSS classes `.flashcard-wrapper` and `.flashcard-inner`

### Debugging Approach
1. Open Chrome DevTools Elements panel. Inspect the flashcard DOM node.
2. Click the card and verify whether the container receives the `is-flipped` class.
3. If the class toggles in DOM but visual appearance doesn't change, inspect CSS computed styles for `transform: rotateY(180deg)`.

### Fix
1. In `Flashcard.tsx`:
```tsx
<div
  className={`flashcard-wrapper ${isFlipped ? 'is-flipped' : ''}`}
  onClick={onFlip}
>
```
2. In `index.css`:
```css
.flashcard-wrapper {
  perspective: 1200px;
}
.flashcard-inner {
  transform-style: preserve-3d;
  transition: transform 0.6s ease;
}
.flashcard-wrapper.is-flipped .flashcard-inner {
  transform: rotateY(180deg);
}
.flashcard-face {
  backface-visibility: hidden;
}
.flashcard-back {
  transform: rotateY(180deg);
}
```

### Why the Fix Works
`perspective` gives depth to the 3D space, `preserve-3d` allows children to exist in 3D, and `backface-visibility: hidden` hides the front face once rotated 180 degrees, bringing the back face into view.

---

## Bug 4: Invalid AI Response Crashes the UI

### Bug Description
When the AI returns an object missing the `quiz` array or with a string instead of an array (e.g. `{ "title": "OS", "quiz": "none" }`), the React application crashes with an unhandled exception (`TypeError: Cannot read properties of undefined (reading 'length')` or `quiz.map is not a function`), presenting a white screen.

### Likely Cause
Missing runtime schema validation on the backend or frontend before passing data into React components.

### File / Function to Inspect
- **File:** [`server/schemas/studySchema.ts`](file:///c:/Users/arunr/Desktop/RECALL%20FORGE/server/schemas/studySchema.ts)
- **File:** [`server/services/llmService.ts`](file:///c:/Users/arunr/Desktop/RECALL%20FORGE/server/services/llmService.ts)

### Debugging Approach
1. Check server terminal logs when sending a malformed mock payload.
2. Verify whether `StudySetSchema.safeParse` is being called before `res.status(200).json(...)`.
3. Check whether frontend components have defensive checks and render `ErrorState` rather than attempting to render corrupted data.

### Fix
Enforce Zod validation on the backend in `llmService.ts`:
```ts
const validationResult = StudySetSchema.safeParse(parsedJson);
if (!validationResult.success) {
  throw new AppError(
    'AI_SCHEMA_ERROR',
    'The generated study set was invalid.',
    502,
    validationResult.error.format()
  );
}
return validationResult.data;
```
And on the frontend, handle `errorMessage` with an `ErrorState` boundary:
```tsx
{errorMessage && (
  <ErrorState
    title="Generation Error"
    message={errorMessage}
    errorCode={errorCode}
    onRetry={onRetry}
  />
)}
```

### Why the Fix Works
Zod acts as a strict firewall. Any shape mismatch throws a controlled error on the backend before the response leaves the server. The frontend receives an error code and renders an informative UI error card with a **Try Again** button rather than crashing.

---

## Bug 5: Retest Includes Questions That Were Already Answered Correctly

### Bug Description
After completing a quiz of 5 questions with 3 correct and 2 incorrect, clicking "Retest 2 Incorrect Questions" opens a retest session that still contains all 5 questions or contains the 3 questions that were already answered correctly.

### Likely Cause
The question filter in `getIncorrectQuestions` has an inverted boolean condition (e.g. `selected === q.correctAnswer` instead of `selected !== q.correctAnswer`), or `startRetest()` is referencing `initialQuestions` rather than the filtered list.

### File / Function to Inspect
- **File:** [`src/utils/quiz.ts`](file:///c:/Users/arunr/Desktop/RECALL%20FORGE/src/utils/quiz.ts)
- **Function:** `getIncorrectQuestions(questions, answers)`
- **File:** [`src/hooks/useQuiz.ts`](file:///c:/Users/arunr/Desktop/RECALL%20FORGE/src/hooks/useQuiz.ts)
- **Function:** `startRetest()`

### Debugging Approach
1. Check the unit test in `src/__tests__/quizUtils.test.ts`.
2. Trace `answers[q.id]` inside `getIncorrectQuestions`. If `selected !== q.correctAnswer` is not true, the question should not be included.

### Fix
In `src/utils/quiz.ts`:
```ts
export const getIncorrectQuestions = (
  questions: QuizQuestion[],
  answers: Record<string, number>
): QuizQuestion[] => {
  if (!questions || questions.length === 0) return [];

  return questions.filter((q) => {
    const selected = answers[q.id];
    // Include if unanswered or if chosen option does not match correctAnswer
    return selected === undefined || selected !== q.correctAnswer;
  });
};
```
In `src/hooks/useQuiz.ts`:
```ts
const startRetest = useCallback(() => {
  const failedQuestions = getIncorrectQuestions(activeQuestions, userAnswers);
  if (failedQuestions.length === 0) return;

  setActiveQuestions(failedQuestions);
  setCurrentIndex(0);
  setUserAnswers({});
  setIsSubmitted(false);
  setIsComplete(false);
  setIsRetestMode(true);
}, [activeQuestions, userAnswers]);
```

### Why the Fix Works
`filter` strictly excludes any question where `selected === q.correctAnswer`. The state setter `setActiveQuestions` updates the active deck with only the failed questions, resets user answers, and resets the index to 0 for a clean retest cycle.
