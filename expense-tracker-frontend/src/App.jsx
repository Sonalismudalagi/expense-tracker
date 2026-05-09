import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import { Toaster } from "react-hot-toast";

function App() {
  const user = localStorage.getItem("user");

  return (
    <Router>
      <Toaster position="top-right" />

      <Routes>
        {/* ✅ PUBLIC ROUTES */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/dashboard" />} />

        {/* 🔒 PROTECTED ROUTES */}
        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/login" />}
        />

        <Route
          path="/analytics"
          element={user ? <Analytics /> : <Navigate to="/login" />}
        />

        {/* DEFAULT */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;