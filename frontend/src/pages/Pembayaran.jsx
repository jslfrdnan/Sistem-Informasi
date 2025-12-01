import React, { useEffect, useState } from 'react';
import { pembayaranAPI, dokumenAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './Pembayaran.css';

const Pembayaran = () => {
  const { user, isAdmin, isStaff } = useAuth();
  const [pembayaranList, setPembayaranList] = useState([]);
  const [dokumenList, setDokumenList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [currentPayment, setCurrentPayment] = useState(null);
  const [formData, setFormData] = useState({
    dokumen_id: '',
    metode_pembayaran: 'transfer',
    jumlah_bayar: '',
    tanggal_pembayaran: new Date().toISOString().split('T')[0],
    bank_pengirim: '',
    nomor_rekening: '',
    nama_pengirim: '',
    tanggal_jatuh_tempo: '',
    catatan: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pembayaranRes, dokumenRes] = await Promise.all([
        pembayaranAPI.getList(),
        dokumenAPI.getList()
      ]);
      setPembayaranList(pembayaranRes.data || []);
      setDokumenList(dokumenRes.data || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setFormData({
      dokumen_id: '',
      metode_pembayaran: 'transfer',
      jumlah_bayar: '',
      tanggal_pembayaran: new Date().toISOString().split('T')[0],
      bank_pengirim: '',
      nomor_rekening: '',
      nama_pengirim: '',
      tanggal_jatuh_tempo: '',
      catatan: ''
    });
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setShowVerifyModal(false);
    setCurrentPayment(null);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.dokumen_id || !formData.jumlah_bayar) {
      setError('Dokumen dan jumlah bayar wajib diisi');
      return;
    }

    if (parseFloat(formData.jumlah_bayar) <= 0) {
      setError('Jumlah bayar harus lebih dari 0');
      return;
    }

    try {
      // Convert dokumen_id to integer and jumlah_bayar to float
      const payload = {
        dokumen_id: parseInt(formData.dokumen_id),
        metode_pembayaran: formData.metode_pembayaran,
        jumlah_bayar: parseFloat(formData.jumlah_bayar),
        tanggal_pembayaran: formData.tanggal_pembayaran,
        bank_pengirim: formData.bank_pengirim || '',
        nomor_rekening: formData.nomor_rekening || '',
        nama_pengirim: formData.nama_pengirim || '',
        tanggal_jatuh_tempo: formData.tanggal_jatuh_tempo || '',
        catatan: formData.catatan || ''
      };
      
      await pembayaranAPI.create(payload);
      setSuccess('Pembayaran berhasil dibuat');
      setTimeout(() => {
        handleCloseModal();
        loadData();
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.error || 'Gagal membuat pembayaran');
    }
  };

  const handleVerify = async (status) => {
    setError('');
    setSuccess('');

    try {
      await pembayaranAPI.verify(currentPayment.bayar_id, status);
      setSuccess(`Pembayaran berhasil di${status === 'verified' ? 'setujui' : 'tolak'}`);
      setTimeout(() => {
        handleCloseModal();
        loadData();
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.error || 'Gagal verifikasi pembayaran');
    }
  };

  const openVerifyModal = (payment) => {
    setCurrentPayment(payment);
    setShowVerifyModal(true);
    setError('');
    setSuccess('');
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Pending', class: 'badge-warning' },
      verified: { label: 'Verified', class: 'badge-success' },
      rejected: { label: 'Ditolak', class: 'badge-danger' }
    };
    const config = statusConfig[status] || { label: status, class: 'badge-secondary' };
    return <span className={`badge ${config.class}`}>{config.label}</span>;
  };

  const getMetodeBadge = (metode) => {
    const icons = {
      tunai: '💵',
      transfer: '🏦',
      termin: '📝'
    };
    return `${icons[metode] || '💰'} ${metode.charAt(0).toUpperCase() + metode.slice(1)}`;
  };

  return (
    <>
      <Navbar />
      <div className="pembayaran-container">
        <div className="container">
          <div className="page-header">
            <div>
              <h1>💳 Pembayaran</h1>
              <p>Kelola pembayaran dan verifikasi transaksi</p>
            </div>
            {user?.role === 'buyer' && (
              <button className="btn btn-primary" onClick={handleOpenModal}>
                ➕ Buat Pembayaran
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
                      <th>ID</th>
                      <th>Nomor Invoice</th>
                      <th>Buyer</th>
                      <th>Metode</th>
                      <th>Jumlah</th>
                      <th>Tanggal</th>
                      <th>Status</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pembayaranList.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center">
                          Tidak ada data pembayaran
                        </td>
                      </tr>
                    ) : (
                      pembayaranList.map((payment) => (
                        <tr key={payment.bayar_id}>
                          <td>{payment.bayar_id}</td>
                          <td>{payment.nomor_invoice || '-'}</td>
                          <td>{payment.buyer_name || '-'}</td>
                          <td>{getMetodeBadge(payment.metode_pembayaran)}</td>
                          <td>{formatCurrency(payment.jumlah_bayar)}</td>
                          <td>{formatDate(payment.tanggal_bayar)}</td>
                          <td>{getStatusBadge(payment.status_verifikasi)}</td>
                          <td>
                            {(isAdmin || isStaff) && payment.status_verifikasi === 'pending' && (
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => openVerifyModal(payment)}
                              >
                                ✓ Verifikasi
                              </button>
                            )}
                            {payment.bukti_bayar && (
                              <a
                                href={payment.bukti_bayar}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-outline"
                                style={{ marginLeft: '0.5rem' }}
                              >
                                📄 Bukti
                              </a>
                            )}
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

      {/* Create Payment Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Buat Pembayaran</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <div className="form-group">
                  <label className="form-label">Pilih Invoice / Dokumen *</label>
                  <select
                    className="form-control"
                    value={formData.dokumen_id}
                    onChange={(e) => {
                      const selectedDokumen = dokumenList.find(d => d.id === parseInt(e.target.value));
                      setFormData({ 
                        ...formData, 
                        dokumen_id: e.target.value,
                        jumlah_bayar: selectedDokumen?.total_akhir || formData.jumlah_bayar
                      });
                    }}
                    required
                  >
                    <option value="">-- Pilih Dokumen Penjualan --</option>
                    {dokumenList.map((dokumen) => (
                      <option key={dokumen.id} value={dokumen.id}>
                        Invoice: {dokumen.nomor_invoice} | PO: {dokumen.po_number} | {formatCurrency(dokumen.total_akhir)}
                      </option>
                    ))}
                  </select>
                  <small className="form-text">
                    Pilih dokumen/invoice yang akan dibayar
                  </small>
                </div>

                <div className="form-group">
                  <label className="form-label">Metode Pembayaran *</label>
                  <select
                    className="form-control"
                    value={formData.metode_pembayaran}
                    onChange={(e) => setFormData({ ...formData, metode_pembayaran: e.target.value })}
                    required
                  >
                    <option value="tunai">💵 Tunai</option>
                    <option value="transfer">🏦 Transfer Bank</option>
                    <option value="termin">📝 Termin (Cicilan)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Jumlah Bayar (IDR) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    placeholder="0"
                    value={formData.jumlah_bayar}
                    onChange={(e) => setFormData({ ...formData, jumlah_bayar: e.target.value })}
                    required
                  />
                  <small className="form-text">
                    {formData.dokumen_id && dokumenList.find(d => d.id === parseInt(formData.dokumen_id)) && (
                      <span className="text-success">
                        ✓ Total dari invoice yang dipilih telah diisi otomatis
                      </span>
                    )}
                  </small>
                </div>

                <div className="form-group">
                  <label className="form-label">Tanggal Pembayaran *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.tanggal_pembayaran}
                    onChange={(e) => setFormData({ ...formData, tanggal_pembayaran: e.target.value })}
                    required
                  />
                </div>

                {formData.metode_pembayaran === 'transfer' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Bank Pengirim</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Contoh: BCA, Mandiri, BRI"
                        value={formData.bank_pengirim}
                        onChange={(e) => setFormData({ ...formData, bank_pengirim: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Nomor Rekening</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Nomor rekening pengirim"
                        value={formData.nomor_rekening}
                        onChange={(e) => setFormData({ ...formData, nomor_rekening: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Nama Pengirim</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Nama pemilik rekening"
                        value={formData.nama_pengirim}
                        onChange={(e) => setFormData({ ...formData, nama_pengirim: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {formData.metode_pembayaran === 'termin' && (
                  <div className="form-group">
                    <label className="form-label">Tanggal Jatuh Tempo</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.tanggal_jatuh_tempo}
                      onChange={(e) => setFormData({ ...formData, tanggal_jatuh_tempo: e.target.value })}
                    />
                    <small className="form-text">
                      Untuk pembayaran termin/cicilan
                    </small>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Catatan (opsional)</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Nomor referensi, keterangan, dll"
                    value={formData.catatan}
                    onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                  ></textarea>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Buat Pembayaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Verify Payment Modal */}
      {showVerifyModal && currentPayment && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Verifikasi Pembayaran</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>

            <div className="modal-body">
              {error && <div className="alert alert-error">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              <div className="payment-detail">
                <h3>Detail Pembayaran</h3>
                <div className="detail-row">
                  <span>ID Pembayaran:</span>
                  <strong>{currentPayment.bayar_id}</strong>
                </div>
                <div className="detail-row">
                  <span>Invoice:</span>
                  <strong>{currentPayment.nomor_invoice || '-'}</strong>
                </div>
                <div className="detail-row">
                  <span>Buyer:</span>
                  <strong>{currentPayment.buyer_name || '-'}</strong>
                </div>
                <div className="detail-row">
                  <span>Metode:</span>
                  <strong>{getMetodeBadge(currentPayment.metode_pembayaran)}</strong>
                </div>
                <div className="detail-row">
                  <span>Jumlah:</span>
                  <strong className="text-primary">{formatCurrency(currentPayment.jumlah_bayar)}</strong>
                </div>
                <div className="detail-row">
                  <span>Tanggal:</span>
                  <strong>{formatDate(currentPayment.tanggal_bayar)}</strong>
                </div>
                {currentPayment.catatan && (
                  <div className="detail-row">
                    <span>Catatan:</span>
                    <span>{currentPayment.catatan}</span>
                  </div>
                )}
                {currentPayment.bukti_bayar && (
                  <div className="detail-row">
                    <span>Bukti:</span>
                    <a href={currentPayment.bukti_bayar} target="_blank" rel="noopener noreferrer">
                      📄 Lihat Bukti Transfer
                    </a>
                  </div>
                )}
              </div>

              <div className="alert alert-warning">
                ⚠️ Pastikan Anda telah memeriksa bukti pembayaran sebelum verifikasi
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={handleCloseModal}>
                Tutup
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleVerify('rejected')}
              >
                ✗ Tolak
              </button>
              <button
                className="btn btn-success"
                onClick={() => handleVerify('verified')}
              >
                ✓ Setujui
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Pembayaran;
