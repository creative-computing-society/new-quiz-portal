import React from "react";
import styles from "../Style/navbar.module.css";
import { TypeAnimation } from "react-type-animation";
import { useNavigate } from "react-router-dom";
import cookies from "js-cookie";

function Navbar() {
  const navigate = useNavigate();

  return (
    <nav>
      <div className={styles.navbarContainer}>
        <div className={styles.navbtnContainer}>
          <div className={styles.navBtn}>
            <TypeAnimation
              sequence={["Learn.", 1000, "Code.", 2000, "Collaborate."]}
              wrapper="div"
              cursor={true}
              repeat={Infinity}
            />
          </div>
        </div>
        <div>
          <a
            className={`${styles.navLinks} ${styles.logoutBtn}`}
            href="#carouselid"
            onClick={async () => {
              try {
                await fetch(`${process.env.REACT_APP_BACKEND}/logout`, {
                  credentials: "include",
                });
              } catch (error) {
                console.error("Logout error:", error);
              }
              cookies.remove("jwt");
              navigate("/");
            }}
          >
            Logout
          </a>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
