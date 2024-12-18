import Radar from "radar-sdk-js";
import supabase from "@/utils/supabase";
import { useRole } from "@/hooks/useRole";
import LandingPage from "./pages/LandingPage";
import { useState, useEffect } from "react";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import UsersPage from "@/pages/(admin)/users/UsersPage";
import { LoginForm } from "@/components/customs/login-form";
import ProfilePage from "@/pages/(users)/profile/ProfilePage";
// import UpdateUserInfo from "@/pages/(admin)/users/UpdateProfile";
import { SessionContextProvider, User } from "@supabase/auth-helpers-react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import PlacesPage from "./pages/(admin)/places/PlacesPage";

const radarPublishableKey = import.meta.env.VITE_RADAR_TEST_PUBLISHABLE_KEY;
Radar.initialize(radarPublishableKey);

function App() {
  const [loading, setLoading] = useState(true);
  const [, setUser] = useState<User | null>(null);
  const { role, loading: roleLoading } = useRole();
  const userSession = localStorage.getItem(import.meta.env.VITE_SUPABASE_LOCAL_STORAGE_SESSION);

  useEffect(() => {
    const session = userSession ? JSON.parse(userSession) : null;
    if (session) setUser(session);
    setLoading(false);
  }, [userSession]);

  if (loading || roleLoading) return <div>Loading...</div>;

  const checkUser = () => {
    return userSession !== null;
  };

  return (
    <SessionContextProvider supabaseClient={supabase}>
      <Router>
        <Routes>
          <Route
            path="/"
            element={checkUser() ? <Navigate to="/dashboard" /> : <LandingPage />}
          />

          {/* Halaman Login */}
          <Route
            path="/login"
            element={checkUser() ? <Navigate to="/dashboard" /> : <LoginForm />}
          />

          {/* Halaman Dashboard */}
          <Route
            path="/dashboard"
            element={checkUser() ? <DashboardPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/places"
            element={checkUser() ? <PlacesPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/users"
            element={checkUser() && role === 'admin' ? <UsersPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/profile"
            element={checkUser() ? <ProfilePage /> : <Navigate to="/login" />}
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
