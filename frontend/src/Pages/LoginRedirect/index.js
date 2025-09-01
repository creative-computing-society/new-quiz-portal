import { useNavigate } from "react-router-dom";
import styles from "./Style/loginredirect.module.css";

function subtractTime(date, hours, minutes) {
  const result = new Date(date);
  result.setHours(result.getHours() - hours);
  result.setMinutes(result.getMinutes() - minutes);
  return result;
}

function formatTime(date) {
  const options = {
    weekday: "long", // Full weekday name (e.g., Thursday)
    year: "numeric", // Full year (e.g., 2024)
    month: "long", // Full month name (e.g., October)
    day: "numeric", // Day of the month (e.g., 3)
    hour: "numeric", // Hour (e.g., 10)
    minute: "numeric", // Minutes (e.g., 00)
    hour12: true, // 12-hour format with AM/PM
  };
  return new Date(date).toLocaleString("en-US", options);
}

function LoginRedirect() {
  const navigate = useNavigate();
  const user = localStorage.getItem("user");
  if (!user) {
    navigate("/login"); // Redirect to login page if user data is not found
    return null;
  }
  const data = JSON.parse(user);
  let sTime = new Date(data.startTime);
  let eTime = new Date(data.endTime);
  
  // Subtract time to handle the time zone difference
  eTime = subtractTime(eTime, 5, 30);
  sTime = subtractTime(sTime, 5, 30);

  // Format the start and end times
  const formattedSTime = formatTime(sTime);
  const formattedETime = formatTime(eTime);

  const goToHome = () => {
    navigate("/home"); // Redirect to home page
  };

  return (
    <div className={styles.ovalcont}>
      <div className={styles.ovaltext}>
        {/* <br />
        Will be updated soon
        <br /> */}
        Please login back at your slot time:
        <br />
        {formattedSTime} --- {formattedETime}
        <br />
        All the best!
        <br />
      </div>
      <div className={styles.centerButton}>
        <button onClick={goToHome}>Back to Home</button>
      </div>
    </div>
  );
}

export default LoginRedirect;
