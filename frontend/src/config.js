const API_BASE_URL = process.env.REACT_APP_BACKEND || "http://localhost:8080";

async function loadConfig() {
  try {
    const res = await fetch(`${API_BASE_URL}/quiz/shifts`);
    if (!res.ok) throw new Error('Failed to load quiz configuration');

    const data = await res.json();
    const { shifts = [], test_duration = 0 } = data;

    // Keep ISO strings directly
    const slots = {};
    shifts.forEach((shift, index) => {
      slots[`slot${index + 1}_time`] = shift.start_time; // keep ISO
    });

    const config = {
      api_url: API_BASE_URL,
      ...slots,
      test_duration
    };

    console.log("Frontend Config:", config);
    return config;

  } catch (error) {
    console.error("Error loading config:", error);
    throw error;
  }
}

module.exports = { loadConfig };
