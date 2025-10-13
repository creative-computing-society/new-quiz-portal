const API_BASE_URL = process.env.REACT_APP_BACKEND || "http://localhost:8080";

const config = {
  api_url: API_BASE_URL,
  slot1_time: "October, 13, 2025 12:00:00",
  slot2_time: "October, 13, 2025 16:00:00", 
  test_duration: 10
};

module.exports = config;
