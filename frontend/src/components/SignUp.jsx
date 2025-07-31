import { useState } from "react";
import { useNavigate } from "react-router-dom";
import config from "../apis/config";
import axios from "axios";

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: "",
    display_name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const isPasswordStrong = (pwd) => /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(pwd);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!isPasswordStrong(formData.password)) {
      setError(
        "Password must be 8+ characters, include an uppercase letter and a number."
      );
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${config.BASE_API_URL}/users/sign-up`,
        formData
      );

      if (res.status >= 200 && res.status < 300) { 
        const user = res.data;
        localStorage.setItem("userInfo", JSON.stringify(user));
        setSuccess("Sign-up successful! Redirecting...");
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        const { message } = res.data
        setError(`${message || "Sign-up failed. Try again."}`);
      }
    } catch (err) {
      console.error(err);
      // Show backend message if available
      if (err.response && err.response.data && err.response.data.error) {
        setError(`${err.response.data.error}`);
      } else {
        setError("Network error. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center mt-5">
      <div
        className="card shadow-lg p-4"
        style={{ maxWidth: "500px", width: "100%" }}
      >
        <h3 className="text-center mb-4">Create Your Account</h3>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Display Name</label>
            <input
              type="text"
              name="display_name"
              className="form-control"
              value={formData.display_name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              type="text"
              name="username"
              className="form-control"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <div className="form-text">
              Use 8+ characters, one uppercase letter, and one number.
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
