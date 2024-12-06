import { SessionContextProvider, User } from "@supabase/auth-helpers-react";
import supabase from "@/utils/supabase";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { LoginForm } from "@/components/customs/login-form";
import DashboardPage from "@/pages/DashboardPage";
import { useState, useEffect } from "react";
import UpdateUserInfo from "./pages/UpdateProfile";
import UsersPage from "./pages/users/UsersPage";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Flag to show loading state
  const userSession = localStorage.getItem(import.meta.env.VITE_SUPABASE_LOCAL_STORAGE_SESSION);

  // Function to check user session status
  const checkUser = () => {
    return userSession !== null;
  };

  // Initialize user session and set the user state
  useEffect(() => {
    // Check if there's a user session in localStorage or in Supabase
    const session = userSession ? JSON.parse(userSession) : null;
    if (session) {
      setUser(session); // If session exists, set user state
    }
    setLoading(false); // Set loading to false after checking session
  }, [userSession]);

  if (loading) {
    return <div>Loading...</div>; // Optional: Show loading state while checking session
  }

  return (
    <SessionContextProvider supabaseClient={supabase}>
      <Router>
        <Routes>
          {/* Halaman Login */}
          <Route
            path="/"
            element={checkUser() ? <Navigate to="/dashboard" /> : <LoginForm />}
          />

          {/* Halaman Dashboard */}
          <Route
            path="/dashboard"
            element={checkUser() ? <DashboardPage /> : <Navigate to="/" />}
          />
          <Route
            path="/users"
            element={checkUser() ? <UsersPage /> : <Navigate to="/" />}
          />

          {/* Halaman Update */}
          <Route
            path="/update"
            element={<UpdateUserInfo />}
          />
        </Routes>
      </Router>
    </SessionContextProvider>
  );
}

export default App;
