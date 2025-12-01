import React, { useEffect, useState } from 'react';
import { stokAPI, kebunAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './ManageStok.css';

const ManageStok = () => {
  const { user } = useAuth();
  const [stokList, setStokList] = useState([]);
  const [kebunList, setKebunList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentStok, setCurrentStok] = useState(null);
  const [formData, setFormData] = useState({
    kebun_id: '',
    tanggal_panen: new Date().toISOString().split('T')[0],
    grade: 'A',
    jumlah_kg: '',
    harga_per_kg: '',
    kadar_minyak: '',
    keterangan: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [stokRes, kebunRes] = await Promise.all([
        stokAPI.getList({}),
        kebunAPI.getList(),
      ]);
      setStokList(stokRes.data || []);
      setKebunList(kebunRes.data || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (stok = null) => {
    if (stok) {
      setEditMode(true);
      setCurrentStok(stok);
      setFormData({
        kebun_id: stok.kebun_id,
        tanggal_panen: stok.tanggal_panen || new Date().toISOString().split('T')[0],
        grade: stok.grade,
        jumlah_kg: stok.jumlah_tersedia || stok.jumlah_kg,
        harga_per_kg: stok.harga_per_kg,
        kadar_minyak: stok.kadar_minyak || '',
        keterangan: stok.keterangan || ''
      });
    } else {
      setEditMode(false);
      setCurrentStok(null);
      setFormData({
        kebun_id: '',
        tanggal_panen: new Date().toISOString().split('T')[0],
        grade: 'A',
        jumlah_kg: '',
        harga_per_kg: '',
        kadar_minyak: '',
        keterangan: ''
      });
    }
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setCurrentStok(null);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.kebun_id || !formData.tanggal_panen || !formData.jumlah_kg || !formData.harga_per_kg) {
      setError('Field kebun, tanggal panen, jumlah, dan harga wajib diisi');
      return;
    }

    if (parseFloat(formData.jumlah_kg) <= 0) {
      setError('Jumlah harus lebih dari 0');
      return;
    }

    if (parseFloat(formData.harga_per_kg) <= 0) {
      setError('Harga harus lebih dari 0');
      return;
    }

    try {
      if (editMode) {
        // Update only sends partial data
        const updateData = {
          jumlah_tersedia: parseFloat(formData.jumlah_kg),
          harga_per_kg: parseFloat(formData.harga_per_kg),
          status: 'available',
          keterangan: formData.keterangan
        };
        await stokAPI.update(currentStok.id, updateData);
        setSuccess('Stok berhasil diupdate');
      } else {
        // Create sends full data
        const createData = {
          kebun_id: parseInt(formData.kebun_id),
          tanggal_panen: formData.tanggal_panen,
          jumlah_kg: parseFloat(formData.jumlah_kg),
          grade: formData.grade,
          kadar_minyak: formData.kadar_minyak ? parseFloat(formData.kadar_minyak) : 0,
          harga_per_kg: parseFloat(formData.harga_per_kg),
          keterangan: formData.keterangan
        };
        await stokAPI.create(createData);
        setSuccess('Stok berhasil ditambahkan');
      }
      
      setTimeout(() => {
        handleCloseModal();
        loadData();
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.error || 'Gagal menyimpan stok');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      available: { label: 'Tersedia', class: 'badge-success' },
      reserved: { label: 'Dipesan', class: 'badge-warning' },
      sold_out: { label: 'Habis', class: 'badge-secondary' }
    };
    const config = statusConfig[status] || { label: status, class: 'badge-secondary' };
    return <span className={`badge ${config.class}`}>{config.label}</span>;
  };

  const getKebunName = (kebunId) => {
    const kebun = kebunList.find(k => k.id === kebunId);
    return kebun ? kebun.nama_kebun : '-';
  };

  return (
    <>
      <Navbar />
      <div className="manage-stok-container">
        <div className="container">
          <div className="page-header">
            <div>
              <h1>📦 Kelola Stok TBS</h1>
              <p>Manajemen stok Tandan Buah Segar</p>
            </div>
            <button className="btn btn-primary" onClick={() => handleOpenModal()}>
              ➕ Tambah Stok
            </button>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="card">
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Kebun</th>
                      <th>Tanggal Panen</th>
                      <th>Grade</th>
                      <th>Jumlah (kg)</th>
                      <th>Harga/kg</th>
                      <th>Total Nilai</th>
                      <th>Status</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stokList.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="text-center">
                          Tidak ada data stok
                        </td>
                      </tr>
                    ) : (
                      stokList.map((stok) => (
                        <tr key={stok.id}>
                          <td>{stok.id}</td>
                          <td>{getKebunName(stok.kebun_id)}</td>
                          <td>{new Date(stok.tanggal_panen).toLocaleDateString('id-ID')}</td>
                          <td>
                            <span className={`badge badge-grade-${stok.grade}`}>
                              Grade {stok.grade}
                            </span>
                          </td>
                          <td>{stok.jumlah_tersedia || stok.jumlah_kg} kg</td>
                          <td>{formatCurrency(stok.harga_per_kg)}</td>
                          <td>{formatCurrency((stok.jumlah_tersedia || stok.jumlah_kg) * stok.harga_per_kg)}</td>
                          <td>{getStatusBadge(stok.status)}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline"
                              onClick={() => handleOpenModal(stok)}
                            >
                              ✏️ Edit
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editMode ? 'Edit Stok TBS' : 'Tambah Stok TBS'}</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <div className="form-group">
                  <label className="form-label">Kebun *</label>
                  <select
                    className="form-control"
                    value={formData.kebun_id}
                    onChange={(e) => setFormData({ ...formData, kebun_id: e.target.value })}
                    required
                    disabled={editMode}
                  >
                    <option value="">Pilih Kebun</option>
                    {kebunList.map((kebun) => (
                      <option key={kebun.id} value={kebun.id}>
                        {kebun.nama_kebun} - {kebun.lokasi}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Tanggal Panen *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.tanggal_panen}
                    onChange={(e) => setFormData({ ...formData, tanggal_panen: e.target.value })}
                    required
                    disabled={editMode}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Grade *</label>
                  <select
                    className="form-control"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    required
                    disabled={editMode}
                  >
                    <option value="A">Grade A - Premium</option>
                    <option value="B">Grade B - Standard</option>
                    <option value="C">Grade C - Regular</option>
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Jumlah (kg) *</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={formData.jumlah_kg}
                      onChange={(e) => setFormData({ ...formData, jumlah_kg: e.target.value })}
                      required
                      placeholder="Contoh: 5000"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Harga per Kg (IDR) *</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={formData.harga_per_kg}
                      onChange={(e) => setFormData({ ...formData, harga_per_kg: e.target.value })}
                      required
                      placeholder="Contoh: 2500"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Kadar Minyak (%) - Opsional</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={formData.kadar_minyak}
                    onChange={(e) => setFormData({ ...formData, kadar_minyak: e.target.value })}
                    placeholder="Contoh: 22.5"
                    disabled={editMode}
                  />
                  <small className="form-text">Persentase kadar minyak dalam buah</small>
                </div>

                <div className="form-group">
                  <label className="form-label">Keterangan - Opsional</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Keterangan kualitas, kondisi, dll"
                    value={formData.keterangan}
                    onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                  ></textarea>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  {editMode ? 'Update Stok' : 'Tambah Stok'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ManageStok;
