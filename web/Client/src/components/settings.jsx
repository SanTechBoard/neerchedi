import React, { useState, useEffect } from 'react';
import { ref, set, onValue } from 'firebase/database';
import { database } from '../firebase';

const Settings = () => {
  const [controls, setControls] = useState({
    greens: false,
    nutes: false,
    blooms: false,
    inlet: false,
    outlet: false,
    greensPump: false,
    nutesPump: false,
    bloomsPump: false,
  });

  // Listen for changes from Firebase
  useEffect(() => {
    const controlsRef = ref(database, 'controls');
    const unsubscribe = onValue(controlsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setControls(data);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleToggle = async (control) => {
    const newState = !controls[control];
    
    // Create a reference to the control state and pump state
    const controlsRef = ref(database, 'controls');
    
    try {
      // Update Firebase first
      await set(controlsRef, {
        ...controls,
        [control]: newState,
        // Ensure pump states are also updated
        [`${control}Pump`]: newState
      });

      // Only update local state after Firebase success
      setControls(prev => ({
        ...prev,
        [control]: newState
      }));

    } catch (error) {
      console.error('Error updating control state:', error);
      // Show error to user
      alert(`Failed to update ${control} control. Please try again.`);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Manual Controls</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-700 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Nutrient Systems</h3>
          <div className="flex flex-col items-center space-y-4">
            <div className="w-full space-y-2">
              <button
                onClick={() => handleToggle('greens')}
                className={`w-full py-4 px-6 rounded-lg text-lg font-bold transition-all duration-200 ${
                  controls.greens
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500'
                }`}
              >
                {controls.greens ? 'Greens ON' : 'Greens OFF'}
              </button>
              <div className="text-sm text-gray-600 dark:text-gray-300 text-center">
                Pump Status: {controls.greensPump ? 'Running' : 'Stopped'}
              </div>
            </div>
            <div className="w-full space-y-2">
              <button
                onClick={() => handleToggle('nutes')}
                className={`w-full py-4 px-6 rounded-lg text-lg font-bold transition-all duration-200 ${
                  controls.nutes
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500'
                }`}
              >
                {controls.nutes ? 'Nutes ON' : 'Nutes OFF'}
              </button>
              <div className="text-sm text-gray-600 dark:text-gray-300 text-center">
                Pump Status: {controls.nutesPump ? 'Running' : 'Stopped'}
              </div>
            </div>
            <div className="w-full space-y-2">
              <button
                onClick={() => handleToggle('blooms')}
                className={`w-full py-4 px-6 rounded-lg text-lg font-bold transition-all duration-200 ${
                  controls.blooms
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500'
                }`}
              >
                {controls.blooms ? 'Blooms ON' : 'Blooms OFF'}
              </button>
              <div className="text-sm text-gray-600 dark:text-gray-300 text-center">
                Pump Status: {controls.bloomsPump ? 'Running' : 'Stopped'}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-700 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Water Control</h3>
          <div className="flex flex-col items-center space-y-4">
            <button
              onClick={() => handleToggle('inlet')}
              className={`w-full py-4 px-6 rounded-lg text-lg font-bold transition-all duration-200 ${
                controls.inlet
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500'
              }`}
            >
              {controls.inlet ? 'Inlet ON' : 'Inlet OFF'}
            </button>
            <button
              onClick={() => handleToggle('outlet')}
              className={`w-full py-4 px-6 rounded-lg text-lg font-bold transition-all duration-200 ${
                controls.outlet
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500'
              }`}
            >
              {controls.outlet ? 'Outlet ON' : 'Outlet OFF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
