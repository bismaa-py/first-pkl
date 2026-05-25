import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  FolderOpen,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Users,
  ScrollText,
  History,
  UserCircle,
  BookOpen,
} from 'lucide-react';

import { usePopup } from '../context/PopupContext';
import logoSmk from '../assets/logo_smk.png';

const menuItems = [
  { path: '/', label: 'Dasbor', icon: LayoutDashboard },
  { path: '/barang', label: 'Daftar Barang', icon: Package },
  { path: '/peminjaman', label: 'Peminjaman', icon: ClipboardList },
  { path: '/kategori', label: 'Kategori', icon: FolderOpen },
  { path: '/panduan', label: 'Panduan Pengguna', icon: BookOpen },
];

const adminMenuItems = [
  { path: '/admin/pengguna', label: 'Pengelola Pengguna', icon: Users },
  { path: '/admin/log-aktivitas', label: 'Log Aktivitas', icon: ScrollText },
  { path: '/admin/history', label: 'Riwayat Peminjaman', icon: History },
  { path: '/profil', label: 'Profil Saya', icon: UserCircle },
];

const userMenuItems = [
  { path: '/history', label: 'Riwayat Peminjaman', icon: History },
  { path: '/profil', label: 'Profil', icon: UserCircle },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'));
  const isAdmin = user.role === 'admin';

  useEffect(() => {
    const handleUserUpdate = () => {
      setUser(JSON.parse(localStorage.getItem('user') || '{}'));
    };

    window.addEventListener('user-updated', handleUserUpdate);
    return () => {
      window.removeEventListener('user-updated', handleUserUpdate);
    };
  }, []);

  const { showConfirm } = usePopup();

  const handleLogout = async () => {
    const confirm = await showConfirm('Konfirmasi Keluar', 'Apakah Anda yakin ingin keluar dari akun Anda?');
    if (confirm) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const renderMenuItems = (items) =>
    items.map((item) => {
      const Icon = item.icon;
      const isActive = location.pathname === item.path ||
        (item.path !== '/' && location.pathname.startsWith(item.path));
      return (
        <Link
          key={item.path}
          to={item.path}
          className={`sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
          title={collapsed ? item.label : ''}
        >
          <Icon size={20} />
          {!collapsed && <span>{item.label}</span>}
          {!collapsed && isActive && <ChevronRight size={16} className="sidebar__arrow" />}
        </Link>
      );
    });

  return (
    <aside
      className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}
    >
      {/* Header */}
      <div className="sidebar__header">
        {!collapsed && (
          <div className="sidebar__brand">
            <img 
              src={logoSmk} 
              alt="Logo SMKN 2 Singosari" 
              style={{
                width: '32px',
                height: '32px',
                objectFit: 'contain',
                borderRadius: 'var(--radius-sm)'
              }} 
            />
            <div>
              <h1 className="sidebar__title">SAPRAS</h1>
              <p className="sidebar__subtitle">SMKN 2 Singosari</p>
            </div>
          </div>
        )}
        <button
          className="sidebar__toggle"
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle sidebar"
        >
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav">
        {renderMenuItems(menuItems)}

        {!isAdmin && (
          <>
            {!collapsed && <div className="sidebar__divider"><span>Lainnya</span></div>}
            {collapsed && <div className="sidebar__divider-line"></div>}
            {renderMenuItems(userMenuItems)}
          </>
        )}

        {isAdmin && (
          <>
            {!collapsed && <div className="sidebar__divider"><span>Admin</span></div>}
            {collapsed && <div className="sidebar__divider-line"></div>}
            {renderMenuItems(adminMenuItems)}
          </>
        )}
      </nav>

      {/* User Info & Logout */}
      <div className="sidebar__footer">
        {!collapsed && (
          <Link to="/profil" className="sidebar__user" title="Lihat Profil Saya" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="sidebar__avatar" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {user.foto_profil ? (
                <img
                  src={`http://localhost:8080${user.foto_profil}`}
                  alt="Avatar"
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                user.nama?.charAt(0)?.toUpperCase() || 'U'
              )}
            </div>
            <div className="sidebar__user-info">
              <p className="sidebar__user-name">{user.nama || 'Pengguna'}</p>
              <p className="sidebar__user-role">{user.role === 'admin' ? 'Admin' : (user.jabatan || 'Peminjam')}</p>
            </div>
          </Link>
        )}
        <button className="sidebar__logout" onClick={handleLogout} title="Keluar">
          <LogOut size={20} />
          {!collapsed && <span>Keluar</span>}
        </button>
      </div>
    </aside>
  );
}
