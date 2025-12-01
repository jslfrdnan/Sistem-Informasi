import React, { useEffect, useState } from 'react';
import { dokumenAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './Dokumen.css';

const Dokumen = () => {
  const { user } = useAuth();
  const [dokumenList, setDokumenList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await dokumenAPI.getList(filter);
      setDokumenList(res.data || []);
    } catch (error) {
      console.error('Failed to load data:', error);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handlePrint = (dokumen) => {
    // Open print dialog with document details
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Dokumen Penjualan - ${dokumen.nomor_invoice}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 2rem; }
            .header { text-align: center; margin-bottom: 2rem; }
            .section { margin-bottom: 2rem; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 0.5rem; border: 1px solid #ddd; text-align: left; }
            th { background-color: #f0f0f0; }
            .footer { margin-top: 3rem; text-align: right; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>PT SAWIT MAKMUR SEJAHTERA</h1>
            <p>Perkebunan Kelapa Sawit</p>
          </div>
          
          <div class="section">
            <h2>DOKUMEN PENJUALAN</h2>
            <table>
              <tr><th>Nomor Invoice</th><td>${dokumen.nomor_invoice}</td></tr>
              <tr><th>Nomor Surat Jalan</th><td>${dokumen.nomor_surat_jalan}</td></tr>
              <tr><th>Nomor Bukti Timbang</th><td>${dokumen.nomor_bukti_timbang}</td></tr>
              <tr><th>Tanggal</th><td>${formatDate(dokumen.tanggal_dokumen)}</td></tr>
            </table>
          </div>
          
          <div class="section">
            <h3>Detail Transaksi</h3>
            <table>
              <tr><th>Buyer</th><td>${dokumen.buyer_name || '-'}</td></tr>
              <tr><th>Perusahaan</th><td>${dokumen.perusahaan || '-'}</td></tr>
              <tr><th>Nomor PO</th><td>${dokumen.nomor_po || '-'}</td></tr>
              <tr><th>Grade TBS</th><td>Grade ${dokumen.grade || '-'}</td></tr>
              <tr><th>Total Berat</th><td>${dokumen.total_berat_kg} kg</td></tr>
              <tr><th>Total Harga</th><td>${formatCurrency(dokumen.total_harga)}</td></tr>
            </table>
          </div>
          
          <div class="footer">
            <p>Dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
            <br><br>
            <p>_______________________</p>
            <p>Tanda Tangan & Stempel</p>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => window.close(), 100);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <>
      <Navbar />
      <div className="dokumen-container">
        <div className="container">
          <div className="page-header">
            <div>
              <h1>📄 Dokumen Penjualan</h1>
              <p>Invoice, Surat Jalan, dan Bukti Timbang</p>
            </div>
          </div>

          <div className="filters-card">
            <div className="filters-grid">
              <div className="form-group">
                <label className="form-label">Dari Tanggal</label>
                <input
                  type="date"
                  className="form-control"
                  value={filter.startDate}
                  onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Sampai Tanggal</label>
                <input
                  type="date"
                  className="form-control"
                  value={filter.endDate}
                  onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
                />
              </div>
            </div>
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
                      <th>Nomor Invoice</th>
                      <th>Nomor Surat Jalan</th>
                      <th>Nomor Bukti Timbang</th>
                      <th>Tanggal</th>
                      <th>Buyer</th>
                      <th>Berat (kg)</th>
                      <th>Total Harga</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dokumenList.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center">
                          Tidak ada dokumen
                        </td>
                      </tr>
                    ) : (
                      dokumenList.map((dokumen) => (
                        <tr key={dokumen.dokumen_id}>
                          <td>
                            <span className="doc-number">{dokumen.nomor_invoice}</span>
                          </td>
                          <td>
                            <span className="doc-number">{dokumen.nomor_surat_jalan}</span>
                          </td>
                          <td>
                            <span className="doc-number">{dokumen.nomor_bukti_timbang}</span>
                          </td>
                          <td>{formatDate(dokumen.tanggal_dokumen)}</td>
                          <td>
                            {dokumen.buyer_name}
                            {dokumen.perusahaan && (
                              <small style={{ display: 'block', color: '#666' }}>
                                {dokumen.perusahaan}
                              </small>
                            )}
                          </td>
                          <td>{dokumen.total_berat_kg.toLocaleString()} kg</td>
                          <td className="text-primary">{formatCurrency(dokumen.total_harga)}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button
                                className="btn btn-sm btn-outline"
                                onClick={() => handlePrint(dokumen)}
                                title="Print Dokumen"
                              >
                                🖨️ Print
                              </button>
                            </div>
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
    </>
  );
};

export default Dokumen;
