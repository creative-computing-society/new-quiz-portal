import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import Test from "./Pages/OurTest";
import Signup from "./Pages/SignUp";
import AdminPanel from "./Pages/AdminPannel";
import Testing from "./Pages/Testing";
// import Login from "./Pages/Login";
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
        const token = Cookies.get("jwt");
        if (!token) {
          setIsAuthenticated(false);
          return;
        }

        const response = await fetch(
          `${process.env.REACT_APP_BACKEND}/api/v1/users/verifyd`,
          {
            headers: {
              Authorization: `${token}`,
            },
          }
        );
        const data = await response.json();
        // console.log(data);
        setIsAuthenticated(data.verified); // Adjust based on your API response
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
          {/* <Route path="/login" element={<Login />} /> */}
          <Route path="/testing" element={<Testing />} />
          {/* <Route path="/signup" element={<ProtectedRoute element={<Signup />}/>} /> */}
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/home"
            element={<ProtectedRoute element={<Home />} />}
            // element={<Home />}
          />
          {/* <Route
            path="/admin"
            element={<ProtectedRoute element={<AdminPanel />} />}
            // element={<AdminPanel />}
          /> */}
          <Route
            path="/instructions"
            element={<ProtectedRoute element={<Instructions />} />}
            // element={<Instructions />}
          />

          <Route path="/test" element={<ProtectedRoute element={<Test />} />} />
          <Route
            path="/submitted"
            element={<ProtectedRoute element={<Submitted />} />}
            // element={<Submitted />}
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
