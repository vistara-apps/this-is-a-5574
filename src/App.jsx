import React, { useState } from 'react';
import AppShell from './components/AppShell';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import { mockICOProjects } from './data/mockData';

function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [currentProject, setCurrentProject] = useState(null);

  const handleCreateICO = (formData) => {
    console.log('Creating ICO with data:', formData);
    
    // In a real app, this would make an API call
    const newProject = {
      projectId: Date.now().toString(),
      ...formData,
      status: 'Draft',
      totalRaised: 0,
      investors: 0,
      progress: 0,
      hardCap: parseInt(formData.hardCap),
      softCap: parseInt(formData.softCap || formData.hardCap * 0.6)
    };

    setCurrentProject(newProject);
    setCurrentView('dashboard');
  };

  const handleViewDashboard = (project) => {
    setCurrentProject(project);
    setCurrentView('dashboard');
  };

  const handleBackToHome = () => {
    setCurrentView('landing');
    setCurrentProject(null);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard project={currentProject || mockICOProjects[0]} />;
      case 'landing':
      default:
        return (
          <LandingPage 
            onCreateICO={handleCreateICO}
            onViewDashboard={handleViewDashboard}
          />
        );
    }
  };

  return (
    <AppShell variant={currentView === 'dashboard' ? 'dashboard' : 'default'}>
      {currentView === 'dashboard' && (
        <div className="bg-white/5 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-3">
            <button 
              onClick={handleBackToHome}
              className="text-white/80 hover:text-white text-sm flex items-center space-x-2"
            >
              <span>← Back to Home</span>
            </button>
          </div>
        </div>
      )}
      {renderContent()}
    </AppShell>
  );
}

export default App;