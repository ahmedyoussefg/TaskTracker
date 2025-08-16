import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignUp from "./components/SignUp";
import Login from "./components/Login";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import TaskDashboard from "./components/TaskDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./contexts/useAuth";
import { useEffect } from "react";
import { injectLogoutHandler } from "./apis/axios";
import { PublicHeader } from "./components/PublicHeader";
import NotFound from "./components/NotFound";

function App() {
  const { logout, isAuthenticated } = useAuth();

  useEffect(() => {
    injectLogoutHandler(logout);
  }, [logout]);

  return (
    <BrowserRouter>
      {isAuthenticated ? <Header /> : <PublicHeader />}
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <TaskDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
