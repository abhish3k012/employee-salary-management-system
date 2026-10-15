import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { formatCurrency } from '../utils/currency';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [departmentReport, setDepartmentReport] = useState([]);
  const [countryReport, setCountryReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [sumRes, deptRes, countryRes] = await Promise.all([
        api.getDashboardSummary(),
        api.getDepartmentReport(),
        api.getCountryReport()
      ]);
      setSummary(sumRes);
      setDepartmentReport(deptRes);
      setCountryReport(countryRes);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="spinner"></div>
        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading compensation analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="alert alert-danger">
          <strong>Error:</strong> {error}
          <div style={{ marginTop: '0.5rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={loadData}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  // Filter department & country report views
  const filteredDeptReport = departmentReport.filter(item =>
    !deptFilter || item.department.toLowerCase().includes(deptFilter.toLowerCase())
  );

  const filteredCountryReport = countryReport.filter(item =>
    !countryFilter || item.country.toLowerCase().includes(countryFilter.toLowerCase())
  );

  return (
    <div className="page-container">
      {/* Overview Statistics Header */}
      <div className="section-header">
        <div>
          <h2>Workforce & Payroll Analytics</h2>
          <p className="section-desc">
            Executive summary of payroll distribution, average compensation, and regional breakdowns.
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={loadData}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M8 16H3v5" />
          </svg>
          Refresh Data
        </button>
      </div>

      {/* Top Level Metric Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Total Employees</div>
          <div className="metric-value">{summary?.totalEmployees?.toLocaleString() || 0}</div>
          <div className="metric-sub">Active in Enterprise Database</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Operating Currencies</div>
          <div className="metric-value">{summary?.totalPayrollByCurrency?.length || 0}</div>
          <div className="metric-sub">Strictly isolated payroll calculations</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Departments</div>
          <div className="metric-value">
            {new Set(departmentReport.map(d => d.department)).size}
          </div>
          <div className="metric-sub">Organizational Business Units</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Global Presence</div>
          <div className="metric-value">
            {new Set(countryReport.map(c => c.country)).size}
          </div>
          <div className="metric-sub">Operating Countries Worldwide</div>
        </div>
      </div>

      {/* Currency-Wise Payroll & Average Salary */}
      <div className="card-panel">
        <div className="card-panel-header">
          <div>
            <h3>Currency-Wise Payroll & Average Compensation</h3>
            <p className="card-panel-desc">
              Payroll and average salary grouped by local currency without mixing distinct currencies.
            </p>
          </div>
        </div>

        <div className="currency-grid">
          {summary?.totalPayrollByCurrency?.map(item => {
            const avgItem = summary.averageSalaryByCurrency?.find(a => a.currency === item.currency);
            return (
              <div key={item.currency} className="currency-card">
                <div className="currency-card-header">
                  <span className="badge badge-blue">{item.currency}</span>
                  <span className="currency-headcount">{item.employeeCount} employees</span>
                </div>
                <div className="currency-stats">
                  <div className="currency-stat">
                    <span className="stat-label">Total Payroll:</span>
                    <span className="stat-val stat-val-payroll">
                      {formatCurrency(item.totalPayroll, item.currency)}
                    </span>
                  </div>
                  <div className="currency-stat">
                    <span className="stat-label">Average Salary:</span>
                    <span className="stat-val stat-val-avg">
                      {formatCurrency(avgItem?.averageSalary || 0, item.currency)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Department-Wise and Country-Wise Reports Side by Side or Stacked */}
      <div className="reports-split">
        {/* Department-Wise Report */}
        <div className="card-panel">
          <div className="card-panel-header">
            <div>
              <h3>Department-Wise Salary Report</h3>
              <p className="card-panel-desc">Compensation distribution across departments</p>
            </div>
            <input
              type="text"
              placeholder="Search department..."
              className="form-input form-input-sm"
              style={{ maxWidth: '200px' }}
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
            />
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Currency</th>
                  <th style={{ textAlign: 'right' }}>Headcount</th>
                  <th style={{ textAlign: 'right' }}>Average Salary</th>
                  <th style={{ textAlign: 'right' }}>Total Payroll</th>
                  <th style={{ textAlign: 'right' }}>Min - Max</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeptReport.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--color-text-muted)' }}>
                      No department data found
                    </td>
                  </tr>
                ) : (
                  filteredDeptReport.map((row, idx) => (
                    <tr key={`${row.department}-${row.currency}-${idx}`}>
                      <td style={{ fontWeight: '500' }}>{row.department}</td>
                      <td>
                        <span className="badge badge-gray">{row.currency}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>{row.employeeCount.toLocaleString()}</td>
                      <td style={{ textAlign: 'right', fontWeight: '500' }}>
                        {formatCurrency(row.averageSalary, row.currency)}
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--color-primary)', fontWeight: '600' }}>
                        {formatCurrency(row.totalSalary, row.currency)}
                      </td>
                      <td style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                        {formatCurrency(row.minSalary, row.currency)} – {formatCurrency(row.maxSalary, row.currency)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Country-Wise Report */}
        <div className="card-panel">
          <div className="card-panel-header">
            <div>
              <h3>Country-Wise Salary Report</h3>
              <p className="card-panel-desc">Regional salary breakdown and expenditure</p>
            </div>
            <input
              type="text"
              placeholder="Search country..."
              className="form-input form-input-sm"
              style={{ maxWidth: '200px' }}
              value={countryFilter}
              onChange={e => setCountryFilter(e.target.value)}
            />
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Country</th>
                  <th>Currency</th>
                  <th style={{ textAlign: 'right' }}>Headcount</th>
                  <th style={{ textAlign: 'right' }}>Average Salary</th>
                  <th style={{ textAlign: 'right' }}>Total Payroll</th>
                  <th style={{ textAlign: 'right' }}>Min - Max</th>
                </tr>
              </thead>
              <tbody>
                {filteredCountryReport.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--color-text-muted)' }}>
                      No country data found
                    </td>
                  </tr>
                ) : (
                  filteredCountryReport.map((row, idx) => (
                    <tr key={`${row.country}-${row.currency}-${idx}`}>
                      <td style={{ fontWeight: '500' }}>{row.country}</td>
                      <td>
                        <span className="badge badge-gray">{row.currency}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>{row.employeeCount.toLocaleString()}</td>
                      <td style={{ textAlign: 'right', fontWeight: '500' }}>
                        {formatCurrency(row.averageSalary, row.currency)}
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--color-primary)', fontWeight: '600' }}>
                        {formatCurrency(row.totalSalary, row.currency)}
                      </td>
                      <td style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                        {formatCurrency(row.minSalary, row.currency)} – {formatCurrency(row.maxSalary, row.currency)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
