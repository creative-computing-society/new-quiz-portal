import React from "react";

export default function ThankYou() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 relative">
      <img src="/3.png" alt="Background" className="absolute inset-0 w-full h-full object-cover z-0" />
      <div className="relative z-10 text-center">
        <img src="/year.png" alt="Logo" className="mx-auto w-32 lg:w-36" />
        <h1 className="text-white text-2xl font-mono mt-4 mb-8">
          Thank you for registering!
        </h1>
      </div>
    </div>
  );
}