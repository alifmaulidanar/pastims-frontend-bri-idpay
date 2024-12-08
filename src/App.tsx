import supabase from "@/utils/supabase";
import { useRole } from "@/hooks/useRole";
import { useState, useEffect } from "react";
import DashboardPage from "@/pages/DashboardPage";
import UsersPage from "@/pages/(admin)/users/UsersPage";
import { LoginForm } from "@/components/customs/login-form";
import ProfilePage from "@/pages/(users)/profile/ProfilePage";
// import UpdateUserInfo from "@/pages/(admin)/users/UpdateProfile";
import { SessionContextProvider, User } from "@supabase/auth-helpers-react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";

function App() {
  const [, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Flag to show loading state
  const userSession = localStorage.getItem(import.meta.env.VITE_SUPABASE_LOCAL_STORAGE_SESSION);
  const { role, loading: roleLoading } = useRole();

  // Function to check user session status
  const checkUser = () => {
    return userSession !== null;
  };

  // Initialize user session and set the user state
  useEffect(() => {
    // Check if there's a user session in localStorage or in Supabase
    const session = userSession ? JSON.parse(userSession) : null;
    if (session) {
      setUser(session);
    }
    setLoading(false);
  }, [userSession]);

  if (loading || roleLoading) {
    return <div>Loading...</div>;
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
            element={checkUser() && role === 'admin' ? <UsersPage /> : <Navigate to="/" />}
          />
          <Route
            path="/profile"
            element={checkUser() ? <ProfilePage /> : <Navigate to="/" />}
          />

          {/* Halaman Update */}
          {/* <Route
            path="/update"
            element={<UpdateUserInfo />}
          /> */}
        </Routes>
      </Router>
    </SessionContextProvider>
  );
}

export default App;
