import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div>
      <h2>Dashboard</h2>
      <nav>
        <ul>
          <li><Link to="/loan-request">Request a Loan</Link></li>
          <li><Link to="/loan-offer">Offer a Loan</Link></li>
        </ul>
      </nav>
    </div>
  );
};

export default Dashboard;
