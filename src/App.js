import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { MetaMaskProvider } from './context/MetaMaskContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import LoanRequest from './components/loan/LoanRequest';
import LoanOffer from './components/loan/LoanOffer';
import LoanDetail from './components/loan/LoanDetail';
import FinancialLiteracy from './components/education/FinancialLiteracy';
import Training from './components/education/Training';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

const AppContent = () => {
  const location = useLocation();
  const hideHeaderRoutes = []; // Rutas que no van a mostrar el nav bar

  return (
    <div className="flex flex-col min-h-screen">
      {!hideHeaderRoutes.includes(location.pathname) && <Header />}
      <main className="flex-grow">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/loan-request" element={<LoanRequest />} />
          <Route path="/loan-offer" element={<LoanOffer />} />
          <Route path="/loan-detail/:loanId" element={<LoanDetail />} />
          <Route path="/financial-literacy" element={<FinancialLiteracy />} />
          <Route path="/training" element={<Training />} />
          {/* Agrega más rutas según sea necesario */}
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

const App = () => {
  return (
    <MetaMaskProvider>
      <Router>
        <AppContent />
      </Router>
    </MetaMaskProvider>
  );
};

export default App;
