import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { MetaMaskProvider } from './context/MetaMaskContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import LoanDetail from './components/loan/LoanDetail';
import RequestedLoans from './components/loan/LoanRequests';
import Offers from './components/loan/LoanOffers';
import MyOffers from './components/loan/MyOffers';
import MyRequests from './components/loan/MyRequests';
import Training from './components/education/Education';
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
          <Route path="/loan-offers" element={<Offers />} />
          <Route path="/requested-loans" element={<RequestedLoans />} />
          <Route path="/my-offers" element={<MyOffers />} />
          <Route path="/my-requests" element={<MyRequests />} />
          <Route path="/loan-detail/:loanId" element={<LoanDetail />} />
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
