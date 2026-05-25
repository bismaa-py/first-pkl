import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Clock, Check } from 'lucide-react';
import api from '../api/axios';

const pageNames = {
  '/': 'Dasbor',
  '/barang': 'Daftar Barang',
  '/barang/tambah': 'Tambah Barang',
  '/peminjaman': 'Peminjaman',
  '/peminjaman/tambah': 'Ajukan Peminjaman',
  '/kategori': 'Kategori',
  '/admin/pengguna': 'Pengelola Pengguna',
  '/admin/log-aktivitas': 'Log Aktivitas',
  '/admin/history': 'Riwayat Peminjaman',
};

export default function Navbar() {
  const location = useLocation();
  const [time, setTime] = useState(new Date());
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotif, setShowNotif] = useState(false);

  // Get current page name
  const getPageName = () => {
    // Check exact match first
    if (pageNames[location.pathname]) return pageNames[location.pathname];
    // Check partial match for edit pages
    if (location.pathname.startsWith('/barang/edit')) return 'Ubah Barang';
    return 'SAPRAS';
  };

  // Realtime clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch notifications
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      setUnreadCount(res.data.data);
    } catch (err) {
      console.error('Gagal memuat notifikasi:', err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data || []);
    } catch (err) {
      console.error('Gagal memuat notifikasi:', err);
    }
  };

  const toggleNotif = () => {
    if (!showNotif) {
      fetchNotifications();
    }
    setShowNotif(!showNotif);
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Gagal menandai notifikasi:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Gagal menandai semua notifikasi:', err);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatNotifTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'Baru saja';
    if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
    return date.toLocaleDateString('id-ID');
  };

  const getNotifTypeClass = (type) => {
    switch (type) {
      case 'keterlambatan': return 'notif-item--warning';
      case 'info': return 'notif-item--info';
      default: return '';
    }
  };

  return (
    <div className="navbar">
      <div className="navbar__left">
      </div>

      <div className="navbar__right">
        <div className="navbar__clock">
          <Clock size={16} />
          <span>{formatTime(time)} — {formatDate(time)}</span>
        </div>

        <div className="navbar__notif-wrapper">
          <button className="navbar__notif-btn" onClick={toggleNotif} title="Notifikasi">
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="navbar__notif-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
            )}
          </button>

          {showNotif && (
            <>
              <div className="navbar__notif-overlay" onClick={() => setShowNotif(false)}></div>
              <div className="navbar__notif-dropdown">
                <div className="notif-header">
                  <h3>Notifikasi</h3>
                  {unreadCount > 0 && (
                    <button className="notif-mark-all" onClick={markAllAsRead}>
                      <Check size={14} />
                      Tandai semua dibaca
                    </button>
                  )}
                </div>
                <div className="notif-list">
                  {notifications.length === 0 ? (
                    <div className="notif-empty">
                      <Bell size={32} />
                      <p>Belum ada notifikasi</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`notif-item ${!notif.is_read ? 'notif-item--unread' : ''} ${getNotifTypeClass(notif.type)}`}
                        onClick={() => !notif.is_read && markAsRead(notif.id)}
                      >
                        <div className="notif-item__dot"></div>
                        <div className="notif-item__content">
                          <p className="notif-item__title">{notif.title}</p>
                          <p className="notif-item__message">{notif.message}</p>
                          <span className="notif-item__time">{formatNotifTime(notif.created_at)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
