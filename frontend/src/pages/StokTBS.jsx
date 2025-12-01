import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { stokAPI, kebunAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './StokTBS.css';

const StokTBS = () => {
  const { isBuyer } = useAuth();
  const navigate = useNavigate();
  const [stokList, setStokList] = useState([]);
  const [kebunList, setKebunList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    grade: '',
    kebun_id: '',
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [stokRes, kebunRes] = await Promise.all([
        stokAPI.getList(filters),
        kebunAPI.getList(),
      ]);
      setStokList(stokRes.data || []);
      setKebunList(kebunRes.data || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      setStokList([]);
      setKebunList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBeli = (stok) => {
    navigate('/create-order', { state: { stok } });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <>
      <Navbar />
      <div className="stok-container">
        <div className="container">
          <div className="page-header">
            <h1>📦 Stok TBS (Tandan Buah Segar)</h1>
            <p>Lihat ketersediaan dan harga TBS dari berbagai kebun</p>
          </div>

          <div className="filters-card">
            <div className="filters-grid">
              <div className="form-group">
                <label className="form-label">Grade</label>
                <select
                  className="form-control"
                  value={filters.grade}
                  onChange={(e) => setFilters({ ...filters, grade: e.target.value })}
                >
                  <option value="">Semua Grade</option>
                  <option value="A">Grade A</option>
                  <option value="B">Grade B</option>
                  <option value="C">Grade C</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Kebun</label>
                <select
                  className="form-control"
                  value={filters.kebun_id}
                  onChange={(e) => setFilters({ ...filters, kebun_id: e.target.value })}
                >
                  <option value="">Semua Kebun</option>
                  {kebunList.map((kebun) => (
                    <option key={kebun.id} value={kebun.id}>
                      {kebun.nama_kebun}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
            </div>
          ) : stokList.length === 0 ? (
            <div className="card text-center">
              <p>Tidak ada stok tersedia</p>
            </div>
          ) : (
            <div className="stok-grid">
              {stokList.map((stok) => (
                <div key={stok.id} className="stok-card">
                  <div className="stok-header">
                    <div className="stok-grade">
                      <span className={`grade-badge grade-${stok.grade}`}>
                        Grade {stok.grade}
                      </span>
                    </div>
                    <div className="stok-kebun">
                      <strong>{stok.nama_kebun}</strong>
                      <small>{stok.lokasi_kebun}</small>
                    </div>
                  </div>

                  <div className="stok-info">
                    <div className="info-row">
                      <span className="info-label">📅 Tanggal Panen:</span>
                      <span className="info-value">{formatDate(stok.tanggal_panen)}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">⚖️ Stok Tersedia:</span>
                      <span className="info-value highlight">
                        {stok.jumlah_tersedia.toLocaleString()} kg
                      </span>
                    </div>
                    {stok.kadar_minyak && (
                      <div className="info-row">
                        <span className="info-label">🛢️ Kadar Minyak:</span>
                        <span className="info-value">{stok.kadar_minyak}%</span>
                      </div>
                    )}
                    <div className="info-row">
                      <span className="info-label">💰 Harga:</span>
                      <span className="info-value price">
                        {formatCurrency(stok.harga_per_kg)}/kg
                      </span>
                    </div>
                  </div>

                  {stok.keterangan && (
                    <div className="stok-notes">
                      <small>📝 {stok.keterangan}</small>
                    </div>
                  )}

                  {isBuyer && (
                    <div className="stok-actions">
                      <button
                        className="btn btn-primary"
                        onClick={() => handleBeli(stok)}
                      >
                        Beli Sekarang
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default StokTBS;
