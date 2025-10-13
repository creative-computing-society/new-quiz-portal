import React, { useState } from "react";
import ccs from "./assets/ccs_logo.png";

const Testing = () => {
  const [isHovered, setIsHovered] = useState(false);
  const handleLogin = () => {
    // Use backend's Google OAuth endpoint from swagger
    window.location.href = `${process.env.REACT_APP_BACKEND}/auth/google`;
  };

  return (
    <div className="h-screen flex justify-center items-center p-4 bg-[#1E1E30]">
      <div className="flex flex-col md:flex-row items-center gap-14 justify-between h-auto md:h-[30vh] w-full md:w-[100vh] relative bg-transparent border-2 border-[#FFFFFF80] rounded-2xl backdrop-blur-lg p-5 md:p-10">
        <img
          src={ccs}
          alt="logo"
          className="w-3/4 md:w-[330px] h-auto md:h-[170px] mb-5 md:mb-0"
        />
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <h1 className="text-white text-xl md:text-3xl mb-4 md:mb-2 font-bold">
          Recruitment Quiz          </h1>
          <button
            className={`w-full md:w-3/4 h-10 mt-4 rounded-full bg-[#4BB8D9] shadow-lg font-bold text-white focus:outline-none ${
              isHovered ? "opacity-70 scale-105 rotate-[-1deg]" : ""
            } transition-all duration-250`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleLogin}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Testing;
