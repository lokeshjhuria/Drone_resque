import React from 'react';
import { DroneProvider, useDrone } from './context/DroneContext';
import LoginPage from './components/auth/LoginPage';
import Dashboard from './components/dashboard/Dashboard';

const AppContent = () => {
  const { user } = useDrone();

  if (!user) {
    return <LoginPage />;
  }

  return <Dashboard />;
};

function App() {
  return (
    <DroneProvider>
      <AppContent />
    </DroneProvider>
  );
}

export default App;
