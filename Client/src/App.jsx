import { Routes, Route } from 'react-router-dom'
import { ThemeToggle } from './components/themetoggle'
import Home from './pages/home'
import Login from './pages/login'
import Admin from './pages/admin'
import Nav from './components/nav'
function App() {

  return (
    <>
      <ThemeToggle />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      <Nav />
    </>
  )
}

export default App
