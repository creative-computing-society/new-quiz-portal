import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import Test from "./Pages/OurTest";
import Testing from "./Pages/Testing";
import Home from "./Pages/Home";
import Disqualified from "./Pages/Disqualified";
import Instructions from "./Pages/Instructions";
import Submitted from "./Pages/Submitted";
import LoginRedirect from "./Pages/LoginRedirect";

// ProtectedRoute Component
const ProtectedRoute = ({ element }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // Use `null` to indicate loading state

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND}/verify`,
          {
            credentials: "include",
          }
        );
        
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        // console.error("Authentication check failed:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    // Loading state; you can show a loading spinner or placeholder
    return <div>Loading...</div>;
  }

  return isAuthenticated ? element : <Navigate to="/" />;
  // return element;
};

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  useEffect(() => {
    const checkAuth = () => {
      setAuthenticated(!!Cookies.get("jwt"));
    };

    checkAuth();
  }, []);

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Testing />} />
          <Route path="/testing" element={<Testing />} />
          {/* Registration routes omitted for now */}
          
          <Route
            path="/home"
            element={<ProtectedRoute element={<Home />} />}
          />
          <Route
            path="/instructions"
            element={<ProtectedRoute element={<Instructions />} />}
          />
          <Route path="/test" element={<ProtectedRoute element={<Test />} />} />
          <Route
            path="/submitted"
            element={<ProtectedRoute element={<Submitted />} />}
          />
          <Route
            path="/disqualified"
            element={<ProtectedRoute element={<Disqualified />} />}
            // element={<Disqualified />}
          />
          <Route path="*" element={<Navigate to="/" />} />
          <Route path="/loginredirect" element={<LoginRedirect />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
