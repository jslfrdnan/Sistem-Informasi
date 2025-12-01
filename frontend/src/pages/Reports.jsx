import React, { useEffect, useState } from 'react';
import { reportsAPI } from '../services/api';
import Navbar from '../components/Navbar';
import './Dashboard.css';
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
import { Line, Bar } from 'react-chartjs-2';

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
  const [dailySales, setDailySales] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const [salesRes, dashboardRes] = await Promise.all([
        reportsAPI.getDailySales(),
        reportsAPI.getDashboard(),
      ]);
      setDailySales(salesRes.data || []);
      setStats(dashboardRes.data);
    } catch (error) {
      console.error('Failed to load reports:', error);
      setDailySales([]);
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

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <div className="container">
          <div className="page-header">
            <h1>📊 Laporan Penjualan</h1>
            <p>Ringkasan dan analisis penjualan TBS</p>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
            </div>
          ) : (
            <>
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

              {dailySales.length > 0 && (
                <>
                  <div className="card">
                    <div className="card-header">
                      <h3>📈 Grafik Pendapatan Harian</h3>
                    </div>
                    <div className="card-body">
                      <Line
                        data={{
                          labels: dailySales.map(sale => formatDate(sale.tanggal)),
                          datasets: [
                            {
                              label: 'Pendapatan (IDR)',
                              data: dailySales.map(sale => sale.total_pendapatan),
                              borderColor: 'rgb(75, 192, 192)',
                              backgroundColor: 'rgba(75, 192, 192, 0.2)',
                              tension: 0.3,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          plugins: {
                            legend: {
                              position: 'top',
                            },
                            title: {
                              display: false,
                            },
                          },
                          scales: {
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

                  <div className="card">
                    <div className="card-header">
                      <h3>📊 Grafik Volume Penjualan (KG)</h3>
                    </div>
                    <div className="card-body">
                      <Bar
                        data={{
                          labels: dailySales.map(sale => formatDate(sale.tanggal)),
                          datasets: [
                            {
                              label: 'Total KG',
                              data: dailySales.map(sale => sale.total_kg),
                              backgroundColor: 'rgba(54, 162, 235, 0.5)',
                              borderColor: 'rgb(54, 162, 235)',
                              borderWidth: 1,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          plugins: {
                            legend: {
                              position: 'top',
                            },
                            title: {
                              display: false,
                            },
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
                </>
              )}

              <div className="card">
                <div className="card-header">
                  <h3>📋 Tabel Penjualan Harian</h3>
                </div>
                <div className="card-body">
                  {dailySales.length === 0 ? (
                    <p className="text-center">Belum ada data penjualan</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Tanggal</th>
                            <th>Jumlah Transaksi</th>
                            <th>Total KG</th>
                            <th>Total Pendapatan</th>
                            <th>Rata-rata Harga</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dailySales.map((sale, index) => (
                            <tr key={index}>
                              <td>{formatDate(sale.tanggal)}</td>
                              <td>{sale.jumlah_transaksi}</td>
                              <td>{sale.total_kg?.toLocaleString()} kg</td>
                              <td>{formatCurrency(sale.total_pendapatan)}</td>
                              <td>{formatCurrency(sale.rata_rata_harga)}/kg</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="table-summary">
                            <td><strong>Total</strong></td>
                            <td>
                              <strong>
                                {dailySales.reduce((sum, s) => sum + (s.jumlah_transaksi || 0), 0)}
                              </strong>
                            </td>
                            <td>
                              <strong>
                                {dailySales.reduce((sum, s) => sum + (s.total_kg || 0), 0).toLocaleString()} kg
                              </strong>
                            </td>
                            <td>
                              <strong>
                                {formatCurrency(
                                  dailySales.reduce((sum, s) => sum + (s.total_pendapatan || 0), 0)
                                )}
                              </strong>
                            </td>
                            <td></td>
                          </tr>
                        </tfoot>
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
