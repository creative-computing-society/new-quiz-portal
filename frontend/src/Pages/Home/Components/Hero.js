import React, { useState, useEffect } from "react";
import styles from "../Style/hero.module.css";
import heroImg from "../Assets/heroImg.svg";
import logo from "../Assets/white-logo.png";
import { useNavigate } from "react-router-dom";
import { loadConfig } from "../../../config";

function Hero() {
  const navigate = useNavigate();
  const [config, setConfig] = useState(null);
  const [testStatus, setTestStatus] = useState("checking");
  const [timeUntilStart, setTimeUntilStart] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);

  // Load config on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const cfg = await loadConfig();
        setConfig(cfg);
      } catch (err) {
        console.error("Failed to load config:", err);
        navigate("/");
      }
    };
    fetchConfig();
  }, [navigate]);

  // Check test status and update timers
  useEffect(() => {
    if (!config) return;

    const getNextSlot = () => {
      const now = new Date();
      // Get all slot keys dynamically
      const slotKeys = Object.keys(config).filter(k => k.startsWith("slot") && k.endsWith("_time"));

      // Convert to Date objects
      const slots = slotKeys.map(k => new Date(config[k]));

      // Find the next slot that hasn't ended
      for (let slotStart of slots) {
        const slotEnd = new Date(slotStart.getTime() + config.test_duration * 60 * 1000);
        if (now < slotEnd) {
          return { slotStart, slotEnd };
        }
      }

      // All slots ended
      return null;
    };

    const updateStatus = () => {
      const now = new Date();
      const nextSlot = getNextSlot();

      if (!nextSlot) {
        setTestStatus("ended");
        setTimeRemaining(null);
        setTimeUntilStart(null);
        return;
      }

      const { slotStart, slotEnd } = nextSlot;

      if (now < slotStart) {
        setTestStatus("not_started");
        setTimeUntilStart(slotStart - now);
        setTimeRemaining(null);
      } else if (now >= slotStart && now <= slotEnd) {
        setTestStatus("active");
        setTimeRemaining(slotEnd - now);
        setTimeUntilStart(null);
      }
    };

    // Initial status
    updateStatus();

    // Interval to update every second
    const interval = setInterval(updateStatus, 1000);
    return () => clearInterval(interval);
  }, [config]);

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    return `${minutes}m ${seconds}s`;
  };

  const handleStartTest = () => {
    if (testStatus === "active") navigate("/instructions");
  };

  const renderButton = () => {
    switch (testStatus) {
      case "checking":
        return <button className={`${styles.button} ${styles.loginButton}`} disabled>Checking...</button>;
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
            <button onClick={handleStartTest} className={`${styles.button} ${styles.loginButton}`}>
              Start Test
            </button>
            <p className="text-white mt-2">
              Time remaining: {timeRemaining ? formatTime(timeRemaining) : "..."}
            </p>
          </div>
        );
      case "ended":
        return <button className={`${styles.button} ${styles.loginButton}`} disabled>Test Period Ended</button>;
      default:
        return <button className={`${styles.button} ${styles.loginButton}`} disabled>Please wait...</button>;
    }
  };

  if (!config) return <div>Loading configuration...</div>;

  return (
    <div className={styles.heroContainer}>
      <img src={heroImg} alt="hero-bg-img" className={styles.heroImg} />
      <img src={logo} alt="ccs-logo" className={styles.logo} />
      <div className={styles.buttons}>{renderButton()}</div>
    </div>
  );
}

export default Hero;
