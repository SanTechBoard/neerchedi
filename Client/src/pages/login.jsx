import "../styles/login.css";
function Login() {
  return (
    <>
        <div id="main-login">
            <div>
                <h1>Login</h1>
            </div>
            <div className="login-container">
                <form action="" className="login-form">
                    <input type="text" placeholder="Username" className="login-element" />
                    <input type="password" placeholder="Password" className="login-element" />
                    <button type="submit" className="login-element">Login</button>
                </form>
            </div>
        </div>
    </>

  )
}

export default Login;