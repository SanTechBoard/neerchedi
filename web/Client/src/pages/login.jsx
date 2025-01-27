<<<<<<< HEAD
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });
    
                const data = await response.json();
    
                if (response.ok) {
                    localStorage.setItem('token', data.token); // Store the token
                    console.log('Login successful:', 'data:'+ data.token)
                    navigate('/admin'); // Redirect to the protected route
                } else {
                    alert(data.error);
                }
            } catch (error) {
                console.error('Error during login:', error);
                alert('An error occurred. Please try again.');
            }
        };

=======
import "../styles/login.css";
function Login() {
>>>>>>> origin/master
  return (
    <>
        <div id="main-login">
            <div>
                <h1>Login</h1>
            </div>
            <div className="login-container">
<<<<<<< HEAD
                <form onSubmit={handleLogin} className="login-form">
                    <input type="text" onChange={(e) => setEmail(e.target.value)} placeholder="Username" name='email' className="login-element" />
                    <input type="password" onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="login-element" />
=======
                <form action="" className="login-form">
                    <input type="text" placeholder="Username" className="login-element" />
                    <input type="password" placeholder="Password" className="login-element" />
>>>>>>> origin/master
                    <button type="submit" className="login-element">Login</button>
                </form>
            </div>
        </div>
    </>

  )
}

export default Login;