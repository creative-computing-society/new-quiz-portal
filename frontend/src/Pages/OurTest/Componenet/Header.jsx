import React, { useEffect, useState } from "react";
import ccsLogo from "../assets/ccs_logo.png";

const Header = () => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [user, setUser] = useState({ name: "", email: "", photo: "" });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
      const { name, email } = userData;
      setUser((prevState) => ({ ...prevState, name, email }));

      fetch(
        `${process.env.REACT_APP_BACKEND}/api/v1/users/images?email=${email}`,
        {
          method: "GET",
          credentials: "include", // Include credentials (cookies) with the request
          headers: {
            Authorization: `${localStorage.getItem("jwt")}`,
          },
        }
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
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
          console.error("Error fetching photo:", error);
        });
    }
  }, []);

  return (
    <div
      className="flex items-center p-4 bg-white shadow-lg"
      style={{
        position: "fixed",
        display: "flex",
        justifyContent: "space-between",
        width: "100%",
      }}
    >
      <img src={ccsLogo} alt="Logo" className="w-10 h-10" />
      <div className="text-blue-700 text-2xl font-bold">
        Creative Computing Society
      </div>
      <div className="flex items-center ml-auto space-x-4">
        <img
          src={previewUrl}
          alt="Profile"
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <div className="text-blue-500 font-semibold">{user.name}</div>
          <div className="text-gray-500 text-sm">{user.email}</div>
        </div>
      </div>
    </div>
  );
};

export default Header;
