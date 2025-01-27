import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase';
import { useTheme } from './themecontext';
<<<<<<< HEAD
import { use } from 'react';
import axios from 'axios';

function Dashboard({ isMinimized = false }) {

=======

function Dashboard({ isMinimized = false }) {
>>>>>>> origin/master
  const { isDark } = useTheme();
  const [hydroData, setHydroData] = useState({
    bloom_time: 0,
    greens_time: 0,
    nutes_time: 0,
    ph: 0,
    state: "",
    updating: false
  });

  const [timeData, setTimeData] = useState({
    currentEpoch: 0,
    lastUpdatedEpoch: 0
  });

  useEffect(() => {
    const hydroRef = ref(database, 'hydroponics/');
    onValue(hydroRef, (snapshot) => {
      const value = snapshot.val();
      if (value) {
        setHydroData(value);
      }
    });

    const nutritimeRef = ref(database, 'hydroponics/time/nutrients/');
    onValue(nutritimeRef, (snapshot) => {
      const value = snapshot.val();
      if (value) {
        setTimeData(value);
      }
    });
  }, []);

  const cardClass = `${
<<<<<<< HEAD
    isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-black'
  } p-6 rounded-lg shadow-lg transition-all duration-300`;
=======
    isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
  } p-4 rounded-lg shadow-lg transition-all duration-300`;
>>>>>>> origin/master

  const titleClass = `font-semibold mb-2 ${isMinimized ? 'text-lg' : 'text-xl'}`;
  const valueClass = `font-bold ${isMinimized ? 'text-2xl' : 'text-4xl'}`;
  const sectionClass = `text-2xl font-semibold mb-4 ${isMinimized ? 'text-xl' : 'text-2xl'}`;

<<<<<<< HEAD

=======
>>>>>>> origin/master
  return (
    <div className={`p-4 ${isMinimized ? 'scale-95' : ''}`}>
      <h1 className={`font-bold mb-6 ${isMinimized ? 'text-2xl' : 'text-3xl'}`}>Dashboard</h1>
      
<<<<<<< HEAD
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> 
=======
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
>>>>>>> origin/master
        {/* Hydroponics Section */}
        <div>
          <h2 className={sectionClass}>Hydroponics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className={cardClass}>
              <h3 className={titleClass}>Bloom Time</h3>
<<<<<<< HEAD
                <p className={`${valueClass} text-purple-600`}>{hydroData.bloom_time/1000} s</p>
            </div>
            
            <div className={cardClass}>
              <h3 className={titleClass}>Greens Time</h3>
              <p className={`${valueClass} text-green-600`}> {hydroData.greens_time/1000} s</p>
            </div>
              
=======
              <p className={`${valueClass} text-purple-600`}>{hydroData.bloom_time/1000} s</p>
            </div>
            <div className={cardClass}>
              <h3 className={titleClass}>Greens Time</h3>
              <p className={`${valueClass} text-green-600`}>{hydroData.greens_time/1000} s</p>
            </div>
>>>>>>> origin/master
            <div className={cardClass}>
              <h3 className={titleClass}>Nutes Time</h3>
              <p className={`${valueClass} text-blue-600`}>{hydroData.nutes_time/1000} s</p>
            </div>
<<<<<<< HEAD
            
=======
>>>>>>> origin/master
            <div className={cardClass}>
              <h3 className={titleClass}>pH</h3>
              <p className={`${valueClass} text-blue-600`}>{hydroData.ph}</p>
            </div>
<<<<<<< HEAD
            
=======
>>>>>>> origin/master
            <div className={cardClass}>
              <h3 className={titleClass}>State</h3>
              <p className={`${valueClass} text-blue-600`}>{hydroData.state}</p>
            </div>
<<<<<<< HEAD
            
=======
>>>>>>> origin/master
            <div className={cardClass}>
              <h3 className={titleClass}>Updating</h3>
              <p className={`${valueClass} text-blue-600`}>{String(hydroData.updating)}</p>
            </div>
<<<<<<< HEAD
          
          </div>
        </div>


          {/* Time Section */}
          <div>
            <h2 className={sectionClass}>Time</h2>
            <div className="grid grid-cols-1 gap-3">
              <div className={cardClass}>
                <h3 className={titleClass}>Current Epoch</h3>
                <p className={`${valueClass} text-blue-600`}>{timeData.currentEpoch}</p>
              </div>
              
              <div className={cardClass}>
                <h3 className={titleClass}>Last Updated Epoch</h3>
                <p className={`${valueClass} text-orange-500`}>{timeData.lastUpdatedEpoch}</p>
              </div>
            </div>  
          </div>
=======
          </div>
        </div>

        {/* Time Section */}
        <div>
          <h2 className={sectionClass}>Time</h2>
          <div className="grid grid-cols-1 gap-3">
            <div className={cardClass}>
              <h3 className={titleClass}>Current Epoch</h3>
              <p className={`${valueClass} text-yellow-300`}>{timeData.currentEpoch}</p>
            </div>
            <div className={cardClass}>
              <h3 className={titleClass}>Last Updated Epoch</h3>
              <p className={`${valueClass} text-orange-500`}>{timeData.lastUpdatedEpoch}</p>
            </div>
          </div>
        </div>
>>>>>>> origin/master
      </div>
    </div>
  );
}

export default Dashboard;