import React from 'react';
import { formatCurrency } from '../utils/currency';

export default function EmployeeDetailsModal({ employee, onClose, onEdit }) {
  if (!employee) return null;

  const joinDate = new Date(employee.dateOfJoining);
  const tenureYears = ((Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)).toFixed(1);

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <div>
            <h3>Employee Profile</h3>
            <span className="emp-id-badge" style={{ marginTop: '0.25rem' }}>{employee.employeeId}</span>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="profile-header-card">
            <div className="profile-avatar">
              {employee.firstName[0]}{employee.lastName[0]}
            </div>
            <div className="profile-info">
              <h4>{employee.firstName} {employee.lastName}</h4>
              <p className="profile-role">{employee.designation} • {employee.department}</p>
              <p className="profile-email">{employee.email}</p>
            </div>
          </div>

          <div className="profile-details-grid">
            <div className="detail-item">
              <span className="detail-label">Annual Salary</span>
              <span className="detail-value" style={{ color: 'var(--color-primary)', fontWeight: '700', fontSize: '1.1rem' }}>
                {formatCurrency(employee.salary, employee.currency)} {employee.currency}
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Country & City</span>
              <span className="detail-value">
                {employee.country} {employee.city ? `(${employee.city})` : ''}
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Date of Joining</span>
              <span className="detail-value">
                {joinDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Tenure</span>
              <span className="detail-value">{tenureYears} Years</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Phone</span>
              <span className="detail-value">{employee.phone || 'Not specified'}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">System Record ID</span>
              <span className="detail-value" style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                {employee.id}
              </span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              onClose();
              onEdit(employee);
            }}
          >
            Edit Employee
          </button>
        </div>
      </div>
    </div>
  );
}
