import { useState, useEffect } from "react";
import { database } from "../firebase";
import { ref, get } from "firebase/database";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
    if (isLoggedIn) {
      navigate('/admin');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userRef = ref(database, '/auth/adm/user');
      const passRef = ref(database, '/auth/adm/pass');
      
      const [userSnap, passSnap] = await Promise.all([
        get(userRef),
        get(passRef)
      ]);

      const storedUsername = userSnap.val();
      const storedPassword = passSnap.val();

      if (username === storedUsername && password === storedPassword) {
        localStorage.setItem('isAdminLoggedIn', 'true');
        navigate("/admin");
      } else {
        setError("Invalid username or password");
      }
    } catch (error) {
      setError("Failed to log in. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="main-login">
      <div>
        <h1>Login</h1>
      </div>
      <div className="login-container">
        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}
          <input
            type="text"
            placeholder="Username"
            className="login-element"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="login-element"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button 
            type="submit" 
            className="login-element" 
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;