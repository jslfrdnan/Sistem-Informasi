import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { poAPI } from '../services/api';
import Navbar from '../components/Navbar';
import SuccessModal from '../components/SuccessModal';
import './CreateOrder.css';

const CreateOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const stok = location.state?.stok;

  const [formData, setFormData] = useState({
    stok_id: stok?.id || '',
    jumlah_kg: '',
    tanggal_pengambilan: '',
    metode_pembayaran: 'transfer',
    catatan: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  if (!stok) {
    return (
      <>
        <Navbar />
        <div className="container">
          <div className="card text-center mt-4">
            <p>Stok tidak ditemukan</p>
            <button onClick={() => navigate('/stok')} className="btn btn-primary">
              Kembali ke Stok
            </button>
          </div>
        </div>
      </>
    );
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const calculateTotal = () => {
    const jumlah = parseFloat(formData.jumlah_kg) || 0;
    return jumlah * stok.harga_per_kg;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (parseFloat(formData.jumlah_kg) > stok.jumlah_tersedia) {
      setError('Jumlah melebihi stok tersedia');
      return;
    }

    if (parseFloat(formData.jumlah_kg) <= 0) {
      setError('Jumlah harus lebih dari 0');
      return;
    }

    setLoading(true);
    try {
      // Ensure proper types for backend
      const payload = {
        stok_id: parseInt(formData.stok_id),
        jumlah_kg: parseFloat(formData.jumlah_kg),
        tanggal_pengambilan: formData.tanggal_pengambilan,
        metode_pembayaran: formData.metode_pembayaran,
        catatan: formData.catatan || ''
      };

      await poAPI.create(payload);
      setShowSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal membuat order');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigate('/my-orders');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <>
      <Navbar />
      <SuccessModal 
        show={showSuccess}
        message="Purchase Order berhasil dibuat! Pesanan Anda sedang menunggu persetujuan admin."
        onClose={handleSuccessClose}
      />
      <div className="create-order-container">
        <div className="container">
          <div className="page-header">
            <h1>🛒 Buat Purchase Order</h1>
            <p>Isi form berikut untuk membuat pesanan TBS</p>
          </div>

          <div className="order-layout">
            <div className="order-form-card">
              <div className="card-header">
                <h3>Form Pesanan</h3>
              </div>

              <form onSubmit={handleSubmit}>
                {error && <div className="alert alert-danger">{error}</div>}

                <div className="form-group">
                  <label className="form-label">Jumlah (kg) *</label>
                  <input
                    type="number"
                    name="jumlah_kg"
                    className="form-control"
                    value={formData.jumlah_kg}
                    onChange={handleChange}
                    max={stok.jumlah_tersedia}
                    step="0.01"
                    required
                  />
                  <small className="form-text">
                    Maksimal: {stok.jumlah_tersedia.toLocaleString()} kg
                  </small>
                </div>

                <div className="form-group">
                  <label className="form-label">Tanggal Pengambilan *</label>
                  <input
                    type="date"
                    name="tanggal_pengambilan"
                    className="form-control"
                    value={formData.tanggal_pengambilan}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Metode Pembayaran *</label>
                  <select
                    name="metode_pembayaran"
                    className="form-control"
                    value={formData.metode_pembayaran}
                    onChange={handleChange}
                    required
                  >
                    <option value="tunai">Tunai</option>
                    <option value="transfer">Transfer</option>
                    <option value="termin">Termin</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Catatan</label>
                  <textarea
                    name="catatan"
                    className="form-control"
                    value={formData.catatan}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Catatan tambahan (opsional)"
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => navigate('/stok')}
                  >
                    Batal
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Memproses...' : 'Buat Order'}
                  </button>
                </div>
              </form>
            </div>

            <div className="order-summary-card">
              <div className="card-header">
                <h3>Ringkasan</h3>
              </div>

              <div className="summary-content">
                <div className="summary-section">
                  <h4>Detail Stok</h4>
                  <div className="summary-item">
                    <span>Kebun:</span>
                    <strong>{stok.nama_kebun}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Grade:</span>
                    <span className={`grade-badge grade-${stok.grade}`}>
                      Grade {stok.grade}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span>Kadar Minyak:</span>
                    <strong>{stok.kadar_minyak}%</strong>
                  </div>
                  <div className="summary-item">
                    <span>Harga/kg:</span>
                    <strong>{formatCurrency(stok.harga_per_kg)}</strong>
                  </div>
                </div>

                <div className="summary-section">
                  <h4>Total Pesanan</h4>
                  <div className="summary-item">
                    <span>Jumlah:</span>
                    <strong>{formData.jumlah_kg || 0} kg</strong>
                  </div>
                  <div className="summary-item total">
                    <span>Total Harga:</span>
                    <strong className="total-price">
                      {formatCurrency(calculateTotal())}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateOrder;
