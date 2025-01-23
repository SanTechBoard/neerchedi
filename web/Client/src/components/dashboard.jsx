import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase';
import { useTheme } from './themecontext';

function Dashboard() {
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
    isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-black'
  } p-6 rounded-lg shadow-lg transition-all duration-300`;

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6">Dashboard</h2>
      <h3 className="text-2xl font-semibold mb-4">Hydroponics</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className={cardClass}>
          <h4 className="text-xl font-semibold mb-2">Bloom Time</h4>
          <p className="text-4xl font-bold text-purple-600">{hydroData.bloom_time/1000} s</p>
        </div>
        <div className={cardClass}>
          <h4 className="text-xl font-semibold mb-2">Greens Time</h4>
          <p className="text-4xl font-bold text-green-600">{hydroData.greens_time/1000} s</p>
        </div>
        <div className={cardClass}>
            <h4 className="text-xl font-semibold mb-2">Nutes Time</h4>
          <p className="text-4xl font-bold text-blue-600">{hydroData.nutes_time/1000} s</p>
        </div>
        <div className={cardClass}>
            <h4 className="text-xl font-semibold mb-2">pH</h4>
          <p className="text-4xl font-bold text-blue-600">{hydroData.ph}</p>
        </div>
        <div className={cardClass}>
            <h4 className="text-xl font-semibold mb-2">State</h4>
          <p className="text-4xl font-bold text-blue-600">{hydroData.state}</p>
        </div>
        <div className={cardClass}>
            <h4 className="text-xl font-semibold mb-2">Updating</h4>
          <p className="text-4xl font-bold text-blue-600">{String(hydroData.updating)}</p>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Time</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={cardClass}>
          <h4 className="text-xl font-semibold mb-2">Current Epoch</h4>
          <p className="text-4xl font-bold text-blue-600">{timeData.currentEpoch}</p>
        </div>
        <div className={cardClass}>
          <h4 className="text-xl font-semibold mb-2">Last Updated Epoch</h4>
          <p className="text-4xl font-bold text-orange-500">{timeData.lastUpdatedEpoch}</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;