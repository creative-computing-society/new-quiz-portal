import React, { useState } from "react";
import styles from "../Style/timer.module.css";
import { useNavigate } from "react-router-dom";
import config from "../../../config";

function Timer({ updateState }) {
  const navigate = useNavigate();

  const [days, setDays] = React.useState(0);
  const [hours, setHours] = React.useState(0);
  const [minutes, setMinutes] = React.useState(0);
  const [seconds, setSeconds] = React.useState(0);

  const [message, setMessage] = useState("");
  const [button, setButton] = useState(null);

  const startTest = () => {
    navigate("/test");
  };

  // Use config times instead of localStorage
  const now = new Date();
  const slot1Start = new Date(config.slot1_time);
  const slot2Start = new Date(config.slot2_time);

  // Determine which slot to use
  let deadline;
  if (now <= new Date(slot1Start.getTime() + config.test_duration * 60 * 1000)) {
    deadline = slot1Start;
  } else {
    deadline = slot2Start;
  }

  const getTime = () => {
    const time = Date.parse(deadline) - Date.now();    

    setDays(Math.max(0,Math.floor(time / (1000 * 60 * 60 * 24))));
    setHours(Math.max(0,Math.floor((time / (1000 * 60 * 60)) % 24)));
    setMinutes(Math.max(0,Math.floor((time / 1000 / 60) % 60)));
    setSeconds(Math.max(0,Math.floor((time / 1000) % 60)));
  };



  const timerFinished = () => {
    // console.log("checking cond")

    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    })
    .then((stream) => {
      setButton(
        <div><input type="button" value="Start Test" onClick={startTest} className={styles.startTest} /></div>
      )
      setMessage("")
    })
    .catch((err) => {
      setMessage("* Give Camera and Microphone access and refresh this page *")
    });
  }


  React.useEffect(() => {
    // console.log("entered")
    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    })
    .then((stream) => {
      setMessage("")
    })
    .catch((err) => {
      setMessage("* Give Camera and Microphone access and refresh this page *")
    });
  }, [])

  React.useEffect(() => {
    const interval = setInterval(() => {
      if(Date.now() - Date.parse(deadline) > -1000){
        // console.log("timer done")
        clearInterval(interval)
 

        timerFinished()
      }
      getTime()

    }, 1000);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
      <div>
        <div className={styles.timer} role="timer">
        <div className={styles.col}>
          <div className={styles.box}>
            <p id="day">{days < 10 ? "0" + days : days}</p>
            <span className={styles.text}>Days</span>
          </div>
        </div>
        <div className={styles.col}>
          <div className={styles.box}>
            <p id="hour">{hours < 10 ? "0" + hours : hours}</p>
            <span className={styles.text}>Hours</span>
          </div>
        </div>
        <div className={styles.col}>
          <div className={styles.box}>
            <p id="minute">{minutes < 10 ? "0" + minutes : minutes}</p>
            <span className={styles.text}>Minutes</span>
          </div>
        </div>
        <div className={styles.col}>
          <div className={styles.box}>
            <p id="second">{seconds < 10 ? "0" + seconds : seconds}</p>
            <span className={styles.text}>Seconds</span>
          </div>
        </div>
      </div>
      {button}
      <div className={styles.message}>{message}</div>
    </div>
  );
};
export default Timer

