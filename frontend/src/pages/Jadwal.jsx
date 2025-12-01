import React, { useEffect, useState } from 'react';
import { jadwalAPI, purchaseOrderAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './Jadwal.css';

const Jadwal = () => {
  const { user, isAdmin, isStaff } = useAuth();
  const [jadwalList, setJadwalList] = useState([]);
  const [poList, setPoList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    po_id: '',
    tanggal_pengambilan: '',
    jam_loading: '',
    plat_nomor: '',
    nama_sopir: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const jadwalRes = await jadwalAPI.getList();
      setJadwalList(jadwalRes.data || []);

      if (isAdmin || isStaff) {
        // Load approved PO for creating schedule
        const poRes = await purchaseOrderAPI.getList({ status: 'approved' });
        setPoList(poRes.data || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setFormData({
      po_id: '',
      tanggal_pengambilan: '',
      jam_loading: '08:00',
      plat_nomor: '',
      nama_sopir: ''
    });
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.po_id || !formData.tanggal_pengambilan || !formData.jam_loading || !formData.plat_nomor || !formData.nama_sopir) {
      setError('Semua field wajib diisi');
      return;
    }

    try {
      // Combine date and time to waktu_loading
      const waktuLoading = `${formData.tanggal_pengambilan} ${formData.jam_loading}:00`;
      
      const payload = {
        po_id: parseInt(formData.po_id),
        waktu_loading: waktuLoading,
        plat_nomor: formData.plat_nomor,
        nama_sopir: formData.nama_sopir
      };

      await jadwalAPI.create(payload);
      setSuccess('Jadwal berhasil dibuat');
      setTimeout(() => {
        handleCloseModal();
        loadData();
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.error || 'Gagal membuat jadwal');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '-';
    return timeString.substring(0, 5);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      scheduled: { label: 'Terjadwal', class: 'badge-warning' },
      in_progress: { label: 'Sedang Proses', class: 'badge-info' },
      completed: { label: 'Selesai', class: 'badge-success' }
    };
    const config = statusConfig[status] || { label: status, class: 'badge-secondary' };
    return <span className={`badge ${config.class}`}>{config.label}</span>;
  };

  const getPOInfo = (poId) => {
    const po = poList.find(p => p.po_id === poId);
    return po ? `${po.nomor_po} - ${po.buyer_name}` : `PO #${poId}`;
  };

  return (
    <>
      <Navbar />
      <div className="jadwal-container">
        <div className="container">
          <div className="page-header">
            <div>
              <h1>📅 Jadwal Pengambilan</h1>
              <p>Kelola jadwal loading dan pickup TBS</p>
            </div>
            {(isAdmin || isStaff) && (
              <button className="btn btn-primary" onClick={handleOpenModal}>
                ➕ Buat Jadwal
              </button>
            )}
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
                      <th>Antrian</th>
                      <th>PO ID</th>
                      <th>Nama Sopir</th>
                      <th>Tanggal Loading</th>
                      <th>Jam Loading</th>
                      <th>Status</th>
                      <th>Dibuat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jadwalList.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center">
                          Tidak ada jadwal
                        </td>
                      </tr>
                    ) : (
                      jadwalList.map((jadwal) => (
                        <tr key={jadwal.id}>
                          <td>
                            <span className="antrian-badge">
                              {jadwal.nomor_antrian}
                            </span>
                          </td>
                          <td>PO-{jadwal.po_id}</td>
                          <td>{jadwal.nama_sopir || '-'}</td>
                          <td>{jadwal.waktu_loading ? formatDate(jadwal.waktu_loading) : '-'}</td>
                          <td>
                            {jadwal.waktu_loading ? formatTime(jadwal.waktu_loading.split(' ')[1] || jadwal.waktu_loading) : '-'}
                          </td>
                          <td>{getStatusBadge(jadwal.status)}</td>
                          <td>{jadwal.created_at ? new Date(jadwal.created_at).toLocaleDateString('id-ID') : '-'}</td>
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
              <h2>Buat Jadwal Pengambilan</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <div className="form-group">
                  <label className="form-label">Purchase Order *</label>
                  <select
                    className="form-control"
                    value={formData.po_id}
                    onChange={(e) => setFormData({ ...formData, po_id: e.target.value })}
                    required
                  >
                    <option value="">Pilih PO yang sudah disetujui</option>
                    {poList.map((po) => (
                      <option key={po.id} value={po.id}>
                        {po.po_number || `PO-${po.id}`} - {po.buyer_name || 'N/A'} ({po.jumlah_kg ? (po.jumlah_kg / 1000).toFixed(1) : 0} ton)
                      </option>
                    ))}
                  </select>
                  <small className="form-text">
                    Hanya PO dengan status "Approved" yang bisa dijadwalkan
                  </small>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Tanggal Loading *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.tanggal_pengambilan}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setFormData({ ...formData, tanggal_pengambilan: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Jam Loading *</label>
                    <input
                      type="time"
                      className="form-control"
                      value={formData.jam_loading}
                      onChange={(e) => setFormData({ ...formData, jam_loading: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Plat Nomor Kendaraan *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contoh: B 1234 XYZ"
                    value={formData.plat_nomor}
                    onChange={(e) => setFormData({ ...formData, plat_nomor: e.target.value.toUpperCase() })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nama Sopir *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nama lengkap sopir"
                    value={formData.nama_sopir}
                    onChange={(e) => setFormData({ ...formData, nama_sopir: e.target.value })}
                    required
                  />
                </div>

                <div className="alert alert-info">
                  ℹ️ Sistem akan generate nomor antrian otomatis berdasarkan urutan jadwal hari tersebut
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Buat Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Jadwal;
