import Radar from "radar-sdk-js";
import supabase from "@/utils/supabase";
import { useRole } from "@/hooks/useRole";
import MapPage from "@/pages/map/MapPage";
import { useState, useEffect } from "react";
import LandingPage from "./pages/LandingPage";
import EmergencyPage from "@/pages/EmergencyPage";
import UsersPage from "@/pages/(admin)/users/UsersPage";
import TripsPage from "./pages/(admin)/trips/TripsPage";
import PlacesPage from "./pages/(admin)/places/PlacesPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import { LoginForm } from "@/components/customs/login-form";
import TicketsPage from "./pages/(admin)/tickets/TicketsPage";
import ProfilePage from "@/pages/(users)/profile/ProfilePage";
import { SessionContextProvider, User } from "@supabase/auth-helpers-react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";

const radarPublishableKey = import.meta.env.VITE_rlpk;
Radar.initialize(radarPublishableKey);

function App() {
  const [loading, setLoading] = useState(true);
  const [, setUser] = useState<User | null>(null);
  const { loading: roleLoading } = useRole();
  const userSession = localStorage.getItem(import.meta.env.VITE_slss);

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
          <Route
            path="/emergency-only"
            element={checkUser() ? <EmergencyPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/login"
            element={checkUser() ? <Navigate to="/dashboard" /> : <LoginForm />}
          />
          <Route
            path="/dashboard"
            element={checkUser() ? <DashboardPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/maps"
            element={checkUser() ? <MapPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/tickets"
            element={checkUser() ? <TicketsPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/trips"
            element={checkUser() ? <TripsPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/places"
            element={checkUser() ? <PlacesPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/users"
            element={checkUser() ? <UsersPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/profile"
            element={checkUser() ? <ProfilePage /> : <Navigate to="/login" />}
          />
          <Route
            path="*"
            element={<Navigate to="/login" />}
          />
        </Routes>
      </Router>
    </SessionContextProvider>
  );
}

export default App;
