import React, { useState } from 'react';
import { api } from '../services/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [identifier, setIdentifier] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await api.login(identifier, password);
        onAuthSuccess(res.token);
        onClose();
      } else {
        await api.register(username, email, password);
        // After register, log in immediately
        const res = await api.login(email, password);
        onAuthSuccess(res.token);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      // Try login with test user or create demo user
      const demoEmail = 'admin@example.com';
      const demoPass = 'admin123';
      try {
        const res = await api.login(demoEmail, demoPass);
        onAuthSuccess(res.token);
        onClose();
      } catch (loginErr) {
        // Register if not exists
        await api.register('admin_user', demoEmail, demoPass);
        const res = await api.login(demoEmail, demoPass);
        onAuthSuccess(res.token);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '420px' }}>
        <div className="modal-header">
          <h3>{mode === 'login' ? 'Sign In' : 'Create New Account'}</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="auth-tab-switch">
          <button
            type="button"
            className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError(''); }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { setMode('register'); setError(''); }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ paddingTop: '1rem' }}>
            {error && (
              <div className="alert alert-danger">
                {error}
              </div>
            )}

            {mode === 'login' ? (
              <>
                <div className="form-group">
                  <label className="form-label">Email or Username</label>
                  <input
                    type="text"
                    className="form-input"
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    placeholder="Enter email or username"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-input"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="e.g. john_doe"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </>
            )}

            <div style={{ marginTop: '1.25rem' }}>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </div>

            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                Quick Evaluation Access
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ width: '100%' }}
                onClick={handleDemoLogin}
                disabled={loading}
              >
                ⚡ One-Click Demo Admin Login
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
