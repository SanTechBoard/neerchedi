import './styles/nav.css'
function Nav() {
  return (
    <nav className='fixed bottom-0 left-0 right-0 flex justify-center'>
      <ul className='flex justify-center text-center text-3xl gap-8'>
        <li >
            <a href="/">Home</a>
        </li>
        <li>
          <a href="/login">Login</a>
        </li>
      </ul>
    </nav>
  )
}

export default Nav;