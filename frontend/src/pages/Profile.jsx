import { useState, useEffect, useRef } from 'react';
import { User, Camera, Save, Shield, Trash2 } from 'lucide-react';
import api from '../api/axios';
import { usePopup } from '../context/PopupContext';

export default function Profile() {
  const { showAlert, showConfirm, showImage } = usePopup();
  const [user, setUser] = useState(null);
  const [nama, setNama] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/profile');
      setUser(res.data.data);
      setNama(res.data.data.nama);
    } catch (err) {
      console.error('Gagal memuat profil:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveName = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const res = await api.put('/auth/profile', { nama });
      setUser(res.data.data);
      // Update localStorage too
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      stored.nama = res.data.data.nama;
      localStorage.setItem('user', JSON.stringify(stored));
      window.dispatchEvent(new Event('user-updated'));
      setMessage('Nama berhasil diperbarui');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memperbarui nama');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('Ukuran file maksimal 2MB');
      return;
    }

    setUploading(true);
    setMessage('');
    setError('');

    const formData = new FormData();
    formData.append('foto', file);

    try {
      const res = await api.post('/auth/profile/foto', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUser(res.data.data);
      // Update localStorage
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      stored.foto_profil = res.data.data.foto_profil;
      localStorage.setItem('user', JSON.stringify(stored));
      window.dispatchEvent(new Event('user-updated'));
      setMessage('Foto profil berhasil diperbarui');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengupload foto');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async () => {
    const confirm = await showConfirm('Hapus Foto Profil', 'Apakah Anda yakin ingin menghapus foto profil Anda?');
    if (!confirm) return;

    setUploading(true);
    setMessage('');
    setError('');

    try {
      const res = await api.delete('/auth/profile/foto');
      setUser(res.data.data);
      // Update localStorage
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      stored.foto_profil = "";
      localStorage.setItem('user', JSON.stringify(stored));
      window.dispatchEvent(new Event('user-updated'));
      setMessage('Foto profil berhasil dihapus');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menghapus foto profil');
    } finally {
      setUploading(false);
    }
  };

  const getPhotoUrl = () => {
    if (user?.foto_profil) {
      return `http://localhost:8080${user.foto_profil}`;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner"></div>
        <p>Memuat profil...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1 className="page__title">Profil Saya</h1>
          <p className="page__desc">Kelola informasi profil Anda</p>
        </div>
      </div>

      {message && (
        <div className="alert alert--success">{message}</div>
      )}
      {error && (
        <div className="alert alert--error">{error}</div>
      )}

      <div className="profile-layout">
        {/* Photo Section */}
        <div className="card profile-photo-card">
          <div className="profile-photo-section">
            <div className="profile-photo-wrapper">
              {getPhotoUrl() ? (
                <img
                  src={getPhotoUrl()}
                  alt="Foto Profil"
                  className="profile-photo"
                  onClick={() => showImage(getPhotoUrl())}
                  style={{ cursor: 'pointer' }}
                  title="Klik untuk memperbesar"
                />
              ) : (
                <div className="profile-photo-placeholder">
                  {user?.nama?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
              <button
                className="profile-photo-edit"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                title="Ganti foto"
              >
                <Camera size={16} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleUploadPhoto}
                style={{ display: 'none' }}
              />
            </div>
            <h3 className="profile-name">{user?.nama}</h3>
            <p className="profile-role">
              {user?.role === 'admin' ? 'Admin Sarpras' : (user?.jabatan ? user.jabatan.charAt(0).toUpperCase() + user.jabatan.slice(1) : 'Peminjam')}
            </p>
            {user?.foto_profil && (
              <button
                onClick={handleDeletePhoto}
                className="btn btn--sm"
                style={{
                  marginTop: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: 'var(--radius-md)',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '0.8rem'
                }}
                disabled={uploading}
              >
                <Trash2 size={14} />
                Hapus Foto
              </button>
            )}
            {uploading && <p className="profile-uploading" style={{ marginTop: '8px' }}>Mengupload foto...</p>}
          </div>
        </div>

        {/* Info Section */}
        <div className="card">
          <div className="card__header">
            <h3 className="card__title">Informasi Akun</h3>
          </div>
          <div className="profile-form">
            <form onSubmit={handleSaveName}>
              <div className="form-group">
                <label className="form-label">Nama Lengkap</label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  className="form-input form-input--disabled"
                  disabled
                />
                <span className="form-hint">Email tidak dapat diubah</span>
              </div>

              <div className="profile-info-grid">
                {user?.jabatan && (
                  <div className="form-group">
                    <label className="form-label">Jabatan</label>
                    <input type="text" value={user.jabatan.charAt(0).toUpperCase() + user.jabatan.slice(1)} className="form-input form-input--disabled" disabled />
                  </div>
                )}
                {user?.nip && (
                  <div className="form-group">
                    <label className="form-label">NIP</label>
                    <input type="text" value={user.nip} className="form-input form-input--disabled" disabled />
                  </div>
                )}
                {user?.nisn && (
                  <div className="form-group">
                    <label className="form-label">NISN</label>
                    <input type="text" value={user.nisn} className="form-input form-input--disabled" disabled />
                  </div>
                )}
                {user?.kelas && (
                  <div className="form-group">
                    <label className="form-label">Kelas</label>
                    <input type="text" value={user.kelas} className="form-input form-input--disabled" disabled />
                  </div>
                )}
              </div>

              <button type="submit" className="btn btn--primary" disabled={saving}>
                {saving ? <span className="btn__loader"></span> : <><Save size={16} /> Simpan Nama</>}
              </button>
            </form>

            <div className="profile-password-note">
              <Shield size={18} />
              <div>
                <p className="profile-password-title">Ubah Kata Sandi</p>
                <p className="profile-password-desc">
                  {user?.role === 'admin'
                    ? 'Kelola kata sandi di pengelola pengguna.'
                    : 'Untuk mengubah kata sandi, silakan hubungi admin sarpras.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
