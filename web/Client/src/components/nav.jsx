import { useEffect, useState } from "react";
import './styles/nav.css'


function Nav() {
  const [isAuthenticated, setIsAuthenticated] = useState();

  useEffect(() => {
    fetch("http://localhost:54321/auth", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setIsAuthenticated(data.isAuthenticated))
      .catch((error) => console.error("Auth check failed:", error));
  }, []);

  const handleLogout = async () => {
    await fetch("http://localhost:54321/logout", {
      method: "POST",
      credentials: "include",
    });
    setIsAuthenticated(false);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 flex justify-center">
      <ul className="flex justify-center text-center text-3xl gap-8">
        <li>
          <a href="/">Home</a>
        </li>
        <li>
          {isAuthenticated ? ( <button onClick={handleLogout}>Logout</button> ) : ( <a href="/login">Login</a> )}
        </li>
      </ul>
    </nav>
  );
}

export default Nav;
