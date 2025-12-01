import React, { useEffect, useState } from 'react';
import { poAPI } from '../services/api';
import Navbar from '../components/Navbar';
import './MyOrders.css';

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadOrders();
  }, [filter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await poAPI.getList(params);
      
      // Deduplicate orders by ID to prevent duplicate key warning
      const uniqueOrders = [];
      const seenIds = new Set();
      const duplicates = [];
      
      (response.data || []).forEach(order => {
        if (!seenIds.has(order.id)) {
          seenIds.add(order.id);
          uniqueOrders.push(order);
        } else {
          duplicates.push(order.id);
        }
      });
      
      if (duplicates.length > 0) {
        console.warn('Removed duplicate orders with IDs:', duplicates);
      }
      console.log('Total orders:', response.data?.length, '| Unique orders:', uniqueOrders.length);
      
      setOrders(uniqueOrders);
    } catch (error) {
      console.error('Failed to load orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (poId, newStatus) => {
    if (!confirm(`Apakah Anda yakin ingin mengubah status ke ${newStatus}?`)) {
      return;
    }

    try {
      await poAPI.updateStatus(poId, { status: newStatus });
      alert('Status berhasil diupdate');
      loadOrders();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Gagal mengupdate status');
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
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: 'Pending', class: 'badge-warning' },
      approved: { label: 'Approved', class: 'badge-success' },
      rejected: { label: 'Rejected', class: 'badge-danger' },
      loading: { label: 'Loading', class: 'badge-info' },
      completed: { label: 'Completed', class: 'badge-primary' },
      cancelled: { label: 'Cancelled', class: 'badge-secondary' },
    };
    const s = statusMap[status] || { label: status, class: 'badge-secondary' };
    return <span className={`badge ${s.class}`}>{s.label}</span>;
  };

  return (
    <>
      <Navbar />
      <div className="orders-container">
        <div className="container">
          <div className="page-header">
            <h1>📋 Kelola Purchase Orders</h1>
            <p>Kelola semua purchase orders dari pembeli</p>
          </div>

          <div className="filters-card">
            <div className="filter-buttons">
              <button
                className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilter('all')}
              >
                Semua
              </button>
              <button
                className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilter('pending')}
              >
                Pending
              </button>
              <button
                className={`btn ${filter === 'approved' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilter('approved')}
              >
                Approved
              </button>
              <button
                className={`btn ${filter === 'completed' ? 'btn-primary' : 'btn-outline'}`}
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
              <p>Tidak ada pesanan</p>
            </div>
          ) : (
            <div className="orders-grid">
              {orders.map((order) => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div>
                      <h3>{order.po_number}</h3>
                      <small>dari {order.buyer_company}</small>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className="order-info">
                    <div className="info-row">
                      <span className="info-label">🌴 Kebun:</span>
                      <span className="info-value">{order.nama_kebun}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">⚖️ Jumlah:</span>
                      <span className="info-value">{order.jumlah_kg.toLocaleString()} kg</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">⭐ Grade:</span>
                      <span className="info-value">Grade {order.grade_diminta}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">💰 Total:</span>
                      <span className="info-value">{formatCurrency(order.total_harga)}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">📅 Tanggal Ambil:</span>
                      <span className="info-value">{formatDate(order.tanggal_pengambilan)}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">💳 Pembayaran:</span>
                      <span className="info-value">{order.metode_pembayaran}</span>
                    </div>
                  </div>

                  {order.catatan && (
                    <div className="order-notes">
                      <small>📝 {order.catatan}</small>
                    </div>
                  )}

                  {order.status === 'pending' && (
                    <div className="order-actions">
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleUpdateStatus(order.id, 'approved')}
                      >
                        ✓ Approve
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleUpdateStatus(order.id, 'rejected')}
                      >
                        ✗ Reject
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

export default ManageOrders;
