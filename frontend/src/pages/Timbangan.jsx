import React, { useEffect, useState } from 'react';
import { timbangAPI, purchaseOrderAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './Timbangan.css';

const Timbangan = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('weigh-in'); // weigh-in, weigh-out, history
  const [timbangList, setTimbangList] = useState([]);
  const [pendingPOs, setPendingPOs] = useState([]);
  const [weighInList, setWeighInList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'weigh-in' or 'weigh-out'
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [formData, setFormData] = useState({
    po_id: '',
    plat_nomor: '',
    berat_masuk: '',
    berat_keluar: '',
    catatan: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'weigh-in') {
        // Load timbangan records yang belum weigh-in (status='weigh_in')
        const response = await timbangAPI.getList({ status: 'weigh_in' });
        console.log('API Response:', response);
        console.log('Timbangan records (weigh_in):', response.data);
        console.log('Response data type:', typeof response.data, Array.isArray(response.data));
        
        // Filter records yang belum ada berat_masuk (NULL, undefined, atau 0)
        const pending = (response.data || []).filter(t => {
          const beratMasuk = parseFloat(t.berat_masuk);
          return !beratMasuk || beratMasuk === 0 || t.berat_masuk === null;
        });
        console.log('Filtered pending records:', pending);
        setPendingPOs(pending);
      } else if (activeTab === 'weigh-out') {
        // Load yang sudah weigh-in tapi belum weigh-out (status='loading')
        const response = await timbangAPI.getList({ status: 'loading' });
        console.log('Timbangan records (loading):', response.data);
        setWeighInList(response.data || []);
      } else {
        // Load history (all records)
        const response = await timbangAPI.getList();
        console.log('Timbangan records (all):', response.data);
        setTimbangList(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      setError('Gagal memuat data: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (type, record = null) => {
    setModalType(type);
    setSelectedRecord(record);
    setError('');
    setSuccess('');
    
    if (type === 'weigh-in') {
      setFormData({
        po_id: record?.po_id || '',
        plat_nomor: record?.plat_nomor || '',
        berat_masuk: '',
        berat_keluar: '',
        catatan: ''
      });
    } else if (type === 'weigh-out') {
      setFormData({
        po_id: record?.po_id || '',
        plat_nomor: record?.plat_nomor || '',
        berat_masuk: record?.berat_masuk || '',
        berat_keluar: '',
        catatan: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalType('');
    setSelectedRecord(null);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (modalType === 'weigh-in') {
        // Validate
        if (!formData.berat_masuk) {
          setError('Berat Masuk wajib diisi');
          return;
        }
        if (parseFloat(formData.berat_masuk) <= 0) {
          setError('Berat masuk harus lebih dari 0');
          return;
        }

        // Record weigh-in - Update existing timbangan record
        await timbangAPI.weighIn(selectedRecord.id, {
          berat_masuk: parseFloat(formData.berat_masuk)
        });

        setSuccess('Timbang masuk berhasil dicatat');
        setTimeout(() => {
          handleCloseModal();
          loadData();
        }, 1500);

      } else if (modalType === 'weigh-out') {
        // Validate
        if (!formData.berat_keluar) {
          setError('Berat keluar wajib diisi');
          return;
        }
        const beratKeluar = parseFloat(formData.berat_keluar);
        const beratMasuk = parseFloat(formData.berat_masuk);
        
        if (beratKeluar <= 0) {
          setError('Berat keluar harus lebih dari 0');
          return;
        }
        if (beratKeluar <= beratMasuk) {
          setError('Berat keluar harus lebih besar dari berat masuk');
          return;
        }

        // Record weigh-out (backend will auto-calculate net weight & generate documents)
        await timbangAPI.weighOut(selectedRecord.id, {
          berat_keluar: beratKeluar,
          grade_aktual: 'A', // Default grade, can be made dynamic later
          kadar_air: 0,
          kadar_sampah: 0,
          tingkat_kematangan: 'Matang',
          catatan: formData.catatan || ''
        });

        setSuccess('Timbang keluar berhasil! Dokumen telah di-generate.');
        setTimeout(() => {
          handleCloseModal();
          loadData();
        }, 1500);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Gagal menyimpan data timbangan');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      weigh_in: { label: 'Timbang Masuk', class: 'badge-warning' },
      loading: { label: 'Loading', class: 'badge-info' },
      weigh_out: { label: 'Timbang Keluar', class: 'badge-primary' },
      completed: { label: 'Selesai', class: 'badge-success' },
    };
    const s = statusMap[status] || { label: status, class: 'badge-secondary' };
    return <span className={`badge ${s.class}`}>{s.label}</span>;
  };

  return (
    <>
      <Navbar />
      <div className="timbangan-container">
        <div className="container">
          <div className="page-header">
            <h1>⚖️ Sistem Timbangan TBS</h1>
            <p>Operator: {user?.username} | {user?.email}</p>
          </div>

          {/* Tabs */}
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'weigh-in' ? 'active' : ''}`}
              onClick={() => setActiveTab('weigh-in')}
            >
              📥 Timbang Masuk
            </button>
            <button 
              className={`tab ${activeTab === 'weigh-out' ? 'active' : ''}`}
              onClick={() => setActiveTab('weigh-out')}
            >
              📤 Timbang Keluar
            </button>
            <button 
              className={`tab ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              📋 Riwayat
            </button>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
            </div>
          ) : (
            <>
              {/* Tab: Weigh-In */}
              {activeTab === 'weigh-in' && (
                <div className="card">
                  <h3>📥 Kendaraan Siap Ditimbang Masuk</h3>
                  <p className="text-muted">Daftar kendaraan yang sudah dijadwalkan dan menunggu untuk ditimbang masuk</p>
                  
                  {pendingPOs.length === 0 ? (
                    <div className="text-center">
                      <p>Tidak ada kendaraan yang siap ditimbang masuk</p>
                      <small>Pastikan Admin sudah membuat jadwal pengambilan untuk PO yang approved</small>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>ID Timbangan</th>
                            <th>PO ID</th>
                            <th>Plat Nomor</th>
                            <th>Status</th>
                            <th>Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pendingPOs.map((record) => (
                            <tr key={record.id}>
                              <td><strong>#{record.id}</strong></td>
                              <td>PO-{record.po_id}</td>
                              <td><strong>{record.plat_nomor}</strong></td>
                              <td><span className="badge badge-info">{record.status}</span></td>
                              <td>
                                <button 
                                  className="btn btn-primary btn-sm"
                                  onClick={() => handleOpenModal('weigh-in', record)}
                                >
                                  ⚖️ Timbang Masuk
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Weigh-Out */}
              {activeTab === 'weigh-out' && (
                <div className="card">
                  <h3>📤 Kendaraan Siap Ditimbang Keluar</h3>
                  <p className="text-muted">Daftar kendaraan yang sudah loading dan siap ditimbang keluar</p>
                  
                  {weighInList.length === 0 ? (
                    <div className="text-center">
                      <p>Tidak ada kendaraan yang siap ditimbang keluar</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>PO Number</th>
                            <th>Plat Nomor</th>
                            <th>Berat Masuk</th>
                            <th>Waktu Masuk</th>
                            <th>Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {weighInList.map((record) => (
                            <tr key={record.id}>
                              <td><strong>{record.po_number}</strong></td>
                              <td><strong className="text-primary">{record.plat_nomor}</strong></td>
                              <td>{record.berat_masuk.toLocaleString()} kg</td>
                              <td>{formatDate(record.waktu_masuk)}</td>
                              <td>
                                <button 
                                  className="btn btn-success btn-sm"
                                  onClick={() => handleOpenModal('weigh-out', record)}
                                >
                                  ⚖️ Timbang Keluar
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: History */}
              {activeTab === 'history' && (
                <div className="card">
                  <h3>📋 Riwayat Timbangan</h3>
                  <p className="text-muted">Semua record timbangan yang telah dilakukan</p>
                  
                  {timbangList.length === 0 ? (
                    <div className="text-center">
                      <p>Belum ada riwayat timbangan</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>PO Number</th>
                            <th>Plat Nomor</th>
                            <th>Berat Masuk</th>
                            <th>Berat Keluar</th>
                            <th>Berat Bersih</th>
                            <th>Waktu Masuk</th>
                            <th>Waktu Keluar</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {timbangList.map((item) => (
                            <tr key={item.id}>
                              <td><strong>{item.po_number}</strong></td>
                              <td><strong>{item.plat_nomor}</strong></td>
                              <td>{item.berat_masuk?.toLocaleString() || '-'} kg</td>
                              <td>{item.berat_keluar?.toLocaleString() || '-'} kg</td>
                              <td>
                                {item.berat_bersih ? (
                                  <strong className="text-success">
                                    {item.berat_bersih.toLocaleString()} kg
                                  </strong>
                                ) : '-'}
                              </td>
                              <td>{formatDate(item.waktu_masuk)}</td>
                              <td>{formatDate(item.waktu_keluar)}</td>
                              <td>{getStatusBadge(item.status)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal for Weigh-In / Weigh-Out */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalType === 'weigh-in' ? '📥 Timbang Masuk' : '📤 Timbang Keluar'}</h2>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                {modalType === 'weigh-in' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">ID Timbangan</label>
                      <input
                        type="text"
                        className="form-control"
                        value={`#${selectedRecord?.id}` || ''}
                        disabled
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">PO ID</label>
                      <input
                        type="text"
                        className="form-control"
                        value={`PO-${selectedRecord?.po_id}` || ''}
                        disabled
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Plat Nomor Kendaraan</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.plat_nomor}
                        disabled
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Berat Masuk (Gross Weight) - kg *</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        placeholder="Contoh: 25000 (berat truk + muatan)"
                        value={formData.berat_masuk}
                        onChange={(e) => setFormData({ ...formData, berat_masuk: e.target.value })}
                        required
                        autoFocus
                      />
                      <small className="form-text">Berat kendaraan + muatan TBS (dalam kg)</small>
                    </div>
                  </>
                )}

                {modalType === 'weigh-out' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Plat Nomor</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.plat_nomor}
                        disabled
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Berat Masuk (Gross Weight)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={`${parseFloat(formData.berat_masuk).toLocaleString()} kg`}
                        disabled
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Berat Keluar (Tare Weight) - kg *</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        placeholder="Berat kendaraan setelah loading"
                        value={formData.berat_keluar}
                        onChange={(e) => setFormData({ ...formData, berat_keluar: e.target.value })}
                        required
                      />
                      <small className="form-text">Berat kendaraan setelah loading (kendaraan + muatan)</small>
                    </div>

                    {formData.berat_keluar && formData.berat_masuk && (
                      <div className="alert alert-info">
                        <strong>Berat Bersih (Net Weight):</strong><br/>
                        {(parseFloat(formData.berat_keluar) - parseFloat(formData.berat_masuk)).toLocaleString()} kg
                        <br/>
                        <small>= Berat Keluar - Berat Masuk</small>
                      </div>
                    )}
                  </>
                )}

                <div className="form-group">
                  <label className="form-label">Catatan (Opsional)</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Catatan operator..."
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
                  {modalType === 'weigh-in' ? '📥 Catat Timbang Masuk' : '📤 Catat Timbang Keluar & Generate Dokumen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Timbangan;
