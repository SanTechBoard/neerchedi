import { useState } from 'react';
import Dashboard from '../components/dashboard';
import '../styles/admin.css';

function Admin() {
  const [isOpen, setIsOpen] = useState(true);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [activeTooltip, setActiveTooltip] = useState('');

  const handleMouseMove = (e, text) => {
    setTooltipPosition({ x: e.clientX, y: e.clientY });
    setActiveTooltip(text);
  };

  const handleMouseLeave = () => {
    setActiveTooltip('');
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin</h1>
      <div>
        <div className="flex items-center w-80">
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={isOpen} 
              onChange={(e) => setIsOpen(e.target.checked)} 
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            <span className="ms-3 text-sm font-medium">
              {isOpen ? "Close Dashboard" : "Open Dashboard"}
            </span>
          </label>
        </div>

        {isOpen && (
          <div className="mini-dashboard">
            <Dashboard isMinimized={true} />
          </div>
        )}
      </div>
      <div className='fixed right-0 flex flex-start flex-row h-full top-0 admin-menu'>
        <ul className='flex flex-col text-center text-3xl gap-8 justify-center mr-9'>
          <li>
            <a 
              href="/automation" 
              className="hover:text-blue-500 transition-colors"
              onMouseMove={(e) => handleMouseMove(e, 'Automation')}
              onMouseLeave={handleMouseLeave}
            >A</a>
          </li>
          <li>
            <a 
              href="/settings" 
              className="hover:text-blue-500 transition-colors"
              onMouseMove={(e) => handleMouseMove(e, 'Settings')}
              onMouseLeave={handleMouseLeave}
            >S</a>
          </li>
          <li>
            <a 
              href="/logout" 
              className="hover:text-blue-500 transition-colors"
              onMouseMove={(e) => handleMouseMove(e, 'Logout')}
              onMouseLeave={handleMouseLeave}
            >L</a>
          </li>
        </ul>
      </div>
      {activeTooltip && (
        <div 
          className="floating-tooltip"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`
          }}
        >
          {activeTooltip}
        </div>
      )}
    </div>
  );
}

export default Admin;