import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import EmployeeList from './components/EmployeeList';
import EmployeeModal from './components/EmployeeModal';
import EmployeeDetailsModal from './components/EmployeeDetailsModal';
import AuthModal from './components/AuthModal';
import { getToken, api } from './services/api';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [token, setToken] = useState(getToken());
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Employee Modals
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState(null);
  const [selectedEmployeeForView, setSelectedEmployeeForView] = useState(null);

  // Success Toast
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  useEffect(() => {
    // Check initial token
    const currentToken = getToken();
    setToken(currentToken);
    if (!currentToken) {
      setAuthModalOpen(true);
    }

    const handleAuthExpired = () => {
      setToken('');
      setAuthModalOpen(true);
      showToast('Session expired. Please sign in again.');
    };

    const handleAuthChanged = () => {
      setToken(getToken());
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    window.addEventListener('auth:changed', handleAuthChanged);

    return () => {
      window.removeEventListener('auth:expired', handleAuthExpired);
      window.removeEventListener('auth:changed', handleAuthChanged);
    };
  }, []);

  const handleLogout = () => {
    api.logout();
    setToken('');
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (newToken) => {
    setToken(newToken);
    showToast('Logged in successfully!');
  };

  const handleOpenAddEmployee = () => {
    if (!token) {
      setAuthModalOpen(true);
      return;
    }
    setEmployeeToEdit(null);
    setEmployeeModalOpen(true);
  };

  const handleOpenEditEmployee = (emp) => {
    if (!token) {
      setAuthModalOpen(true);
      return;
    }
    setEmployeeToEdit(emp);
    setEmployeeModalOpen(true);
  };

  const handleViewEmployee = (emp) => {
    setSelectedEmployeeForView(emp);
  };

  return (
    <div className="app-layout">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        token={token}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {toastMessage && (
        <div className="toast-notification">
          <span>✓ {toastMessage}</span>
          <button className="toast-close" onClick={() => setToastMessage('')}>✕</button>
        </div>
      )}

      <main className="main-content">
        {!token ? (
          <div className="auth-required-banner">
            <div className="auth-card">
              <h3>Authentication Required</h3>
              <p>Please log in to manage records, search the employee directory, and view salary analytics.</p>
              <button className="btn btn-primary" onClick={() => setAuthModalOpen(true)}>
                Sign In / One-Click Demo Login
              </button>
            </div>
          </div>
        ) : activeTab === 'dashboard' ? (
          <Dashboard />
        ) : (
          <EmployeeList
            onAddEmployee={handleOpenAddEmployee}
            onEditEmployee={handleOpenEditEmployee}
            onViewEmployee={handleViewEmployee}
          />
        )}
      </main>

      {/* Add / Edit Employee Modal */}
      <EmployeeModal
        isOpen={employeeModalOpen}
        onClose={() => setEmployeeModalOpen(false)}
        employeeToEdit={employeeToEdit}
        onSaved={() => {
          showToast(employeeToEdit ? 'Employee updated successfully!' : 'Employee created successfully!');
          // Refresh list by triggering state change or reload
          window.dispatchEvent(new Event('employees:updated'));
        }}
      />

      {/* View Employee Details Modal */}
      <EmployeeDetailsModal
        employee={selectedEmployeeForView}
        onClose={() => setSelectedEmployeeForView(null)}
        onEdit={(emp) => handleOpenEditEmployee(emp)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
