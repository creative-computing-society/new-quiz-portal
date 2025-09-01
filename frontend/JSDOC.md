# JSDoc Documentation for React Application

This documentation provides JSDoc-style comments and usage examples for the main components, props, state, and API usage in this React application. Use this as a reference for development and onboarding.

---

## Table of Contents
- [Component Documentation](#component-documentation)
- [API Usage](#api-usage)
- [Examples](#examples)

---

## Component Documentation

### 1. `Navbar`
Located: `src/Pages/Home/Components/Navbar.js`

/**
 * Navbar component for site navigation and user info display.
 * @component
 * @returns {JSX.Element}
 * @description
 * - Reads user info (name, email) and JWT from localStorage.
 * - Fetches user profile image from backend using email and JWT.
 * - Renders navigation bar with user info and logout button.
 * - On logout, clears localStorage and cookies, then navigates to home.
 *
 * @example
 * <Navbar />
 */

### 2. `Carousel`
Located: `src/Pages/Home/Components/Carousel.js`

/**
 * Carousel for displaying static images using Swiper.
 * @component
 * @returns {JSX.Element}
 * @description
 * - No props or state.
 * - No API calls.
 * - Renders a carousel of static images.
 *
 * @example
 * <Carousel />
 */

### 3. `AdminQuizGenerator` (AdminPanel)
Located: `src/Pages/AdminPannel/Components/AdminQuizGenerator.js`

/**
 * Admin panel component for managing quiz topics and questions.
 * @component
 * @returns {JSX.Element}
 * @description
 * - Reads user info and JWT from localStorage.
 * - State: topics, questions, currentQuestionIndex, selectedTopic, newTopic, question, options, correctAnswer, difficulty.
 * - API:
 *   - Fetches all questions on mount.
 *   - Generates a new question for a topic.
 *   - Creates a new question (POST).
 * - Outputs: Admin UI for managing topics/questions, adding topics, generating and adding questions.
 *
 * @example
 * <AdminQuizGenerator />
 */

### 4. `Question`
Located: `src/Pages/OurTest/Componenet/Question.jsx`

/**
 * Displays a quiz question and answer options.
 * @component
 * @param {Object} props
 * @param {Object} props.question - The question object ({_id, question, options}).
 * @param {function} props.onAnswerChange - Callback when an option is selected (questionId, option).
 * @param {function} props.onMarkForReview - Callback to mark/unmark for review.
 * @param {boolean} props.isMarkedForReview - Whether the question is marked for review.
 * @param {function} props.onClear - Callback to clear the selected answer.
 * @returns {JSX.Element}
 * @description
 * - State: selectedOption (string).
 * - No API calls.
 * - Outputs: Renders question, options, and review/clear buttons. Calls provided callbacks on user actions.
 *
 * @example
 * <Question
 *   question={{ _id: '1', question: 'Q?', options: ['A', 'B', 'C', 'D'] }}
 *   onAnswerChange={(id, opt) => {}}
 *   onMarkForReview={() => {}}
 *   isMarkedForReview={false}
 *   onClear={() => {}}
 * />
 */
### 5. `Hero`
Located: `src/Pages/Home/Components/Hero.js`

/**
 * Hero section with test start logic.
 * @component
 * @returns {JSX.Element}
 * @description
 * - Reads user info from localStorage.
 * - State: hasAttemptedResponse, redirectData (user info, start/end time).
 * - API:
 *   - Checks if user has attempted the quiz.
 *   - Fetches quiz start/end time.
 * - Outputs: Renders hero section with a button to start the test (if allowed by time and attempt status), or shows "Submitted".
 *
 * @example
 * <Hero />
 */
### 6. `WhyCCS`
Located: `src/Pages/Home/Components/WhyCCS.js`

/**
 * Section describing the benefits of joining CCS.
 * @component
 * @returns {JSX.Element}
 * @description
 * - No props or state.
 * - No API calls.
 * - Outputs: Renders a list of reasons to join CCS, with images and animations.
 *
 * @example
 * <WhyCCS />
 */

---

## API Usage

### Auth Service
Located: `services/auth-service.js`

/**
 * Logs in a user.
 * @function
 * @param {string} username
 * @param {string} password
 * @returns {Promise<Object>} Auth response
 */

/**
 * Logs out the current user.
 * @function
 * @returns {Promise<void>}
 */

---

## Examples

### Rendering a Component
```jsx
import Navbar from './Pages/Home/Components/Navbar';

<Navbar logo="/public/ccslogoico.ico" links={[{ label: 'Home', href: '/' }]} />
```

### Using a Callback Prop
```jsx
<AdminQuizGenerator onQuizCreate={(quiz) => console.log(quiz)} />
```

### Calling an API
```js
import { login } from '../services/auth-service';

login('user', 'pass').then(response => {
  // handle login
});
```

---

## Notes
- All components use functional React patterns.
- State is managed via `useState` and `useEffect` where applicable.
- API calls are handled in the `services/` directory.
- For more details, refer to the JSDoc comments in each file.
