import { useState, useRef, useEffect } from 'react';
import { ResizableBox } from 'react-resizable';
import Draggable from 'react-draggable';
import 'react-resizable/css/styles.css';
import '../styles/admin.css';
import Dashboard from '../components/dashboard';  // Import the Dashboard component   
import { useNavigate } from 'react-router-dom';  

function Admin() {

  

  const getWindowDimensions = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    if (width > 1200) {
      return {
        width: width * 0.4,  // 40% of screen width
        height: height * 0.6,  // 60% of screen height
        minWidth: width * 0.25,  // 25% of screen width
        minHeight: height * 0.3,  // 30% of screen height
        maxWidth: width * 0.8,  // 80% of screen width
        maxHeight: height * 0.8  // 80% of screen height
      };
    } else if (width > 1024) {
      return {
        width: width * 0.5,  // 50% of screen width
        height: height * 0.5,  // 50% of screen height
        minWidth: width * 0.3,  // 30% of screen width
        minHeight: height * 0.25,  // 25% of screen height
        maxWidth: width * 0.7,  // 70% of screen width
        maxHeight: height * 0.7  // 70% of screen height
      };
    } else if (width > 768) {
      return {
        width: width * 0.6,  // 60% of screen width
        height: height * 0.4,  // 40% of screen height
        minWidth: width * 0.4,  // 40% of screen width
        minHeight: height * 0.2,  // 20% of screen height
        maxWidth: width * 0.8,  // 80% of screen width
        maxHeight: height * 0.6  // 60% of screen height
      };
    } else if (width > 480) {
      return {
        width: width * 0.85,  // 85% of screen width
        height: height * 0.3,  // 30% of screen height
        minWidth: width * 0.7,  // 70% of screen width
        minHeight: height * 0.2,  // 20% of screen height
        maxWidth: width * 0.95,  // 95% of screen width
        maxHeight: height * 0.5  // 50% of screen height
      };
    } else {
      // Extra small devices
      return {
        width: width * 0.95,  // 95% of screen width
        height: height * 0.25,  // 25% of screen height
        minWidth: width * 0.9,  // 90% of screen width
        minHeight: height * 0.15,  // 15% of screen height
        maxWidth: width,  // Full width
        maxHeight: height * 0.4  // 40% of screen height
      };
    }
  };

  const [isOpen, setIsOpen] = useState(true);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [activeTooltip, setActiveTooltip] = useState('');
  const [activeWindow, setActiveWindow] = useState(null);
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());
  const nodeRef = useRef(null);
  const dragBounds = useRef(null);

  // Effect for initial dimensions and resize handling
  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions(getWindowDimensions());
    };

    // Set initial dimensions
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Effect to force update when activeWindow changes
  useEffect(() => {
    if (activeWindow) {
      setWindowDimensions(getWindowDimensions());
    }
  }, [activeWindow]);

  const handleMouseMove = (e, text) => {
    setTooltipPosition({ x: e.clientX, y: e.clientY });
    setActiveTooltip(text);
  };

  const handleMouseLeave = () => {
    setActiveTooltip('');
  };

  const handleClick = (e, component) => {
    e.preventDefault();
    setActiveWindow(component);
  };

  const renderWindowContent = (title, content) => (
    <div className="window-container">
      <div className="window-header">
        <h2>{title}</h2>
        <button onClick={() => setActiveWindow(null)}>×</button>
      </div>
      <div className="window-content">
        {content}
      </div>
    </div>
  );

  const getDefaultPosition = () => {
    const width = window.innerWidth;
    if (width > 1200) {
      return { x: 900, y: 200 };
    } else if (width > 1024) {
      return { x: 700, y: 200 };
    } else if (width > 768) {
      return { x: 500, y: 200 };
    } else {
      return { x: 100, y: 200 };
    }
  };

  const isMobile = window.innerWidth <= 480;

  const renderContent = (title, content) => {
    if (isMobile) {
      return (
        <div className="mobile-section">
          <div className="mobile-header">
            <h2>{title}</h2>
            <button onClick={() => setActiveWindow(null)}>×</button>
          </div>
          <div className="mobile-content">
            {content}
          </div>
        </div>
      );
    }

    return (
      <Draggable 
        handle=".window-header" 
        nodeRef={nodeRef}
        defaultPosition={getDefaultPosition()}
        bounds=".windows-container"
      >
        <div ref={nodeRef} style={{ position: 'absolute', height: 'auto' }}>
          <ResizableBox
            className="component-window"
            width={windowDimensions.width}
            height={windowDimensions.height}
            minConstraints={[windowDimensions.minWidth, windowDimensions.minHeight]}
            maxConstraints={[windowDimensions.maxWidth, windowDimensions.maxHeight]}
          >
            {renderWindowContent(title, content)}
          </ResizableBox>
        </div>
      </Draggable>
    );
  };

  const renderWindow = () => {
    switch(activeWindow) {
      case 'automation':
        return renderContent('Automation', <h3>Automation Content</h3>);
      case 'settings':
        return renderContent('Settings', <h3>Settings Content</h3>);
      default:
        return null;
    }
  };

  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    fetch("http://localhost:54321/auth", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.isAuthenticated) {
          navigate("/login");
        } else {
          setIsAuthenticated(true);
        }
      });


  // Destroy session when tab is closed
  const handleTabClose = () => {
    fetch("http://localhost:5000/logout", {
      method: "POST",
      credentials: "include",
    });
  };

  window.addEventListener("beforeunload", handleTabClose);

  return () => {
    window.removeEventListener("beforeunload", handleTabClose);
  };
}, [navigate]);



  const logout = async () => {
    await fetch("http://localhost:5000/logout", {
      method: "POST",
      credentials: "include",
    });
    navigate("/login");
  };

  if (!isAuthenticated) return null; // Prevent flashing of admin page while checking auth


  return (
    <div className="admin-container" ref={dragBounds}>
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
          <div className="mini-dashboard mt-11">
            <Dashboard isMinimized={true} />
          </div>
        )}
      </div>
      <div className='fixed right-0 flex flex-start flex-row h-full top-0 admin-menu'>
        <ul className='flex flex-col text-center text-3xl gap-8 justify-center mr-9'>
          <li>
            <a 
              href="/automation" 
              className="hover:text-blue-500 hover:scale-150 transition-all transform inline-block"
              onMouseMove={(e) => handleMouseMove(e, 'Automation')}
              onMouseLeave={handleMouseLeave}
              onClick={(e) => handleClick(e, 'automation')}
            >A</a>
          </li>
          <li>
            <a
              href="/settings" 
              className="hover:text-blue-500 hover:scale-150 transition-all transform inline-block"
              onMouseMove={(e) => handleMouseMove(e, 'Settings')}
              onMouseLeave={handleMouseLeave}
              onClick={(e) => handleClick(e, 'settings')}
            >S</a>
          </li>
          <li>
            <a 
              href="/login" 
              className="hover:text-blue-500 hover:scale-150 transition-all transform inline-block"
              onMouseMove={(e) => handleMouseMove(e, 'Logout')}
              onMouseLeave={handleMouseLeave}
              onClick={logout}
            >L</a>
          </li>
        </ul>
      </div>
      <div className="windows-container">
        {activeWindow && renderWindow()}
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