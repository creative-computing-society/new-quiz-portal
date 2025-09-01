import React from "react";
import styles from "../Style/navbar.module.css";
import { TypeAnimation } from "react-type-animation";
import { useNavigate } from "react-router-dom";
import Testing from "../../Testing";
import cookies from "js-cookie";

function Navbar() {
  const [previewUrl, setPreviewUrl] = React.useState(null);
  const [user, setUser] = React.useState({ name: "", email: "", photo: "" });
  const navigate = useNavigate();

  React.useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
      const { name, email } = userData;
      setUser((prevState) => ({ ...prevState, name, email }));

      fetch(
        `${process.env.REACT_APP_BACKEND}/api/v1/users/images?email=${email}`,
        {
          method: "GET",
          credentials: "include", // includes cookies.
          headers: {
            Authorization: `${localStorage.getItem("jwt")}`,
          },
        }
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response: BAD");
          }
          return response.blob();
        })
        .then((blob) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreviewUrl(reader.result);
          };
          reader.readAsDataURL(blob);
        })
        .catch((error) => {
          console.error("Error in photo fetch:", error);
        });
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
          <img
            src={previewUrl}
            alt="Profile Pic"
            className="w-10 h-10 rounded-full object-cover"
          />
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
              onClick={() => {
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
