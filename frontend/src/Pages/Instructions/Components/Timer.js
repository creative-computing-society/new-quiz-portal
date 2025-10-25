import React, { useState, useEffect } from "react";
import styles from "../Style/timer.module.css";
import { useNavigate } from "react-router-dom";
import { loadConfig } from "../../../config";

function Timer() {
  const navigate = useNavigate();
  const [config, setConfig] = useState(null);
  const [deadline, setDeadline] = useState(null);
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [message, setMessage] = useState("");
  const [button, setButton] = useState(null);

  const startTest = () => navigate("/test");

  // Load config dynamically
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const cfg = await loadConfig();
        setConfig(cfg);

        const now = new Date();
        const slotKeys = Object.keys(cfg).filter(k => k.startsWith("slot") && k.endsWith("_time"));
        const slots = slotKeys.map(k => new Date(cfg[k]));

        // Pick the next slot that hasn't ended
        const nextSlot = slots.find(slotStart => now <= new Date(slotStart.getTime() + cfg.test_duration * 60 * 1000));
        if (nextSlot) setDeadline(nextSlot);
        else setDeadline(null); // All slots ended
      } catch (err) {
        console.error("Failed to load config:", err);
        setMessage("Failed to load test configuration.");
      }
    };

    fetchConfig();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!deadline || !config) return;

    const updateTimer = () => {
      const timeLeft = Math.max(0, Date.parse(deadline) - Date.now());
      setDays(Math.floor(timeLeft / (1000 * 60 * 60 * 24)));
      setHours(Math.floor((timeLeft / (1000 * 60 * 60)) % 24));
      setMinutes(Math.floor((timeLeft / 1000 / 60) % 60));
      setSeconds(Math.floor((timeLeft / 1000) % 60));

      if (timeLeft <= 0) {
        // Timer finished
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
          .then(() => setButton(<input type="button" value="Start Test" onClick={startTest} className={styles.startTest} />))
          .catch(() => setMessage("* Give Camera and Microphone access and refresh this page *"));
      }
    };

    updateTimer(); // Initial calculation
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [deadline, config]);

  // Initial media permission check
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(() => setMessage(""))
      .catch(() => setMessage("* Give Camera and Microphone access and refresh this page *"));
  }, []);

  if (!config) return <div>Loading configuration...</div>;

  return (
    <div>
      <div className={styles.timer} role="timer">
        {[{val: days, label: "Days"}, {val: hours, label: "Hours"}, {val: minutes, label: "Minutes"}, {val: seconds, label: "Seconds"}].map((t, idx) => (
          <div key={idx} className={styles.col}>
            <div className={styles.box}>
              <p>{t.val < 10 ? "0" + t.val : t.val}</p>
              <span className={styles.text}>{t.label}</span>
            </div>
          </div>
        ))}
      </div>
      {button}
      <div className={styles.message}>{message}</div>
    </div>
  );
}

export default Timer;
