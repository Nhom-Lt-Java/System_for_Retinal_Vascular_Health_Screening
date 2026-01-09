import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";

// User Pages
import Upload from "./pages/user/Upload";
import Result from "./pages/user/Result";
import History from "./pages/user/History";
import Profile from "./pages/user/Profile";
import Chat from "./pages/user/Chat";

// Doctor Pages
import Dashboard from "./pages/doctor/Dashboard";
import PatientList from "./pages/doctor/PatientList";

export default function App() {
  const { token, user, loading } = useAuth();

  if (loading) return null;

  const authed = Boolean(token && user);
  const role = String(user?.role || "").trim().toUpperCase();
  const isDoctor = role === "DOCTOR";

  return (
    <>
      {authed && <Navbar />}
      <Routes>
        {/* Auth */}
        <Route path="/login" element={authed ? (isDoctor ? <Navigate to="/doctor" replace /> : <Navigate to="/upload" replace />) : <Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* User routes (nếu bác sĩ vào nhầm thì đá về /doctor) */}
        <Route
          path="/upload"
          element={!authed ? <Navigate to="/login" replace /> : isDoctor ? <Navigate to="/doctor" replace /> : <Upload />}
        />
        <Route
          path="/result"
          element={!authed ? <Navigate to="/login" replace /> : <Result />}
        />
        <Route
          path="/history"
          element={!authed ? <Navigate to="/login" replace /> : isDoctor ? <Navigate to="/doctor" replace /> : <History />}
        />
        <Route
          path="/profile"
          element={!authed ? <Navigate to="/login" replace /> : <Profile />}
        />
        <Route
          path="/chat"
          element={!authed ? <Navigate to="/login" replace /> : isDoctor ? <Navigate to="/doctor" replace /> : <Chat />}
        />

        {/* Doctor routes */}
        <Route
          path="/doctor"
          element={!authed ? <Navigate to="/login" replace /> : isDoctor ? <Dashboard /> : <Navigate to="/upload" replace />}
        />
        <Route
          path="/doctor/patients"
          element={!authed ? <Navigate to="/login" replace /> : isDoctor ? <PatientList /> : <Navigate to="/upload" replace />}
        />

        {/* Home */}
        <Route path="/" element={authed ? (isDoctor ? <Navigate to="/doctor" replace /> : <Navigate to="/upload" replace />) : <Navigate to="/login" replace />} />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
