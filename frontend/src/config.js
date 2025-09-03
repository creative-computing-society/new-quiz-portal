const API_BASE_URL = process.env.REACT_APP_BACKEND || "http://localhost:8080";

const config = {
  api_url: API_BASE_URL,
  slot1_time: "September, 5, 2025 10:00:00",
  slot2_time: "September, 5, 2025 14:00:00", 
  test_duration: 20
};

module.exports = config;