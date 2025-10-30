import React, { useState, useEffect } from 'react';
import EmployeeList from './components/EmployeeList';
import EmployeeForm from './components/EmployeeForm';
import HierarchyTree from './components/HierarchyTree';
import { testConnection, testEmployeesEndpoint } from './services/api';
import './App.css'; // The only stylesheet you need

function App() {
    const [currentView, setCurrentView] = useState('list');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('checking');
    const [refreshKey, setRefreshKey] = useState(0); // Used to force-reload list

    // Test backend connection when component loads
    useEffect(() => {
        const checkBackendConnection = async () => {
            console.log('Testing backend connection...');
            const isConnected = await testConnection();
            setConnectionStatus(isConnected ? 'connected' : 'disconnected');
            
            if (isConnected) {
                console.log('Testing employees endpoint...');
                await testEmployeesEndpoint();
            }
        };
        
        checkBackendConnection();
    }, []);

    const handleEmployeeAdded = () => {
        setCurrentView('list');
        setSelectedEmployee(null);
        setRefreshKey(prev => prev + 1); // Refresh list
    };

    const handleEmployeeUpdated = () => {
        setCurrentView('list');
        setSelectedEmployee(null);
        setRefreshKey(prev => prev + 1); // Refresh list
    };

    const handleEditEmployee = (employee) => {
        setSelectedEmployee(employee);
        setCurrentView('form');
    };

    const showEmployeeList = () => {
        setCurrentView('list');
        setSelectedEmployee(null);
    };

    const showAddEmployee = () => {
        setSelectedEmployee(null);
        setCurrentView('form');
    };

    const showHierarchy = () => {
        setCurrentView('hierarchy');
        setSelectedEmployee(null);
    };

    // This function renders the correct component based on the currentView state
    const renderCurrentView = () => {
        switch (currentView) {
            case 'list':
                return <EmployeeList 
                           key={refreshKey} 
                           onEdit={handleEditEmployee}
                           onAddEmployee={showAddEmployee} 
                       />;
            case 'form':
                return <EmployeeForm 
                           employee={selectedEmployee} 
                           onSave={selectedEmployee ? handleEmployeeUpdated : handleEmployeeAdded}
                           onCancel={showEmployeeList}
                       />;
            case 'hierarchy':
                return <HierarchyTree key={refreshKey} />; // Added refresh key here too
            default:
                return <EmployeeList 
                           key={refreshKey} 
                           onEdit={handleEditEmployee} 
                           onAddEmployee={showAddEmployee} 
                       />;
        }
    };

    // Helper to get connection status text/style
    const getConnectionStatus = () => {
        if (connectionStatus === 'connected') {
            return <span className="connected">● Connected</span>;
        }
        if (connectionStatus === 'disconnected') {
            return <span className="disconnected">● Disconnected</span>;
        }
        return <span className="checking">● Checking...</span>;
    };


    return (
        <div className="App">
            <header className="App-header">
                <div className="header-top">
                    <h1>Organisation Hierarchy management system</h1>
                    <div className="connection-status">
                        Backend Status: {getConnectionStatus()}
                    </div>
                </div>
                <nav className="main-nav">
                    <button 
                        onClick={showEmployeeList}
                        className={currentView === 'list' ? 'active' : ''}
                    >
                        Employee Directory
                    </button>
                    <button 
                        onClick={showHierarchy}
                        className={currentView === 'hierarchy' ? 'active' : ''}
                    >
                        View Hierarchy
                    </button>
                </nav>
            </header>

            <main className="main-content">
                {connectionStatus === 'disconnected' && (
                    <div className="error-banner">
                        <h3>⚠️ Backend Connection Error</h3>
                        <p>The application cannot connect to the backend server. Please ensure:</p>
                        <ul>
                            <li>The backend server is running (e.g., `npm start` in your server directory).</li>
                            <li>The server is accessible at `http://localhost:5000`.</li>
                            <li>There are no firewall or CORS issues blocking requests.</li>
                        </ul>
                    </div>
                )}

                {renderCurrentView()}
            </main>
        </div>
    );
}

export default App;