import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import './LogAktivitas.css';

const LogAktivitas = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [filters, setFilters] = useState({
    aktivitas: '',
    start_date: '',
    end_date: '',
    page: 1,
    limit: 20
  });

  // Pagination
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    currentPage: 1
  });

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.aktivitas) params.append('aktivitas', filters.aktivitas);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      params.append('page', filters.page);
      params.append('limit', filters.limit);

      const response = await api.get(`/logs?${params.toString()}`);
      setLogs(response.data.logs || []);
      setPagination({
        total: response.data.total || 0,
        pages: response.data.pages || 0,
        currentPage: response.data.page || 1
      });
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal memuat log aktivitas');
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1 // Reset to page 1 when filter changes
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const resetFilters = () => {
    setFilters({
      aktivitas: '',
      start_date: '',
      end_date: '',
      page: 1,
      limit: 20
    });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAktivitasClass = (aktivitas) => {
    if (aktivitas.includes('LOGIN') || aktivitas.includes('LOGOUT')) return 'log-auth';
    if (aktivitas.includes('CREATE') || aktivitas.includes('BUAT')) return 'log-create';
    if (aktivitas.includes('UPDATE') || aktivitas.includes('UBAH')) return 'log-update';
    if (aktivitas.includes('DELETE') || aktivitas.includes('HAPUS')) return 'log-delete';
    if (aktivitas.includes('APPROVE') || aktivitas.includes('VERIFY')) return 'log-approve';
    if (aktivitas.includes('REJECT') || aktivitas.includes('CANCEL')) return 'log-reject';
    return 'log-view';
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin': return 'role-badge admin';
      case 'buyer': return 'role-badge buyer';
      case 'staff': return 'role-badge staff';
      default: return 'role-badge';
    }
  };

  return (
    <div className="page-container">
      <Navbar />
      <div className="content-wrapper">
        <div className="page-header">
          <h1>📋 Log Aktivitas Sistem</h1>
          <p>Monitor semua aktivitas pengguna dalam sistem</p>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="filters-section">
          <h2>Filter Log</h2>
          <div className="filters-grid">
            <div className="form-group">
              <label>Jenis Aktivitas</label>
              <input
                type="text"
                name="aktivitas"
                value={filters.aktivitas}
                onChange={handleFilterChange}
                placeholder="Cari aktivitas..."
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Tanggal Mulai</label>
              <input
                type="date"
                name="start_date"
                value={filters.start_date}
                onChange={handleFilterChange}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Tanggal Akhir</label>
              <input
                type="date"
                name="end_date"
                value={filters.end_date}
                onChange={handleFilterChange}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Items per halaman</label>
              <select
                name="limit"
                value={filters.limit}
                onChange={handleFilterChange}
                className="form-control"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
          <button onClick={resetFilters} className="btn-secondary">
            Reset Filter
          </button>
        </div>

        {/* Logs Table */}
        <div className="logs-section">
          <div className="section-header">
            <h2>Daftar Log Aktivitas</h2>
            <span className="total-count">Total: {pagination.total} log</span>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Memuat log aktivitas...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="no-data">
              <p>Tidak ada log aktivitas yang ditemukan</p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="logs-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Waktu</th>
                      <th>User</th>
                      <th>Role</th>
                      <th>Aktivitas</th>
                      <th>Detail</th>
                      <th>IP Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id}>
                        <td>{log.id}</td>
                        <td className="time-cell">{formatDateTime(log.waktu_aktivitas)}</td>
                        <td className="user-cell">{log.username}</td>
                        <td>
                          <span className={getRoleBadgeClass(log.role)}>
                            {log.role}
                          </span>
                        </td>
                        <td>
                          <span className={`activity-tag ${getAktivitasClass(log.aktivitas)}`}>
                            {log.aktivitas}
                          </span>
                        </td>
                        <td className="detail-cell">{log.detail}</td>
                        <td className="ip-cell">{log.ip_address || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="pagination-btn"
                  >
                    ← Sebelumnya
                  </button>
                  
                  <div className="pagination-info">
                    Halaman {pagination.currentPage} dari {pagination.pages}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.pages}
                    className="pagination-btn"
                  >
                    Selanjutnya →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogAktivitas;
