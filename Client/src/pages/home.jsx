import { ThemeToggle } from '../components/themetoggle';
import Dashboard from '../components/dashboard';

function Home() {
  return (
    <>
      <ThemeToggle />
      <div className="max-w-4xl mx-auto px-4 mb-12">
        <h1>Home test</h1>
        <Dashboard />
      </div>
    </>
  );
}

export default Home;