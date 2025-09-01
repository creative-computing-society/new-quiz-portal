import React from 'react';
import AdminNavbar from './Components/AdminNavBar';
import AdminQuizGenerator from './Components/AdminQuizGenerator';

const AdminPanel = () => {
  return (
    <div>
      <AdminNavbar />
      <AdminQuizGenerator />
    </div>
  );
};

export default AdminPanel;