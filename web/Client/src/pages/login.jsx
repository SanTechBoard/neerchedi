import React, {  useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

function Login() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    
    
    const handleLogin = async (e) => {
            e.preventDefault();
    
            try {
                const response = await fetch('http://localhost:54321/login', {
                    method: 'POST',
                    credentials: "include",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });
    
                const data = await response.json();
                console.log('response:', data);
                
                if (response.ok) {
                    navigate('/admin'); // Redirect to the protected route
                } else {
                    alert(data.error);
                }
            } catch (error) {
                console.error('Error during login:', error);
                alert('An error occurred. Please try again.');
            }
        };

      

  return (
    <>
        <div id="main-login">
            <div>
                <h1>Login</h1>
            </div>
            <div className="login-container">
                <form onSubmit={handleLogin} className="login-form">
                    <input type="text" onChange={(e) => setEmail(e.target.value)} placeholder="Username" name='email' className="login-element" />
                    <input type="password" onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="login-element" />
                    <button type="submit" className="login-element">Login</button>
                </form>
            </div>
        </div>
    </>

  )
}

export default Login;