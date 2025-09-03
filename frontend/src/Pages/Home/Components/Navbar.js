import React from "react";
import styles from "../Style/navbar.module.css";
import { TypeAnimation } from "react-type-animation";
import { useNavigate } from "react-router-dom";
import cookies from "js-cookie";

function Navbar() {
  const [user, setUser] = React.useState({ name: "", email: "", photo: "" });
  const navigate = useNavigate();

  React.useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
      const { name, email } = userData;
      setUser((prevState) => ({ ...prevState, name, email }));
      // Note: Profile image functionality removed as endpoint doesn't exist in backend
    }
  }, []);

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
        <div className="flex gap-x-1 items-center space-x-4 mr-3 info">
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-gray-600 text-sm">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </span>
          </div>
          <div>
            <div className="text-blue-500 font-semibold text-2xl capitalize">
              {user.name}
            </div>
            <div className="text-gray-400 text-sm">{user.email}</div>
          </div>
        </div>
        <div className={styles.mobileIcon}></div>
        <div className={styles.navMenu}>
          {/* <BrowserRouter>
                        <div>
                          <Link to="#whyccsid" className={styles.navLinks}>Whyccs?</Link>
                        </div>
                    </BrowserRouter> */}

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
                localStorage.removeItem("user");
                localStorage.removeItem("jwt");
                cookies.remove("jwt");
                navigate("/");
              }}
            >
              Logout
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
