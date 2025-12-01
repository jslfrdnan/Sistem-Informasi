import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { poAPI } from '../services/api';
import Navbar from '../components/Navbar';
import './MyOrders.css';

const MyOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadOrders();
  }, [filter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await poAPI.getList({ status: filter });
      // Deduplicate orders by id
      const uniqueOrders = [];
      const seenIds = new Set();
      (response.data || []).forEach(order => {
        if (!seenIds.has(order.id)) {
          seenIds.add(order.id);
          uniqueOrders.push(order);
        }
      });
      setOrders(uniqueOrders);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (orderId) => {
    if (!confirm('Yakin ingin membatalkan order ini?')) return;

    try {
      await poAPI.cancel(orderId);
      alert('Order berhasil dibatalkan');
      loadOrders();
    } catch (error) {
      alert('Gagal membatalkan order');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: 'Pending', class: 'warning' },
      approved: { label: 'Approved', class: 'success' },
      rejected: { label: 'Rejected', class: 'danger' },
      loading: { label: 'Loading', class: 'info' },
      completed: { label: 'Completed', class: 'success' },
      cancelled: { label: 'Cancelled', class: 'secondary' },
    };
    const s = statusMap[status] || { label: status, class: 'secondary' };
    return <span className={`badge badge-${s.class}`}>{s.label}</span>;
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
      <div className="my-orders-container">
        <div className="container">
          <div className="page-header">
            <h1>📋 Pesanan Saya</h1>
            <button onClick={() => navigate('/stok')} className="btn btn-primary">
              + Buat Pesanan Baru
            </button>
          </div>

          <div className="filters-card">
            <div className="filter-tabs">
              <button
                className={`filter-tab ${filter === '' ? 'active' : ''}`}
                onClick={() => setFilter('')}
              >
                Semua
              </button>
              <button
                className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
                onClick={() => setFilter('pending')}
              >
                Pending
              </button>
              <button
                className={`filter-tab ${filter === 'approved' ? 'active' : ''}`}
                onClick={() => setFilter('approved')}
              >
                Approved
              </button>
              <button
                className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
                onClick={() => setFilter('completed')}
              >
                Completed
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="card text-center">
              <p>Belum ada pesanan</p>
              <button onClick={() => navigate('/stok')} className="btn btn-primary">
                Buat Pesanan
              </button>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div>
                      <h3>{order.po_number}</h3>
                      <small>{formatDate(order.created_at)}</small>
                    </div>
                    <div>{getStatusBadge(order.status)}</div>
                  </div>

                  <div className="order-body">
                    <div className="order-info-grid">
                      <div className="order-info-item">
                        <span className="label">Kebun:</span>
                        <span className="value">{order.nama_kebun}</span>
                      </div>
                      <div className="order-info-item">
                        <span className="label">Grade:</span>
                        <span className={`grade-badge grade-${order.grade_diminta}`}>
                          Grade {order.grade_diminta}
                        </span>
                      </div>
                      <div className="order-info-item">
                        <span className="label">Jumlah:</span>
                        <span className="value">{order.jumlah_kg.toLocaleString()} kg</span>
                      </div>
                      <div className="order-info-item">
                        <span className="label">Total:</span>
                        <span className="value price">{formatCurrency(order.total_harga)}</span>
                      </div>
                      <div className="order-info-item">
                        <span className="label">Pengambilan:</span>
                        <span className="value">{formatDate(order.tanggal_pengambilan)}</span>
                      </div>
                      <div className="order-info-item">
                        <span className="label">Pembayaran:</span>
                        <span className="value">{order.metode_pembayaran}</span>
                      </div>
                    </div>

                    {order.catatan && (
                      <div className="order-notes">
                        <strong>Catatan:</strong> {order.catatan}
                      </div>
                    )}
                  </div>

                  <div className="order-footer">
                    <button
                      onClick={() => navigate(`/order/${order.id}`)}
                      className="btn btn-sm btn-outline"
                    >
                      Detail
                    </button>
                    {(order.status === 'pending' || order.status === 'approved') && (
                      <button
                        onClick={() => handleCancel(order.id)}
                        className="btn btn-sm btn-danger"
                      >
                        Batalkan
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MyOrders;
