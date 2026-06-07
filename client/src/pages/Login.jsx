import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Sparkles, FileCheck, CheckCircle } from 'lucide-react';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '90vh', width: '100vw', margin: 0, padding: 0 }}>
      {/* Left Panel: Product Information (Hidden on mobile) */}
      <div style={{
        flex: 1,
        backgroundColor: '#111115',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '4rem',
        position: 'relative',
        overflow: 'hidden'
      }} className="hide-on-mobile">
        {/* Subtle geometric grid backdrop */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.05,
          backgroundImage: 'radial-gradient(var(--border) 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }}></div>

        <div style={{ position: 'relative', maxWidth: '460px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--primary)',
            fontSize: '0.8rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '1.5rem'
          }}>
            <Sparkles size={14} /> Career Optimizer
          </div>

          <h2 style={{ fontSize: '2.5rem', lineHeight: '1.2', fontWeight: '700', marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>
            Elevate your resume representation
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '3rem' }}>
            Enter your credentials to enter the workspace, calculate match details, and start rephrasing your experience items.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
              <div style={{ padding: '0.4rem', backgroundColor: 'var(--primary-glow)', borderRadius: '6px', color: 'var(--primary)', marginTop: '0.2rem' }}>
                <FileCheck size={16} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.95rem', fontWeight: '600' }}>Targeted Fit Indexes</h4>
                <p style={{ margin: 0, fontSize: '0.85rem' }}>Calculates matching scores by comparing skill groups and project scopes.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
              <div style={{ padding: '0.4rem', backgroundColor: 'var(--accent-glow)', borderRadius: '6px', color: 'var(--accent)', marginTop: '0.2rem' }}>
                <CheckCircle size={16} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.95rem', fontWeight: '600' }}>AI suggestions and Bullet edits</h4>
                <p style={{ margin: 0, fontSize: '0.85rem' }}>Provides detailed, context-aware suggestions directly targeting requirements.</p>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 992px) {
            .hide-on-mobile {
              display: none !important;
            }
          }
        `}</style>
      </div>

      {/* Right Panel: Credentials Form */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem'
      }}>
        <div className="card" style={{ width: '100%', maxWidth: '380px', border: 'none', backgroundColor: 'transparent' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem', letterSpacing: '-0.02em', textAlign: 'center' }}>
            {isRegister ? 'Create Account' : 'Sign In'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2rem', textAlign: 'center' }}>
            {isRegister ? 'Sign up to configure matches and save summaries' : 'Sign in to access your dashboard reports'}
          </p>

          {error && <div className="alert alert-error" style={{ fontSize: '0.85rem' }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            {isRegister && (
              <div className="form-group">
                <label className="form-label" htmlFor="register-name">Full Name</label>
                <input
                  id="register-name"
                  type="text"
                  className="form-control"
                  placeholder="Pooja"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email Address</label>
              <input
                id="login-email"
                type="email"
                className="form-control"
                placeholder="pooja@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label className="form-label" htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }} disabled={loading}>
              {loading ? 'Processing credentials...' : isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              {isRegister ? 'Already have an account? Sign In' : 'New here? Create an account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
