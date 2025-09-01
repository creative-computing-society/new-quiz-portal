import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Style/signup.module.css";
import LeftContainer from "./Components/LeftContainer";
import RightContainer from "./Components/RightContainer";
import { useLocation } from "react-router-dom";
import Cookies from "js-cookie";

function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true); // Loader state

  useEffect(() => {
    const token = new URLSearchParams(location.search).get("token");

    const checkRedirect = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND}/api/v1/users/testing`,
          {
            headers: {
              Authorization: `${token}`,
            },
          }
        );
        const redirect = await response.json();

        const cookieOptions = {
          expires: 7,
          secure: true,
        };

        if (redirect.token && redirect.user) {
          Cookies.set("jwt", redirect.token, cookieOptions);
          localStorage.setItem("jwt", redirect.token);
          localStorage.setItem("user", JSON.stringify(redirect.user));
        } else {
          Cookies.remove("jwt");
          localStorage.removeItem("jwt");
          localStorage.removeItem("user");
        }

        if (redirect.result === true) {
          navigate("/home");
        } else if (redirect.result === false && redirect.user.email) {
          navigate("/home");
        } else {
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching the testing endpoint:", error);
      } finally {
        setLoading(false); // Stop loading when request is complete
      }
    };

    if (token) {
      checkRedirect();
    } else {
      setLoading(false); // Stop loading if there's no token
    }
  }, [location.search, navigate]);

  if (loading) {
    return <div>Loading...</div>; // Display loader while loading
  }

  return (
    <div className={styles.mainContainer}>
      <div className={styles.container}>
        <LeftContainer />
        <RightContainer />
      </div>
    </div>
  );
}

export default Signup;
