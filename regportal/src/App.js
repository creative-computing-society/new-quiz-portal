import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
// import Register from "./components/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import AlreadyRegistered from "./components/AlreadyRegistered";
import ThankYou from "./components/ThankYou";
import Ended from "./components/Ended";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/register"
          element={
            <ProtectedRoute>
              <Ended />
            </ProtectedRoute>
          }
        />
        <Route path="/already-registered" element={<AlreadyRegistered />} />
        <Route path="/thankyou" element={<ThankYou />} />
      </Routes>
    </Router>
  );
}

export default App;