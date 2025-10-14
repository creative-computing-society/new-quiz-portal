const API_BASE_URL = process.env.REACT_APP_BACKEND || "http://localhost:8080";

const config = {
  api_url: API_BASE_URL,
  slot1_time: "October, 14, 2025 17:20:00",
  slot2_time: "October, 14, 2025 17:20:00",
  test_duration: 10,
};

module.exports = config;
