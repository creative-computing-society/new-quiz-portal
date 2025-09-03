import React, { useState, useEffect } from "react";
import styles from "../Style/hero.module.css";
import heroImg from "../Assets/heroImg.svg";
import logo from "../Assets/white-logo.png";
import { useNavigate } from "react-router-dom";
import config from "../../../config";

function Hero() {
  const navigate = useNavigate();
  const [testStatus, setTestStatus] = useState("checking");
  const [timeUntilStart, setTimeUntilStart] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);

  useEffect(() => {
    const checkTestStatus = async () => {
      try {

        const authResponse = await fetch(
          `${process.env.REACT_APP_BACKEND}/verify`,
          {
            credentials: "include",
          }
        );

        if (!authResponse.ok) {
          navigate("/");
          return;
        }


        const now = new Date();
        const slot1Start = new Date(config.slot1_time);
        const slot1End = new Date(slot1Start.getTime() + config.test_duration * 60 * 1000);
        const slot2Start = new Date(config.slot2_time);
        const slot2End = new Date(slot2Start.getTime() + config.test_duration * 60 * 1000);


        let testStart, testEnd;
        
        if (now <= slot1End) {

          testStart = slot1Start;
          testEnd = slot1End;
        } else {

          testStart = slot2Start;
          testEnd = slot2End;
        }

        if (now < testStart) {
          setTestStatus("not_started");
          setTimeUntilStart(testStart - now);
        } else if (now >= testStart && now <= testEnd) {
          setTestStatus("active");
          setTimeRemaining(testEnd - now);
        } else {
          setTestStatus("ended");
        }

      } catch (error) {
        console.error("Error checking test status:", error);
        navigate("/");
      }
    };

    checkTestStatus();


    const interval = setInterval(() => {
      const now = new Date();
      const slot1Start = new Date(config.slot1_time);
      const slot1End = new Date(slot1Start.getTime() + config.test_duration * 60 * 1000);
      const slot2Start = new Date(config.slot2_time);
      const slot2End = new Date(slot2Start.getTime() + config.test_duration * 60 * 1000);

      let testStart, testEnd;
      
      if (now <= slot1End) {
        testStart = slot1Start;
        testEnd = slot1End;
      } else {
        testStart = slot2Start;
        testEnd = slot2End;
      }

      if (now < testStart) {
        setTimeUntilStart(testStart - now);
      } else if (now >= testStart && now <= testEnd) {
        setTestStatus("active");
        setTimeRemaining(testEnd - now);
      } else if (testStatus !== "ended") {
        setTestStatus("ended");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate, testStatus]);

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    return `${minutes}m ${seconds}s`;
  };

  const handleStartTest = () => {
    if (testStatus === "active") {
      navigate("/instructions");
    }
  };

  const renderButton = () => {
    switch (testStatus) {
      case "checking":
        return (
          <button className={`${styles.button} ${styles.loginButton}`} disabled>
            Checking...
          </button>
        );
      
      case "not_started":
        return (
          <div className="text-center">
            <button className={`${styles.button} ${styles.loginButton}`} disabled>
              Test Starts In: {timeUntilStart ? formatTime(timeUntilStart) : "..."}
            </button>
          </div>
        );
      
      case "active":
        return (
          <div className="text-center">
            <button
              onClick={handleStartTest}
              className={`${styles.button} ${styles.loginButton}`}
            >
              Start Test
            </button>
            <p className="text-white mt-2">
              Time remaining: {timeRemaining ? formatTime(timeRemaining) : "..."}
            </p>
          </div>
        );
      
      case "ended":
        return (
          <button className={`${styles.button} ${styles.loginButton}`} disabled>
            Test Period Ended
          </button>
        );
      
      case "already_attempted":
        return (
          <button className={`${styles.button} ${styles.loginButton}`} disabled>
            Already Submitted
          </button>
        );
      
      default:
        return (
          <button className={`${styles.button} ${styles.loginButton}`} disabled>
            Please wait...
          </button>
        );
    }
  };

  return (
    <div className={styles.heroContainer}>
      <img src={heroImg} alt="hero-bg-img" className={styles.heroImg} />
      <img src={logo} alt="ccs-logo" className={styles.logo} />

      <div className={styles.buttons}>
        {renderButton()}
      </div>
    </div>
  );
}

export default Hero;
