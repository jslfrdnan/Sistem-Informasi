import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="navbar-icon">🌴</span>
          <span className="navbar-title">Sawit System</span>
        </Link>

        <div className="navbar-menu">
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
          <Link to="/stok" className="nav-link">Stok TBS</Link>
          
          {user?.role === 'buyer' && (
            <>
              <Link to="/my-orders" className="nav-link">Pesanan Saya</Link>
              <Link to="/pembayaran" className="nav-link">Pembayaran</Link>
              <Link to="/dokumen" className="nav-link">Dokumen</Link>
            </>
          )}
          
          {user?.role === 'admin' && (
            <>
              <Link to="/manage-stok" className="nav-link">Kelola Stok</Link>
              <Link to="/orders" className="nav-link">Manage Orders</Link>
              <Link to="/jadwal" className="nav-link">Jadwal</Link>
              <Link to="/pembayaran" className="nav-link">Pembayaran</Link>
              <Link to="/dokumen" className="nav-link">Dokumen</Link>
              <Link to="/reports" className="nav-link">Laporan</Link>
            </>
          )}
          
          {user?.role === 'staff' && (
            <>
              <Link to="/timbangan" className="nav-link">⚖️ Timbangan</Link>
            </>
          )}
        </div>

        <div className="navbar-user">
          <div className="user-info">
            <span className="user-name">{user?.username}</span>
            <span className="user-role">{user?.role}</span>
          </div>
          <button onClick={handleLogout} className="btn btn-sm btn-outline">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
