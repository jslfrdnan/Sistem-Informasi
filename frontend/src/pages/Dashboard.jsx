import React, { useEffect, useState } from 'react';
import { reportsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './Dashboard.css';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await reportsAPI.getDashboard();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <div className="container">
          <div className="dashboard-header">
            <div>
              <h1>Dashboard</h1>
              <p>Selamat datang, {user?.company_name || user?.username}</p>
            </div>
          </div>

          {isAdmin ? (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon admin">📦</div>
                <div className="stat-content">
                  <h3>{stats?.total_stok || 0}</h3>
                  <p>Stok Tersedia</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon pending">⏳</div>
                <div className="stat-content">
                  <h3>{stats?.pending_po || 0}</h3>
                  <p>PO Pending</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon success">🌴</div>
                <div className="stat-content">
                  <h3>{stats?.total_kebun || 0}</h3>
                  <p>Total Kebun</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon warning">👥</div>
                <div className="stat-content">
                  <h3>{stats?.total_buyer || 0}</h3>
                  <p>Total Buyer</p>
                </div>
              </div>

              <div className="stat-card revenue">
                <div className="stat-icon">💰</div>
                <div className="stat-content">
                  <h3>{formatCurrency(stats?.revenue_month || 0)}</h3>
                  <p>Pendapatan Bulan Ini</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon buyer">📋</div>
                <div className="stat-content">
                  <h3>{stats?.total_po || 0}</h3>
                  <p>Total Pesanan</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon pending">⏳</div>
                <div className="stat-content">
                  <h3>{stats?.pending_po || 0}</h3>
                  <p>Menunggu Approval</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon warning">🚚</div>
                <div className="stat-content">
                  <h3>{stats?.approved_po || 0}</h3>
                  <p>Siap Diambil</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon success">✅</div>
                <div className="stat-content">
                  <h3>{stats?.completed_po || 0}</h3>
                  <p>Selesai</p>
                </div>
              </div>

              <div className="stat-card revenue">
                <div className="stat-icon">💰</div>
                <div className="stat-content">
                  <h3>{formatCurrency(stats?.total_spent || 0)}</h3>
                  <p>Total Pembelian</p>
                </div>
              </div>
            </div>
          )}

          <div className="dashboard-info">
            <div className="card">
              <div className="card-header">
                <h3>Informasi Sistem</h3>
              </div>
              <div className="info-content">
                <div className="info-item">
                  <span className="info-icon">🌴</span>
                  <div>
                    <h4>Sistem Informasi Perkebunan Kelapa Sawit</h4>
                    <p>Platform digital untuk mengelola pembelian dan penjualan TBS (Tandan Buah Segar)</p>
                  </div>
                </div>

                {user?.role === 'buyer' && (
                  <div className="quick-links">
                    <h4>Menu Cepat:</h4>
                    <div className="quick-link-grid">
                      <a href="/stok" className="quick-link-card">
                        <span>📦</span>
                        <span>Lihat Stok TBS</span>
                      </a>
                      <a href="/my-orders" className="quick-link-card">
                        <span>📋</span>
                        <span>Pesanan Saya</span>
                      </a>
                    </div>
                  </div>
                )}

                {isAdmin && (
                  <div className="quick-links">
                    <h4>Menu Cepat:</h4>
                    <div className="quick-link-grid">
                      <a href="/orders" className="quick-link-card">
                        <span>📋</span>
                        <span>Kelola Orders</span>
                      </a>
                      <a href="/timbangan" className="quick-link-card">
                        <span>⚖️</span>
                        <span>Timbangan</span>
                      </a>
                      <a href="/reports" className="quick-link-card">
                        <span>📊</span>
                        <span>Laporan</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
