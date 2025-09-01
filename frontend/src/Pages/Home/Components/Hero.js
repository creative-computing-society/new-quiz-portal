import React, { useState, useEffect } from "react";
import styles from "../Style/hero.module.css";
import heroImg from "../Assets/heroImg.svg";
import logo from "../Assets/white-logo.png";
import { useNavigate } from "react-router-dom";

function subtractTime(date, hours, minutes) {
  const result = new Date(date);
  result.setHours(result.getHours() - hours);
  result.setMinutes(result.getMinutes() - minutes);
  return result;
}

function Hero() {
  const navigate = useNavigate();
  const [hasAttemptedResponse, setHasAttemptedResponse] = useState(null); // Manage state for the hasAttempted API response
  const [redirectData, setRedirectData] = useState(
    JSON.parse(localStorage.getItem("user"))
  );

  // Fetch 'hasAttempted' and 'getTime' when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const hasAttemptedResponse = await fetch(
          `${process.env.REACT_APP_BACKEND}/api/v1/answers/hasAttempted`,
          {
            method: "GET",
            headers: {
              Authorization: `${localStorage.getItem("jwt")}`,
            },
          }
        );
        const attemptData = await hasAttemptedResponse.json();
        console.log("HasAttempted Response:", attemptData);
        setHasAttemptedResponse(attemptData.hasAttempted);

        // Fetch the startTime and endTime
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND}/api/v1/answers/getTime`,
          {
            method: "GET",
            headers: {
              Authorization: `${localStorage.getItem("jwt")}`,
            },
          }
        );

        const data = await response.json();
        if (response.status === 200) {
          const updatedRedirectData = {
            ...redirectData,
            startTime: data.startTime,
            endTime: data.endTime,
          };
          setRedirectData(updatedRedirectData); // Update the redirect data state
          localStorage.setItem("user", JSON.stringify(updatedRedirectData)); // Update localStorage
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData(); // Call the fetch function
  }, []); // Empty dependency array to run only on mount

  const handleStartTest = () => {
    if (redirectData) {
      const { startTime, endTime } = redirectData;
      const start = new Date(startTime);
      const end = new Date(endTime);
      const adjustedStart = subtractTime(start, 5, 30);
      const adjustedEnd = subtractTime(end, 5, 30);
      const currentTime = new Date();

      if (currentTime >= adjustedStart && currentTime <= adjustedEnd) {
        navigate("/instructions");
      } else {
        navigate("/loginredirect");
      }
    } else {
      console.error("No redirect data found in local storage.");
    }
  };

  return (
    <div className={styles.heroContainer}>
      <img src={heroImg} alt="hero-bg-img" className={styles.heroImg} />
      <img src={logo} alt="ccs-logo" className={styles.logo} />

      <div className={styles.buttons}>
        {hasAttemptedResponse === false ? (
          <button
            onClick={handleStartTest}
            className={`${styles.button} ${styles.loginButton}`}
          >
            Start Test
          </button>
        ) : (
          <button
            className={`${styles.button} ${styles.loginButton}`}
          >
            Submitted
          </button>
        )}
      </div>
    </div>
  );
}

export default Hero;
