// API service matching swagger documentation exactly
const API_BASE = process.env.REACT_APP_BACKEND || "http://localhost:8080";

const quickApi = {
  // Health check
  healthCheck: () => fetch(`${API_BASE}/health`, { credentials: "include" }),
  
  // Authentication (from swagger)
  verifyToken: () => fetch(`${API_BASE}/verify`, { credentials: "include" }),
  
  logout: () => fetch(`${API_BASE}/logout`, { credentials: "include" }),
  
  checkRegistered: () => fetch(`${API_BASE}/checkRegistered`, { credentials: "include" }),
  
  // Quiz operations (from swagger)
  getQuizQuestions: () => fetch(`${API_BASE}/quiz/get`, { credentials: "include" }),
  
  submitQuiz: (image, responses, flagsRaised) => fetch(`${API_BASE}/quiz/submit`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      image: image,
      responses: responses, // Array of {questionID: [number], answer: [number]}
      flagsRaised: flagsRaised
    })
  }),
  
  // Registration (from swagger - these are behind auth middleware)
  getRegQuestions: () => fetch(`${API_BASE}/regQuestions`, { credentials: "include" }),
  
  submitRegistration: (regAnswers) => fetch(`${API_BASE}/register`, {
    method: "POST", 
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ regAnswers: regAnswers })
  }),

  // Google OAuth (from swagger)
  googleAuth: () => {
    window.location.href = `${API_BASE}/auth/google`;
  }
};

export default quickApi;
