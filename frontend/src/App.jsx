import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignUp from "./components/SignUp";
import Login from "./components/Login";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import TaskDashboard from "./components/TaskDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./contexts/useAuth";
import { useEffect } from "react";
import { injectLogoutHandler } from "./apis/axios";

function App() {
  const { logout } = useAuth();

  useEffect(() => {
    injectLogoutHandler(logout);
  }, [logout]);

  return (
    <BrowserRouter>
      <Header />
      <Routes>
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
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
