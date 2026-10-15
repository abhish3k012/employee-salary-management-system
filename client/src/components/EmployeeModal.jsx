import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const COUNTRIES = [
  { name: 'United States', currency: 'USD' },
  { name: 'United Kingdom', currency: 'GBP' },
  { name: 'India', currency: 'INR' },
  { name: 'Germany', currency: 'EUR' },
  { name: 'Canada', currency: 'CAD' },
  { name: 'Australia', currency: 'AUD' },
  { name: 'Japan', currency: 'JPY' },
  { name: 'Singapore', currency: 'SGD' }
];

const DEPARTMENTS = [
  'Engineering',
  'Marketing',
  'Sales',
  'Human Resources',
  'Finance',
  'Operations',
  'Product',
  'Design',
  'Legal',
  'Customer Support'
];

const DESIGNATIONS = [
  'Junior',
  'Mid-Level',
  'Senior',
  'Lead',
  'Manager',
  'Director',
  'VP'
];

export default function EmployeeModal({ isOpen, onClose, employeeToEdit, onSaved }) {
  const isEdit = Boolean(employeeToEdit);

  const [formData, setFormData] = useState({
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: 'Engineering',
    designation: 'Senior',
    country: 'United States',
    city: '',
    salary: '',
    currency: 'USD',
    dateOfJoining: new Date().toISOString().split('T')[0]
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (employeeToEdit) {
      setFormData({
        employeeId: employeeToEdit.employeeId || '',
        firstName: employeeToEdit.firstName || '',
        lastName: employeeToEdit.lastName || '',
        email: employeeToEdit.email || '',
        phone: employeeToEdit.phone || '',
        department: employeeToEdit.department || 'Engineering',
        designation: employeeToEdit.designation || 'Senior',
        country: employeeToEdit.country || 'United States',
        city: employeeToEdit.city || '',
        salary: employeeToEdit.salary !== undefined ? employeeToEdit.salary : '',
        currency: employeeToEdit.currency || 'USD',
        dateOfJoining: employeeToEdit.dateOfJoining
          ? new Date(employeeToEdit.dateOfJoining).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
      });
    } else {
      // New employee auto ID suggestion
      const randomSuffix = Math.floor(10000 + Math.random() * 90000);
      setFormData({
        employeeId: `EMP${randomSuffix}`,
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        department: 'Engineering',
        designation: 'Senior',
        country: 'United States',
        city: '',
        salary: '85000',
        currency: 'USD',
        dateOfJoining: new Date().toISOString().split('T')[0]
      });
    }
    setError('');
  }, [employeeToEdit, isOpen]);

  if (!isOpen) return null;

  const handleCountryChange = (e) => {
    const selectedCountry = e.target.value;
    const matched = COUNTRIES.find(c => c.name === selectedCountry);
    setFormData(prev => ({
      ...prev,
      country: selectedCountry,
      currency: matched ? matched.currency : prev.currency
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side quick check
    if (Number(formData.salary) < 0) {
      setError('Salary must be greater than or equal to 0.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        salary: parseFloat(formData.salary)
      };

      if (isEdit) {
        await api.updateEmployee(employeeToEdit.id, payload);
      } else {
        await api.createEmployee(payload);
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save employee record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{isEdit ? 'Edit Employee Record' : 'Add New Employee'}</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="alert alert-danger">
                {error}
              </div>
            )}

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Employee ID *</label>
                <input
                  type="text"
                  name="employeeId"
                  className="form-input"
                  value={formData.employeeId}
                  onChange={handleChange}
                  required
                  disabled={isEdit}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  className="form-input"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  className="form-input"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Department *</label>
                <select
                  name="department"
                  className="form-select"
                  value={formData.department}
                  onChange={handleChange}
                  required
                >
                  {DEPARTMENTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Designation / Role *</label>
                <select
                  name="designation"
                  className="form-select"
                  value={formData.designation}
                  onChange={handleChange}
                  required
                >
                  {DESIGNATIONS.map(des => (
                    <option key={des} value={des}>{des}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Country *</label>
                <select
                  name="country"
                  className="form-select"
                  value={formData.country}
                  onChange={handleCountryChange}
                  required
                >
                  {COUNTRIES.map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  name="city"
                  className="form-input"
                  placeholder="e.g. New York, London, Bangalore"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label">Annual Salary *</label>
                <input
                  type="number"
                  name="salary"
                  className="form-input"
                  min="0"
                  step="any"
                  value={formData.salary}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Currency *</label>
                <input
                  type="text"
                  name="currency"
                  className="form-input"
                  value={formData.currency}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date of Joining *</label>
                <input
                  type="date"
                  name="dateOfJoining"
                  className="form-input"
                  value={formData.dateOfJoining}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                name="phone"
                className="form-input"
                placeholder="+1 555-0199"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Update Employee' : 'Create Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
