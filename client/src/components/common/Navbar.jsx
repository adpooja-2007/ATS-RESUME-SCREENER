import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, FileUp, FileCheck, History, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="nav-brand" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
        ATS RESUME SCREENER
      </div>
      <ul className="nav-links">
        <li>
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <LayoutDashboard size={14} />
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/upload" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FileUp size={14} />
            Upload
          </NavLink>
        </li>
        <li>
          <NavLink to="/analyze" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FileCheck size={14} />
            Analyze
          </NavLink>
        </li>
        <li>
          <NavLink to="/history" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <History size={14} />
            Logs
          </NavLink>
        </li>
        <li style={{ marginLeft: '1rem' }}>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <LogOut size={12} />
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
