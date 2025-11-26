import { useState, useEffect } from 'react';
import { useTheme } from './themecontext';
import { ref, onValue, set, push, remove, off, get } from 'firebase/database';
import { database } from '../firebase';

function Automation({ isMinimized = false }) {
    const { isDark } = useTheme();
    const [showForm, setShowForm] = useState(false);
    const [automationData, setAutomationData] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        bloomMl: 50,
        greensMl: 50,
        nutesMl: 50,
        checkDuration: 10
    });
    const [showDeleteWarning, setShowDeleteWarning] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [isEnabled, setIsEnabled] = useState(false);

    useEffect(() => {
        const automationRef = ref(database, '/automations/test');
        const hydroRef = ref(database, '/hydroponics');

        // First get current hydroponics data
        onValue(automationRef, (snapshot) => {
            const value = snapshot.val();
            if (value) {
                // Calculate times (ml/10)
                const bloomTime = (value.bloomMl / 10) * 1000; 
                const greensTime = (value.greensMl / 10) * 1000;
                const nutesTime = (value.nutesMl / 10) * 1000;

                // Get current hydroponics data and update only specific fields
                onValue(hydroRef, (hydroSnapshot) => {
                    const currentHydroData = hydroSnapshot.val() || {};
                    
                    // First set updating to true while preserving other fields
                    set(hydroRef, {
                        ...currentHydroData,
                        bloom_time: 0,
                        greens_time: 0,
                        nutes_time: 0,
                        updating: true
                    });

                    // Then update times after delay while preserving other fields
                    setTimeout(() => {
                        set(hydroRef, {
                            ...currentHydroData,
                            bloom_time: bloomTime,
                            greens_time: greensTime,
                            nutes_time: nutesTime,
                            updating: false
                        });
                    }, 500);
                }, { onlyOnce: true }); // Only read once

                setAutomationData([value]);
            } else {
                setAutomationData([]);
                // Set state to off when no automation exists
                onValue(hydroRef, (hydroSnapshot) => {
                    const currentHydroData = hydroSnapshot.val() || {};
                    set(hydroRef, {
                        ...currentHydroData,
                        state: "off"
                    });
                }, { onlyOnce: true });
            }
        });

        // Read initial hydro state
        onValue(hydroRef, (snapshot) => {
            const hydroData = snapshot.val();
            if (hydroData) {
                setIsEnabled(hydroData.state === "on");
            }
        });

        return () => {
            off(automationRef);
        };
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newAutomation = {
            name: formData.name,
            bloomMl: parseInt(formData.bloomMl),
            greensMl: parseInt(formData.greensMl),
            nutesMl: parseInt(formData.nutesMl),
            checkDuration: parseInt(formData.checkDuration)
        };
        
        const automationRef = ref(database, '/automations/test');
        await set(automationRef, newAutomation);
        
        setFormData({
            name: '',
            bloomMl: 50,
            greensMl: 50,
            nutesMl: 50,
            checkDuration: 10
        });
        setShowForm(false);
    };

    const handleDelete = async () => {
        const automationRef = ref(database, '/automations/test');
        const hydroRef = ref(database, '/hydroponics');
        
        // First set state to off
        const hydroSnapshot = await get(hydroRef);
        const currentHydroData = hydroSnapshot.val() || {};
        await set(hydroRef, {
            ...currentHydroData,
            state: "off"
        });
        
        // Then remove the automation
        await remove(automationRef);
    };

    const handleDeleteClick = () => {
        setShowDeleteWarning(true);
    };

    const handleConfirmDelete = async () => {
        await handleDelete();
        setShowDeleteWarning(false);
    };

    const handleCancelDelete = () => {
        setShowDeleteWarning(false);
    };

    const cardClass = `${
        isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
    } p-4 rounded-lg shadow-lg transition-all duration-300 hover:scale-105`;

    return (
        <div className={`p-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <div className="flex justify-center mb-8">
                {automationData.length === 0 && (
                    <button 
                        onClick={() => setShowForm(true)}
                        className="bg-green-400 hover:bg-green-500 text-white rounded-lg p-2 transition-colors duration-200"
                    >
                        Add Automation
                    </button>
                )}
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
                {Array.isArray(automationData) && automationData.map((automation) => (
                    <div key={automation.id} className={cardClass}>
                        <div className="flex justify-between items-start">
                            <h3 className="text-xl font-bold mb-2">{automation.name}</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setFormData({
                                            name: automation.name,
                                            bloomMl: automation.bloomMl,
                                            greensMl: automation.greensMl,
                                            nutesMl: automation.nutesMl,
                                            checkDuration: automation.checkDuration
                                        });
                                        setEditingId(automation.id);
                                        setShowForm(true);
                                    }}
                                    className="text-green-500 hover:text-blue-700 text-xl font-bold"
                                >
                                    ✏️
                                </button>
                                <button
                                    onClick={handleDeleteClick}
                                    className="text-red-500 hover:text-red-700 text-xl font-bold"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p>Bloom: {automation.bloomMl}ml</p>
                            <p>Greens: {automation.greensMl}ml</p>
                            <p>Nutes: {automation.nutesMl}ml</p>
                            <p>Check Duration: {automation.checkDuration} day(s)</p>
                        </div>
                        <div className="flex items-center w-80 mb-4">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer" 
                                    checked={isEnabled} 
                                    onChange={async () => {
                                        const hydroRef = ref(database, '/hydroponics');
                                        const newState = !isEnabled;
                                        setIsEnabled(newState);
                                        
                                        const snapshot = await get(hydroRef);
                                        const currentData = snapshot.val() || {};
                                        
                                        await set(hydroRef, {
                                            ...currentData,
                                            state: newState ? "on" : "off"
                                        });
                                    }}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                <span className="ms-3 text-sm font-medium">
                                    {isEnabled ? "Automation Enabled" : "Automation Disabled"}
                                </span>
                            </label>
                        </div>
                    </div>
                ))}
            </div>
            {showForm ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <h2 className="text-xl font-bold mb-4">
                        {editingId ? 'Edit Automation' : 'Add Automation'}
                    </h2>
                    <div>
                        <label className="block mb-2">Automation Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full p-2 rounded border bg-transparent border-gray-400"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-2">
                            Bloom ML: {formData.bloomMl}ml
                        </label>
                        <input
                            type="range"
                            name="bloomMl"
                            min="0"
                            max="100"
                            value={formData.bloomMl}
                            onChange={handleInputChange}
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label className="block mb-2">
                            Greens ML: {formData.greensMl}ml
                        </label>
                        <input
                            type="range"
                            name="greensMl"
                            min="0"
                            max="100"
                            value={formData.greensMl}
                            onChange={handleInputChange}
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label className="block mb-2">
                            Nutes ML: {formData.nutesMl}ml
                        </label>
                        <input
                            type="range"
                            name="nutesMl"
                            min="0"
                            max="100"
                            value={formData.nutesMl}
                            onChange={handleInputChange}
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label className="block mb-2">
                            Check Duration : {formData.checkDuration} day(s)
                        </label>
                        <input
                            type="range"
                            name="checkDuration"
                            min="1"
                            max="30"
                            step="1"
                            value={formData.checkDuration}
                            onChange={handleInputChange}
                            className="w-full"
                        />
                    </div>

                    <div className="flex gap-4 justify-end">
                        <button
                            type="button"
                            onClick={() => {
                                setShowForm(false);
                                setEditingId(null);
                                setFormData({
                                    name: '',
                                    bloomMl: 50,
                                    greensMl: 50,
                                    nutesMl: 50,
                                    checkDuration: 10
                                });
                            }}
                            className="bg-gray-400 hover:bg-gray-500 text-white rounded-lg p-2 transition-colors duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-green-400 hover:bg-green-500 text-white rounded-lg p-2 transition-colors duration-200"
                        >
                            Save Automation
                        </button>
                    </div>
                </form>
            ) : null}
            {showDeleteWarning && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className={`${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} p-6 rounded-lg shadow-xl`}>
                        <h3 className="text-xl font-bold mb-4">Delete Automation?</h3>
                        <p className="mb-6">Bodhathode aano cheyyunne? Ithil ninnu thirichu vervavilla</p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={handleCancelDelete}
                                className="bg-gray-400 hover:bg-gray-500 text-white rounded-lg px-4 py-2"
                            >
                                Venda
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2"
                            >
                                Cheytho
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Automation;