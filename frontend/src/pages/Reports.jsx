import React, { useEffect, useState } from 'react';
import { reportsAPI } from '../services/api';
import Navbar from '../components/Navbar';
import './Dashboard.css';
import * as XLSX from 'xlsx';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Reports = () => {
  const [reportData, setReportData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('penjualan'); // penjualan, timbangan, stok
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    grade: '',
    status: '',
  });

  useEffect(() => {
    loadReports();
  }, [reportType]);

  useEffect(() => {
    if (reportType !== 'penjualan') {
      // Auto-apply filters for non-penjualan reports (no need to reload from server)
      // The filtering happens client-side via getFilteredData()
    }
  }, [filters]);

  const loadReports = async () => {
    try {
      setLoading(true);
      
      if (reportType === 'penjualan') {
        const [salesRes, dashboardRes] = await Promise.all([
          reportsAPI.getDailySales(filters),
          reportsAPI.getDashboard(),
        ]);
        const sortedSales = (salesRes.data || []).sort((a, b) => 
          new Date(a.tanggal) - new Date(b.tanggal)
        );
        setReportData(sortedSales);
        setStats(dashboardRes.data);
      } else if (reportType === 'timbangan') {
        // Load timbangan data
        const response = await fetch('http://localhost:8080/api/timbangan', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await response.json();
        setReportData(data || []);
      } else if (reportType === 'stok') {
        // Load stok data
        const response = await fetch('http://localhost:8080/api/stok', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await response.json();
        setReportData(data || []);
      }
    } catch (error) {
      console.error('Failed to load reports:', error);
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const newFilters = {
      ...filters,
      [e.target.name]: e.target.value,
    };
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      grade: '',
      status: '',
    });
    loadReports();
  };

  const getReportTitle = () => {
    switch(reportType) {
      case 'timbangan': return 'Laporan Timbangan';
      case 'stok': return 'Laporan Manajemen Stok';
      default: return 'Laporan Penjualan';
    }
  };

  const getFilteredData = () => {
    let filtered = [...reportData];
    
    // Filter by date range
    if (filters.startDate || filters.endDate) {
      filtered = filtered.filter(item => {
        let itemDateStr = item.tanggal || item.waktu_masuk || item.tanggal_panen || item.created_at;
        if (!itemDateStr) return true;
        
        // Extract just the date part (YYYY-MM-DD)
        const itemDate = new Date(itemDateStr.split('T')[0]);
        const startDate = filters.startDate ? new Date(filters.startDate) : null;
        const endDate = filters.endDate ? new Date(filters.endDate) : null;
        
        // Set time to start/end of day for accurate comparison
        if (startDate) {
          startDate.setHours(0, 0, 0, 0);
          itemDate.setHours(0, 0, 0, 0);
          if (itemDate < startDate) return false;
        }
        if (endDate) {
          endDate.setHours(23, 59, 59, 999);
          itemDate.setHours(0, 0, 0, 0);
          if (itemDate > endDate) return false;
        }
        return true;
      });
    }
    
    // Filter by grade (for timbangan)
    if (filters.grade && reportType === 'timbangan') {
      filtered = filtered.filter(item => item.grade_aktual === filters.grade);
    }
    
    // Filter by status (for stok)
    if (filters.status && reportType === 'stok') {
      filtered = filtered.filter(item => item.status === filters.status);
    }
    
    return filtered;
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

  const exportToExcel = () => {
    const data = getFilteredData();
    if (data.length === 0) {
      alert('Tidak ada data untuk diekspor');
      return;
    }

    let worksheetData = [];
    let filename = '';

    if (reportType === 'penjualan') {
      filename = 'Laporan_Penjualan.xlsx';
      // Create header row
      worksheetData.push(['Tanggal', 'Jumlah Transaksi', 'Total KG', 'Total Pendapatan', 'Rata-rata Harga']);
      // Add data rows
      data.forEach(item => {
        worksheetData.push([
          formatDate(item.tanggal),
          item.jumlah_transaksi,
          item.total_kg,
          item.total_pendapatan,
          item.rata_rata_harga
        ]);
      });
    } else if (reportType === 'timbangan') {
      filename = 'Laporan_Timbangan.xlsx';
      worksheetData.push(['ID Timbangan', 'PO ID', 'Plat Nomor', 'Berat Bersih (kg)', 'Grade', 'Status', 'Waktu']);
      data.forEach(item => {
        worksheetData.push([
          item.id,
          `PO-${item.po_id}`,
          item.plat_nomor || '-',
          item.berat_bersih || '-',
          item.grade_aktual || 'Belum',
          item.status === 'completed' ? 'Selesai' : item.status === 'loading' ? 'Loading' : 'Timbang Masuk',
          item.waktu_keluar ? new Date(item.waktu_keluar).toLocaleString('id-ID') : item.waktu_masuk ? new Date(item.waktu_masuk).toLocaleString('id-ID') : '-'
        ]);
      });
    } else if (reportType === 'stok') {
      filename = 'Laporan_Stok.xlsx';
      worksheetData.push(['Nomor Lot', 'Nama Kebun', 'Jumlah (kg)', 'Grade', 'Status', 'Tanggal Panen']);
      data.forEach(item => {
        worksheetData.push([
          item.nomor_lot,
          item.nama_kebun || '-',
          item.jumlah_kg,
          item.grade,
          item.status === 'available' ? 'Tersedia' : item.status === 'reserved' ? 'Dialokasikan' : 'Terjual',
          formatDate(item.tanggal_panen)
        ]);
      });
    }

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Set column widths
    const colWidths = worksheetData[0].map(() => ({ wch: 20 }));
    ws['!cols'] = colWidths;
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, getReportTitle());
    
    // Generate Excel file and trigger download
    XLSX.writeFile(wb, filename);
  };

  const generatePDF = () => {
    const printWindow = window.open('', '_blank');
    const data = getFilteredData();
    
    let tableRows = '';
    let tableHeaders = '';
    
    if (reportType === 'penjualan') {
      tableHeaders = '<tr><th>Tanggal</th><th>Jumlah Transaksi</th><th>Total KG</th><th>Total Pendapatan</th><th>Rata-rata Harga</th></tr>';
      tableRows = data.map(item => `
        <tr>
          <td>${formatDate(item.tanggal)}</td>
          <td>${item.jumlah_transaksi}</td>
          <td>${item.total_kg.toLocaleString('id-ID')} kg</td>
          <td>${formatCurrency(item.total_pendapatan)}</td>
          <td>${formatCurrency(item.rata_rata_harga)}/kg</td>
        </tr>
      `).join('');
    } else if (reportType === 'timbangan') {
      tableHeaders = '<tr><th>PO Number</th><th>Berat Masuk</th><th>Berat Keluar</th><th>Berat Bersih</th><th>Grade</th><th>Waktu</th></tr>';
      tableRows = data.map(item => `
        <tr>
          <td>${item.po_number || '-'}</td>
          <td>${item.berat_masuk || 0} kg</td>
          <td>${item.berat_keluar || 0} kg</td>
          <td>${item.berat_bersih || 0} kg</td>
          <td>${item.grade_aktual || '-'}</td>
          <td>${item.waktu_masuk ? new Date(item.waktu_masuk).toLocaleString('id-ID') : '-'}</td>
        </tr>
      `).join('');
    } else if (reportType === 'stok') {
      tableHeaders = '<tr><th>Nomor Lot</th><th>Kebun</th><th>Jumlah</th><th>Grade</th><th>Status</th><th>Tanggal Panen</th></tr>';
      tableRows = data.map(item => `
        <tr>
          <td>${item.nomor_lot}</td>
          <td>${item.nama_kebun || '-'}</td>
          <td>${item.jumlah_kg} kg</td>
          <td>${item.grade}</td>
          <td>${item.status}</td>
          <td>${formatDate(item.tanggal_panen)}</td>
        </tr>
      `).join('');
    }
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${getReportTitle()}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #2e7d32; text-align: center; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #2e7d32; color: white; }
          tr:nth-child(even) { background-color: #f5f5f5; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <h1>📊 ${getReportTitle()}</h1>
        <p style="text-align: center; color: #666;">Tanggal Generate: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        
        <table>
          <thead>${tableHeaders}</thead>
          <tbody>${tableRows}</tbody>
        </table>
        
        <button class="no-print" onclick="window.print()" style="
          background: #2e7d32; color: white; padding: 12px 24px; 
          border: none; border-radius: 6px; cursor: pointer; font-size: 16px;
          display: block; margin: 20px auto;
        ">🖨️ Cetak Dokumen</button>
      </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <div className="container">
          <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1>📊 {getReportTitle()}</h1>
              <p>Analisis dan ekspor data laporan</p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={exportToExcel}
                className="btn btn-primary"
                style={{ height: 'fit-content' }}
              >
                📊 Export Excel
              </button>
              <button 
                onClick={generatePDF}
                className="btn btn-primary"
                style={{ height: 'fit-content' }}
              >
                📄 Export PDF
              </button>
            </div>
          </div>

          {/* Report Type Selection */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="card-header">
              <h3>📋 Pilih Jenis Laporan</h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setReportType('penjualan')}
                  className={`btn ${reportType === 'penjualan' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: '1', minWidth: '150px' }}
                >
                  💰 Laporan Penjualan
                </button>
                <button
                  onClick={() => setReportType('timbangan')}
                  className={`btn ${reportType === 'timbangan' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: '1', minWidth: '150px' }}
                >
                  ⚖️ Laporan Timbangan
                </button>
                <button
                  onClick={() => setReportType('stok')}
                  className={`btn ${reportType === 'stok' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: '1', minWidth: '150px' }}
                >
                  📦 Laporan Stok
                </button>
              </div>
            </div>
          </div>

          {/* Filter Section */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="card-header">
              <h3>🔍 Filter Data</h3>
            </div>
            <div className="card-body">
              <div className="filter-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                <div className="form-group">
                  <label>Tanggal Mulai</label>
                  <input
                    type="date"
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleFilterChange}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label>Tanggal Akhir</label>
                  <input
                    type="date"
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleFilterChange}
                    className="form-control"
                  />
                </div>

                {reportType === 'timbangan' && (
                  <div className="form-group">
                    <label>Grade</label>
                    <select
                      name="grade"
                      value={filters.grade}
                      onChange={handleFilterChange}
                      className="form-control"
                    >
                      <option value="">Semua Grade</option>
                      <option value="A">Grade A</option>
                      <option value="B">Grade B</option>
                      <option value="C">Grade C</option>
                    </select>
                  </div>
                )}

                {reportType === 'stok' && (
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      name="status"
                      value={filters.status}
                      onChange={handleFilterChange}
                      className="form-control"
                    >
                      <option value="">Semua Status</option>
                      <option value="available">Tersedia</option>
                      <option value="reserved">Dialokasikan</option>
                      <option value="sold_out">Terjual</option>
                    </select>
                  </div>
                )}

                <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button 
                    onClick={handleResetFilters} 
                    className="btn btn-secondary"
                    style={{ width: '100%' }}
                  >
                    🔄 Reset Filter
                  </button>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
            </div>
          ) : (
            <>
              {reportType === 'penjualan' && stats && (
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
              )}

              {getFilteredData().length > 0 ? (
                <>
                  {reportType === 'penjualan' && (
                    <>
                      {/* Grafik Pendapatan */}
                      <div className="card">
                        <div className="card-header">
                          <h3>📈 Grafik Pendapatan Harian</h3>
                          <small style={{ color: '#666' }}>Tanggal terbaru di sebelah kanan</small>
                        </div>
                    <div className="card-body">
                      <Line
                        data={{
                          labels: getFilteredData().map(sale => formatDate(sale.tanggal)),
                          datasets: [
                            {
                              label: 'Pendapatan (IDR)',
                              data: getFilteredData().map(sale => sale.total_pendapatan),
                              borderColor: 'rgb(75, 192, 192)',
                              backgroundColor: 'rgba(75, 192, 192, 0.2)',
                              tension: 0.3,
                              fill: true,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: true,
                          plugins: {
                            legend: {
                              position: 'top',
                            },
                            title: {
                              display: false,
                            },
                          },
                          scales: {
                            x: {
                              reverse: false, // Ensure oldest is left, newest is right
                            },
                            y: {
                              beginAtZero: true,
                              ticks: {
                                callback: function(value) {
                                  return 'Rp ' + value.toLocaleString('id-ID');
                                }
                              }
                            }
                          }
                        }}
                      />
                        </div>
                      </div>

                      {/* Grafik Volume */}
                      <div className="card">
                        <div className="card-header">
                          <h3>📊 Grafik Volume Penjualan (KG)</h3>
                        </div>
                    <div className="card-body">
                      <Bar
                        data={{
                          labels: getFilteredData().map(sale => formatDate(sale.tanggal)),
                          datasets: [
                            {
                              label: 'Total KG',
                              data: getFilteredData().map(sale => sale.total_kg),
                              backgroundColor: 'rgba(54, 162, 235, 0.6)',
                              borderColor: 'rgb(54, 162, 235)',
                              borderWidth: 2,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: true,
                          plugins: {
                            legend: {
                              position: 'top',
                            },
                            title: {
                              display: false,
                            },
                          },
                          scales: {
                            x: {
                              reverse: false,
                            },
                            y: {
                              beginAtZero: true,
                              ticks: {
                                callback: function(value) {
                                  return value.toLocaleString('id-ID') + ' kg';
                                }
                              }
                            }
                          }
                        }}
                      />
                        </div>
                      </div>

                      {/* Grafik Transaksi Harian */}
                      <div className="card">
                        <div className="card-header">
                          <h3>📈 Jumlah Transaksi Harian</h3>
                        </div>
                    <div className="card-body">
                      <Line
                        data={{
                          labels: getFilteredData().map(sale => formatDate(sale.tanggal)),
                          datasets: [
                            {
                              label: 'Jumlah Transaksi',
                              data: getFilteredData().map(sale => sale.jumlah_transaksi),
                              borderColor: 'rgb(255, 159, 64)',
                              backgroundColor: 'rgba(255, 159, 64, 0.2)',
                              tension: 0.3,
                              fill: true,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: true,
                          plugins: {
                            legend: {
                              position: 'top',
                            },
                            title: {
                              display: false,
                            },
                          },
                          scales: {
                            x: {
                              reverse: false,
                            },
                            y: {
                              beginAtZero: true,
                              ticks: {
                                stepSize: 1,
                              }
                            }
                          }
                        }}
                      />
                        </div>
                      </div>
                    </>
                  )}

                  {reportType === 'timbangan' && (
                    <>
                      {/* Grafik Berat Bersih */}
                      <div className="card">
                        <div className="card-header">
                          <h3>⚖️ Grafik Berat Bersih Timbangan</h3>
                        </div>
                        <div className="card-body">
                          <Bar
                            data={{
                              labels: getFilteredData().map((item, idx) => `Timbang ${idx + 1}`),
                              datasets: [
                                {
                                  label: 'Berat Bersih (kg)',
                                  data: getFilteredData().map(item => item.berat_bersih || 0),
                                  backgroundColor: 'rgba(75, 192, 192, 0.6)',
                                  borderColor: 'rgb(75, 192, 192)',
                                  borderWidth: 2,
                                },
                              ],
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: true,
                              plugins: {
                                legend: { position: 'top' },
                              },
                              scales: {
                                y: {
                                  beginAtZero: true,
                                  ticks: {
                                    callback: function(value) {
                                      return value.toLocaleString('id-ID') + ' kg';
                                    }
                                  }
                                }
                              }
                            }}
                          />
                        </div>
                      </div>

                      {/* Grafik Distribusi Grade */}
                      <div className="card">
                        <div className="card-header">
                          <h3>🌴 Distribusi Grade Timbangan</h3>
                        </div>
                        <div className="card-body">
                          <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                            <Doughnut
                              data={{
                                labels: ['Grade A', 'Grade B', 'Grade C'],
                                datasets: [{
                                  label: 'Jumlah',
                                  data: [
                                    getFilteredData().filter(i => i.grade_aktual === 'A').length,
                                    getFilteredData().filter(i => i.grade_aktual === 'B').length,
                                    getFilteredData().filter(i => i.grade_aktual === 'C').length,
                                  ],
                                  backgroundColor: [
                                    'rgba(46, 204, 113, 0.7)',
                                    'rgba(52, 152, 219, 0.7)',
                                    'rgba(241, 196, 15, 0.7)',
                                  ],
                                  borderColor: [
                                    'rgba(46, 204, 113, 1)',
                                    'rgba(52, 152, 219, 1)',
                                    'rgba(241, 196, 15, 1)',
                                  ],
                                  borderWidth: 2,
                                }]
                              }}
                              options={{
                                responsive: true,
                                maintainAspectRatio: true,
                                plugins: {
                                  legend: { position: 'bottom' },
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {reportType === 'stok' && (
                    <>
                      {/* Grafik Stok per Grade */}
                      <div className="card">
                        <div className="card-header">
                          <h3>📊 Stok TBS per Grade</h3>
                        </div>
                        <div className="card-body">
                          <Bar
                            data={{
                              labels: ['Grade A', 'Grade B', 'Grade C'],
                              datasets: [
                                {
                                  label: 'Jumlah (kg)',
                                  data: [
                                    getFilteredData().filter(i => i.grade === 'A').reduce((sum, i) => sum + i.jumlah_kg, 0),
                                    getFilteredData().filter(i => i.grade === 'B').reduce((sum, i) => sum + i.jumlah_kg, 0),
                                    getFilteredData().filter(i => i.grade === 'C').reduce((sum, i) => sum + i.jumlah_kg, 0),
                                  ],
                                  backgroundColor: [
                                    'rgba(46, 204, 113, 0.7)',
                                    'rgba(52, 152, 219, 0.7)',
                                    'rgba(241, 196, 15, 0.7)',
                                  ],
                                  borderColor: [
                                    'rgba(46, 204, 113, 1)',
                                    'rgba(52, 152, 219, 1)',
                                    'rgba(241, 196, 15, 1)',
                                  ],
                                  borderWidth: 2,
                                },
                              ],
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: true,
                              plugins: {
                                legend: { display: false },
                              },
                              scales: {
                                y: {
                                  beginAtZero: true,
                                  ticks: {
                                    callback: function(value) {
                                      return value.toLocaleString('id-ID') + ' kg';
                                    }
                                  }
                                }
                              }
                            }}
                          />
                        </div>
                      </div>

                      {/* Grafik Status Stok */}
                      <div className="card">
                        <div className="card-header">
                          <h3>📦 Status Stok TBS</h3>
                        </div>
                        <div className="card-body">
                          <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                            <Doughnut
                              data={{
                                labels: ['Tersedia', 'Dialokasikan', 'Terjual'],
                                datasets: [{
                                  label: 'Jumlah',
                                  data: [
                                    getFilteredData().filter(i => i.status === 'available').length,
                                    getFilteredData().filter(i => i.status === 'reserved').length,
                                    getFilteredData().filter(i => i.status === 'sold_out').length,
                                  ],
                                  backgroundColor: [
                                    'rgba(76, 175, 80, 0.7)',
                                    'rgba(255, 193, 7, 0.7)',
                                    'rgba(156, 39, 176, 0.7)',
                                  ],
                                  borderColor: [
                                    'rgba(76, 175, 80, 1)',
                                    'rgba(255, 193, 7, 1)',
                                    'rgba(156, 39, 176, 1)',
                                  ],
                                  borderWidth: 2,
                                }]
                              }}
                              options={{
                                responsive: true,
                                maintainAspectRatio: true,
                                plugins: {
                                  legend: { position: 'bottom' },
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="card">
                  <div className="card-body">
                    <p className="text-center" style={{ padding: '40px', color: '#666' }}>
                      {reportData.length === 0 
                        ? 'Belum ada data' 
                        : 'Tidak ada data untuk filter yang dipilih. Silakan ubah filter.'}
                    </p>
                  </div>
                </div>
              )}

              <div className="card">
                <div className="card-header">
                  <h3>📋 Tabel {getReportTitle()}</h3>
                </div>
                <div className="card-body">
                  {getFilteredData().length === 0 ? (
                    <p className="text-center" style={{ padding: '40px', color: '#666' }}>
                      {reportData.length === 0 
                        ? 'Belum ada data' 
                        : 'Tidak ada data untuk filter yang dipilih.'}
                    </p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table">
                        <thead>
                          <tr>
                            {reportType === 'penjualan' && (
                              <>
                                <th>Tanggal</th>
                                <th>Jumlah Transaksi</th>
                                <th>Total KG</th>
                                <th>Total Pendapatan</th>
                                <th>Rata-rata Harga</th>
                              </>
                            )}
                            {reportType === 'timbangan' && (
                              <>
                                <th>ID</th>
                                <th>PO ID</th>
                                <th>Plat Nomor</th>
                                <th>Berat Bersih</th>
                                <th>Grade</th>
                                <th>Status</th>
                                <th>Waktu</th>
                              </>
                            )}
                            {reportType === 'stok' && (
                              <>
                                <th>Nomor Lot</th>
                                <th>Kebun</th>
                                <th>Jumlah (kg)</th>
                                <th>Grade</th>
                                <th>Status</th>
                                <th>Tanggal Panen</th>
                              </>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {reportType === 'penjualan' && getFilteredData().map((item, index) => (
                            <tr key={index}>
                              <td>{formatDate(item.tanggal)}</td>
                              <td>{item.jumlah_transaksi}</td>
                              <td>{item.total_kg?.toLocaleString()} kg</td>
                              <td>{formatCurrency(item.total_pendapatan)}</td>
                              <td>{formatCurrency(item.rata_rata_harga)}/kg</td>
                            </tr>
                          ))}
                          {reportType === 'timbangan' && getFilteredData().map((item, index) => (
                            <tr key={index}>
                              <td>#{item.id}</td>
                              <td>PO-{item.po_id}</td>
                              <td>{item.plat_nomor || '-'}</td>
                              <td>{item.berat_bersih ? `${item.berat_bersih} kg` : '-'}</td>
                              <td>
                                <span style={{
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  backgroundColor: item.grade_aktual === 'A' ? '#e8f5e9' : item.grade_aktual === 'B' ? '#e3f2fd' : item.grade_aktual === 'C' ? '#fff3e0' : '#f5f5f5',
                                  color: item.grade_aktual === 'A' ? '#2e7d32' : item.grade_aktual === 'B' ? '#1565c0' : item.grade_aktual === 'C' ? '#e65100' : '#666'
                                }}>
                                  {item.grade_aktual || 'Belum'}
                                </span>
                              </td>
                              <td>
                                <span style={{
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  backgroundColor: item.status === 'completed' ? '#e8f5e9' : item.status === 'loading' ? '#fff3e0' : '#e3f2fd',
                                  color: item.status === 'completed' ? '#2e7d32' : item.status === 'loading' ? '#e65100' : '#1565c0'
                                }}>
                                  {item.status === 'completed' ? 'Selesai' : item.status === 'loading' ? 'Loading' : 'Timbang Masuk'}
                                </span>
                              </td>
                              <td>{item.waktu_keluar ? new Date(item.waktu_keluar).toLocaleString('id-ID') : item.waktu_masuk ? new Date(item.waktu_masuk).toLocaleString('id-ID') : '-'}</td>
                            </tr>
                          ))}
                          {reportType === 'stok' && getFilteredData().map((item, index) => (
                            <tr key={index}>
                              <td>{item.nomor_lot}</td>
                              <td>{item.nama_kebun || '-'}</td>
                              <td>{item.jumlah_kg} kg</td>
                              <td>
                                <span style={{
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  backgroundColor: item.grade === 'A' ? '#e8f5e9' : item.grade === 'B' ? '#e3f2fd' : '#fff3e0',
                                  color: item.grade === 'A' ? '#2e7d32' : item.grade === 'B' ? '#1565c0' : '#e65100'
                                }}>
                                  {item.grade}
                                </span>
                              </td>
                              <td>
                                <span style={{
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  backgroundColor: item.status === 'available' ? '#e8f5e9' : item.status === 'reserved' ? '#fff3e0' : '#f3e5f5',
                                  color: item.status === 'available' ? '#2e7d32' : item.status === 'reserved' ? '#e65100' : '#6a1b9a'
                                }}>
                                  {item.status === 'available' ? 'Tersedia' : item.status === 'reserved' ? 'Dialokasikan' : 'Terjual'}
                                </span>
                              </td>
                              <td>{formatDate(item.tanggal_panen)}</td>
                            </tr>
                          ))}
                        </tbody>
                        {reportType === 'penjualan' && (
                          <tfoot>
                            <tr className="table-summary">
                              <td><strong>Total</strong></td>
                              <td>
                                <strong>
                                  {getFilteredData().reduce((sum, s) => sum + (s.jumlah_transaksi || 0), 0)}
                                </strong>
                              </td>
                              <td>
                                <strong>
                                  {getFilteredData().reduce((sum, s) => sum + (s.total_kg || 0), 0).toLocaleString()} kg
                                </strong>
                              </td>
                              <td>
                                <strong>
                                  {formatCurrency(
                                    getFilteredData().reduce((sum, s) => sum + (s.total_pendapatan || 0), 0)
                                  )}
                                </strong>
                              </td>
                              <td></td>
                            </tr>
                          </tfoot>
                        )}
                        {reportType === 'stok' && (
                          <tfoot>
                            <tr className="table-summary">
                              <td colSpan="2"><strong>Total</strong></td>
                              <td>
                                <strong>
                                  {getFilteredData().reduce((sum, s) => sum + (s.jumlah_kg || 0), 0).toLocaleString()} kg
                                </strong>
                              </td>
                              <td colSpan="3"></td>
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Reports;
