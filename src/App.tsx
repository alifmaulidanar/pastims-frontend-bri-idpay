import { SessionContextProvider, User } from "@supabase/auth-helpers-react";
import supabase from "@/utils/supabase";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { LoginForm } from "@/components/customs/login-form";
import Dashboard from "@/pages/Dashboard";
import { useState, useEffect } from "react";
import UpdateUserInfo from "./pages/UpdateProfile";

function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkUser = () => {
    return user ? true : false;
  };

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
            element={checkUser() ? <Dashboard /> : <Navigate to="/" />}
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
