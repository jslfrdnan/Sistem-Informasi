import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <img src="/logo.png" alt="Logo Minahasa Sejahtera" className="auth-logo" />
          <h1>Sistem Informasi</h1>
          <p>Perkebunan Kelapa Sawit</p>
          <p className="company-name">Minahasa Sejahtera 2015</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="alert alert-danger">{error}</div>}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contoh@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Belum punya akun? <Link to="/register">Daftar disini</Link></p>
        </div>

        <div className="auth-demo">
          <p className="demo-title">Demo Akun:</p>
          <div className="demo-accounts">
            <div>
              <strong>Admin:</strong> admin@sawit.com / admin123
              <small>Full access - Kelola stok, approve PO, jadwal, laporan</small>
            </div>
            <div>
              <strong>Staff:</strong> staff@sawit.com / staff123
              <small>Operator timbangan - Weigh-in, weigh-out, history</small>
            </div>
            <div>
              <strong>Buyer:</strong> buyer1@company.com / buyer123
              <small>Pembeli - Browse stok, buat PO, pembayaran, dokumen</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
