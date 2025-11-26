import { Routes, Route } from "react-router-dom";
import { ThemeToggle } from './components/themetoggle'
import Home from './pages/home'
import Login from './pages/login'
import Admin from './pages/admin'
import { Navigate } from 'react-router-dom';
import Nav from './components/nav';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './components/themecontext';

function ProtectedRoute({ children }) {
  const isLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Nav />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />
        </Routes>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
