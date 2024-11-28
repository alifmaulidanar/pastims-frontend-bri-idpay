import { SessionContextProvider } from "@supabase/auth-helpers-react";
import supabase from "@/utils/supabase";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { LoginForm } from "@/components/customs/login-forn";
import Dashboard from "@/pages/Dashboard";
import { useUser } from "@supabase/auth-helpers-react";

function App() {
  const user = useUser()

  return (
    <SessionContextProvider supabaseClient={supabase}>
      <Router>
        <Routes>
          <Route path="/" element={!user ? <LoginForm /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    </SessionContextProvider>
  );
}

export default App;
