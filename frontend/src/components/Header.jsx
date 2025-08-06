import { useAuth } from "../contexts/useAuth";
import { useNavigate } from "react-router-dom";

export const Header = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-primary text-white px-4 py-3 d-flex justify-content-between align-items-center">
      <h2 className="fs-2 text-dark">
        Task<span className="text-light">Tracker</span>
      </h2>
      {
        <button onClick={handleLogout} className="btn btn-light">
          Log Out
        </button>
      }
    </header>
  );
};
