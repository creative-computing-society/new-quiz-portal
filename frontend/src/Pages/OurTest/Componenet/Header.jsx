import React, { useEffect, useState } from "react";
import ccsLogo from "../assets/ccs_logo.png";

const Header = () => {
  const [previewUrl, setPreviewUrl] = useState(null);

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
    </div>
  );
};

export default Header;
