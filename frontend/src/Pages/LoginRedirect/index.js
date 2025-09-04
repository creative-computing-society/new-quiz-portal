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
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };
  return new Date(date).toLocaleString("en-US", options);
}

function LoginRedirect() {
  const navigate = useNavigate();
  navigate("/test");
  return <>
    Loading...
  </>;
  const user = localStorage.getItem("user");
  if (!user) {
    navigate("/login");
    return null;
  }
  const data = JSON.parse(user);
  let sTime = new Date(data.startTime);
  let eTime = new Date(data.endTime);
  

  eTime = subtractTime(eTime, 5, 30);
  sTime = subtractTime(sTime, 5, 30);


  const formattedSTime = formatTime(sTime);
  const formattedETime = formatTime(eTime);

  const goToHome = () => {
    navigate("/home");
  };

  return (<>
    Loading...
  </>
    // <div className={styles.ovalcont}>
    //   <div className={styles.ovaltext}>
    //     {/* <br />
    //     Will be updated soon
    //     <br /> */}
    //     Please login back at your slot time:
    //     <br />
    //     {formattedSTime} --- {formattedETime}
    //     <br />
    //     All the best!
    //     <br />
    //   </div>
    //   <div className={styles.centerButton}>
    //     <button onClick={goToHome}>Back to Home</button>
    //   </div>
    // </div>
  );
}

export default LoginRedirect;
