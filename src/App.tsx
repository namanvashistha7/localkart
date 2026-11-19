/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { LandingPage } from './components/landing/LandingPage';
import { ProductDiscovery } from './components/discovery/ProductDiscovery';
import { StoreDirectory } from './components/stores/StoreDirectory';
import { StoreProfileView } from './components/stores/StoreProfileView';
import { CustomerDashboard } from './components/customer/CustomerDashboard';
import { RetailerDashboard } from './components/retailer/RetailerDashboard';
import { RetailerRegistration } from './components/retailer/RetailerRegistration';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { FounderWorkspace } from './components/founder/FounderWorkspace';
import { AboutPage } from './components/info/AboutPage';
import { HelpPage } from './components/info/HelpPage';
import { AuthPage } from './components/auth/AuthPage';
import { ErrorBoundary } from './components/common/ErrorBoundary';

const AppContent: React.FC = () => {
  const { currentView } = useApp();

  const renderCurrentView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPage />;
      case 'discovery':
        return <ProductDiscovery />;
      case 'store_directory':
        return <StoreDirectory />;
      case 'store_profile':
        return <StoreProfileView />;
      case 'customer_dashboard':
        return <CustomerDashboard />;
      case 'retailer_dashboard':
        return <RetailerDashboard />;
      case 'retailer_registration':
        return <RetailerRegistration />;
      case 'admin_dashboard':
        return <AdminDashboard />;
      case 'founder_workspace':
        return <FounderWorkspace />;
      case 'about':
        return <AboutPage />;
      case 'help':
        return <HelpPage />;
      case 'auth':
        return <AuthPage />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-800 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-950">
      <Navbar />
      <main className="flex-1">
        {renderCurrentView()}
      </main>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
