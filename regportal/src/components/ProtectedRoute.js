import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { fetchWithAuth } from "../api";

export default function ProtectedRoute({ children }) {
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    fetchWithAuth("/verify")
      .then(res => {
        if (res.ok) setAuth(true);
        else setAuth(false);
      })
      .catch(() => setAuth(false));
  }, []);

  if (auth === null) return <div>Loading...</div>;
  if (!auth) return <Navigate to="/" />;
  return children;
}