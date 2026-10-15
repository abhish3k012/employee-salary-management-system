import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { formatCurrency } from '../utils/currency';

export default function EmployeeList({ onAddEmployee, onEditEmployee, onViewEmployee }) {
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [department, setDepartment] = useState('');
  const [country, setCountry] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Filter options from API
  const [availableDepartments, setAvailableDepartments] = useState([]);
  const [availableCountries, setAvailableCountries] = useState([]);

  // Delete state
  const [deletingId, setDeletingId] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedEmpForDelete, setSelectedEmpForDelete] = useState(null);

  // Load filter options once
  useEffect(() => {
    async function loadFilterOptions() {
      try {
        const filters = await api.getFilters();
        setAvailableDepartments(filters.departments || []);
        setAvailableCountries(filters.countries || []);
      } catch (err) {
        console.error('Failed to load filter options:', err);
      }
    }
    loadFilterOptions();

    // Listen for employee add/edit events to refresh list
    const handleUpdated = () => fetchEmployees(1);
    window.addEventListener('employees:updated', handleUpdated);
    return () => window.removeEventListener('employees:updated', handleUpdated);
  }, []);

  // Fetch employees
  const fetchEmployees = useCallback(async (pageToLoad = pagination.page) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getEmployees({
        page: pageToLoad,
        limit: pagination.limit,
        search,
        department,
        country,
        sortBy,
        sortOrder
      });
      setEmployees(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(err.message || 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  }, [pagination.limit, pagination.page, search, department, country, sortBy, sortOrder]);

  useEffect(() => {
    fetchEmployees(1);
  }, [search, department, country, sortBy, sortOrder, pagination.limit]);

  // Handle Search Submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearch('');
  };

  // Handle Reset all filters
  const handleResetFilters = () => {
    setSearchInput('');
    setSearch('');
    setDepartment('');
    setCountry('');
    setSortBy('createdAt');
    setSortOrder('desc');
  };

  // Handle Sorting
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Handle Delete
  const confirmDelete = (emp) => {
    setSelectedEmpForDelete(emp);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteEmployee = async () => {
    if (!selectedEmpForDelete) return;
    setDeletingId(selectedEmpForDelete.id);
    try {
      await api.deleteEmployee(selectedEmpForDelete.id);
      setDeleteConfirmOpen(false);
      setSelectedEmpForDelete(null);
      fetchEmployees(pagination.page);
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const renderSortIcon = (field) => {
    if (sortBy !== field) {
      return <span className="sort-indicator neutral">↕</span>;
    }
    return <span className="sort-indicator active">{sortOrder === 'asc' ? '▲' : '▼'}</span>;
  };

  return (
    <div className="page-container">
      {/* Header and Add Action */}
      <div className="section-header">
        <div>
          <h2>Employee Directory</h2>
          <p className="section-desc">
            Manage employee compensation records with search, multi-field filtering, and server-side pagination.
          </p>
        </div>
        <button className="btn btn-primary" onClick={onAddEmployee}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add New Employee
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <div className="search-input-wrapper">
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, employee ID, or email..."
              className="form-input search-input"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <button type="button" className="search-clear-btn" onClick={handleClearSearch}>
                ✕
              </button>
            )}
          </div>
          <button type="submit" className="btn btn-secondary">
            Search
          </button>
        </form>

        <div className="filter-selects">
          <select
            className="form-select"
            value={department}
            onChange={e => setDepartment(e.target.value)}
          >
            <option value="">All Departments</option>
            {availableDepartments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <select
            className="form-select"
            value={country}
            onChange={e => setCountry(e.target.value)}
          >
            <option value="">All Countries</option>
            {availableCountries.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {(search || department || country || sortBy !== 'createdAt') && (
            <button className="btn btn-secondary btn-sm" onClick={handleResetFilters} title="Reset filters">
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Employee Table */}
      <div className="card-panel" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('employeeId')} className="sortable-th">
                  Employee ID {renderSortIcon('employeeId')}
                </th>
                <th onClick={() => handleSort('firstName')} className="sortable-th">
                  Name {renderSortIcon('firstName')}
                </th>
                <th>Email</th>
                <th onClick={() => handleSort('department')} className="sortable-th">
                  Department {renderSortIcon('department')}
                </th>
                <th>Designation</th>
                <th onClick={() => handleSort('country')} className="sortable-th">
                  Country {renderSortIcon('country')}
                </th>
                <th onClick={() => handleSort('salary')} className="sortable-th" style={{ textAlign: 'right' }}>
                  Salary {renderSortIcon('salary')}
                </th>
                <th onClick={() => handleSort('dateOfJoining')} className="sortable-th">
                  Joining Date {renderSortIcon('dateOfJoining')}
                </th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div className="spinner"></div>
                    <span style={{ color: 'var(--color-text-muted)' }}>Loading employee records...</span>
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                    No employees matching the criteria found.
                  </td>
                </tr>
              ) : (
                employees.map(emp => (
                  <tr key={emp.id}>
                    <td>
                      <span className="emp-id-badge">{emp.employeeId}</span>
                    </td>
                    <td style={{ fontWeight: '600' }}>
                      {emp.firstName} {emp.lastName}
                    </td>
                    <td style={{ color: 'var(--color-text-secondary)' }}>{emp.email}</td>
                    <td>
                      <span className="badge badge-blue">{emp.department}</span>
                    </td>
                    <td>{emp.designation}</td>
                    <td>
                      {emp.country}
                      {emp.city && <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>, {emp.city}</span>}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '600', color: 'var(--color-primary)' }}>
                      {formatCurrency(emp.salary, emp.currency)}
                      <span className="badge badge-gray" style={{ marginLeft: '0.4rem', fontSize: '0.7rem' }}>
                        {emp.currency}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                      {new Date(emp.dateOfJoining).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="row-actions">
                        <button
                          className="action-btn"
                          title="View Details"
                          onClick={() => onViewEmployee(emp)}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                        <button
                          className="action-btn"
                          title="Edit Employee"
                          onClick={() => onEditEmployee(emp)}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          className="action-btn action-btn-danger"
                          title="Delete Employee"
                          onClick={() => confirmDelete(emp)}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Server-Side Pagination Controls */}
        <div className="pagination-bar">
          <div className="pagination-info">
            Showing {employees.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            <strong>{pagination.total.toLocaleString()}</strong> employees
          </div>

          <div className="pagination-controls">
            <div className="pagination-limit-select">
              <label>Rows per page:</label>
              <select
                className="form-select form-select-sm"
                value={pagination.limit}
                onChange={e => {
                  const newLimit = parseInt(e.target.value);
                  setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="pagination-buttons">
              <button
                className="btn btn-secondary btn-sm pagination-btn"
                disabled={pagination.page <= 1 || loading}
                onClick={() => fetchEmployees(1)}
                title="First Page"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="11 17 6 12 11 7" />
                  <polyline points="18 17 13 12 18 7" />
                </svg>
                First
              </button>
              <button
                className="btn btn-secondary btn-sm pagination-btn"
                disabled={pagination.page <= 1 || loading}
                onClick={() => fetchEmployees(pagination.page - 1)}
                title="Previous Page"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Prev
              </button>

              <span className="page-indicator">
                Page <strong>{pagination.page}</strong> of <strong>{Math.max(1, pagination.totalPages)}</strong>
              </span>

              <button
                className="btn btn-secondary btn-sm pagination-btn"
                disabled={pagination.page >= pagination.totalPages || loading}
                onClick={() => fetchEmployees(pagination.page + 1)}
                title="Next Page"
              >
                Next
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
              <button
                className="btn btn-secondary btn-sm pagination-btn"
                disabled={pagination.page >= pagination.totalPages || loading}
                onClick={() => fetchEmployees(pagination.totalPages)}
                title="Last Page"
              >
                Last
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="13 17 18 12 13 7" />
                  <polyline points="6 17 11 12 6 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && selectedEmpForDelete && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3>Confirm Employee Deletion</h3>
              <button className="close-btn" onClick={() => setDeleteConfirmOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to delete employee{' '}
                <strong>{selectedEmpForDelete.firstName} {selectedEmpForDelete.lastName}</strong>{' '}
                (<code>{selectedEmpForDelete.employeeId}</code>)?
              </p>
              <p style={{ color: 'var(--color-danger)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                This action is permanent and will remove their record from payroll calculations.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setDeleteConfirmOpen(false)}
                disabled={deletingId !== null}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDeleteEmployee}
                disabled={deletingId !== null}
              >
                {deletingId ? 'Deleting...' : 'Delete Employee'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
