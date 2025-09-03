import React, { useEffect, useState } from "react";
import ccsLogo from "../assets/ccs_logo.png";

const Header = () => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [user, setUser] = useState({ name: "", email: "", photo: "" });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
      const { name, email, photo } = userData;
      setUser({ name, email, photo: photo || "" });

      // Use photo from localStorage if available, otherwise try to fetch
      if (photo) {
        setPreviewUrl(photo);
      } else {
        // Try to fetch from backend if endpoint exists
        fetch(
          `${process.env.REACT_APP_BACKEND}/api/v1/users/images?email=${email}`,
          {
            method: "GET",
            credentials: "include",
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
            console.warn("Profile image not available:", error);
            // Use a default avatar or initials
            setPreviewUrl(null);
          });
      }
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
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
        )}
        <div>
          <div className="text-blue-500 font-semibold">{user.name}</div>
          <div className="text-gray-500 text-sm">{user.email}</div>
        </div>
      </div>
    </div>
  );
};

export default Header;
