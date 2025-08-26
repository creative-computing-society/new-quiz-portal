export const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:2117";

export async function fetchWithAuth(url, options = {}) {
  return fetch(API_BASE + url, {
    credentials: "include", // send cookies
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
}