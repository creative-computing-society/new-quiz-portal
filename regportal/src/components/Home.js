import React from "react";

export default function Home() {
  const handleRegister = () => {
    window.location.href = "http://localhost:8080/auth/google";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 relative">
      <img src="/3.png" alt="Background" className="absolute inset-0 w-full h-full object-cover z-0" />
      <div className="relative z-10 text-center">
        <img src="/year.png" alt="CCS Logo" className="mx-auto w-32 lg:w-36" />
        <h1 className="text-white text-2xl font-mono mt-4 mb-8">
          Recruitment for Batch of 2029
        </h1>
        <button
          onClick={handleRegister}
          className="px-8 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-900 hover:text-white border-2 border-gray-700 transition-all"
        >
          Register 
        </button>
      </div>
    </div>
  );
}