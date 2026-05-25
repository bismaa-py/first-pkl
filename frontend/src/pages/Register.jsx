import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Eye, EyeOff, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../api/axios';
import logoSmk from '../assets/logo_smk.png';

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    nama: '',
    email: '',
    password: '',
    jabatan: '',
    nip: '',
    nisn: '',
    kelas: '',
  });

  const [passwordChecks, setPasswordChecks] = useState({
    hasUpper: false,
    hasLower: false,
    hasDigit: false,
    hasLength: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError('');

    if (name === 'nisn' || name === 'nip') {
      const cleanValue = value.replace(/[^0-9]/g, '');
      if (cleanValue.length <= 10) {
        setForm(prev => ({ ...prev, [name]: cleanValue }));
      }
      return;
    }

    setForm(prev => ({ ...prev, [name]: value }));

    if (name === 'password') {
      setPasswordChecks({
        hasUpper: /[A-Z]/.test(value),
        hasLower: /[a-z]/.test(value),
        hasDigit: /[0-9]/.test(value),
        hasLength: value.length >= 6,
      });
    }
  };

  const isPasswordValid = () => {
    return passwordChecks.hasUpper && passwordChecks.hasLower && passwordChecks.hasDigit && passwordChecks.hasLength;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!isPasswordValid()) {
      setError('Kata sandi harus mengandung huruf besar, huruf kecil, dan angka (minimal 6 karakter)');
      setLoading(false);
      return;
    }

    if (!form.jabatan) {
      setError('Pilih jabatan terlebih dahulu');
      setLoading(false);
      return;
    }

    if (form.jabatan === 'guru' && !form.nip) {
      setError('NIP wajib diisi untuk guru');
      setLoading(false);
      return;
    }

    if (form.jabatan === 'siswa' && !form.nisn) {
      setError('NISN wajib diisi untuk siswa');
      setLoading(false);
      return;
    }

    try {
      await api.post('/auth/register', {
        nama: form.nama,
        email: form.email,
        password: form.password,
        jabatan: form.jabatan,
        nip: form.nip,
        nisn: form.nisn,
        kelas: form.kelas,
        role: 'peminjam',
      });
      setSuccess('Pendaftaran berhasil! Akun Anda menunggu persetujuan admin sarpras.');
      setForm({ nama: '', email: '', password: '', jabatan: '', nip: '', nisn: '', kelas: '' });
      setPasswordChecks({ hasUpper: false, hasLower: false, hasDigit: false, hasLength: false });
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-bg__circle login-bg__circle--1"></div>
        <div className="login-bg__circle login-bg__circle--2"></div>
        <div className="login-bg__circle login-bg__circle--3"></div>
      </div>

      <div className="login-card login-card--register">
        <div className="login-card__header">
          <img 
            src={logoSmk} 
            alt="Logo SMKN 2 Singosari" 
            style={{
              width: '64px',
              height: '64px',
              objectFit: 'contain',
              margin: '0 auto 16px',
              display: 'block'
            }} 
          />
          <h1 className="login-card__title">SAPRAS</h1>
          <p className="login-card__subtitle">Daftar Akun Baru</p>
        </div>

        {error && (
          <div className="login-card__error">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {success && (
          <div className="login-card__success">
            <CheckCircle size={16} />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-card__form">
          <div className="form-group">
            <label className="form-label">Nama Lengkap</label>
            <input
              type="text"
              name="nama"
              value={form.nama}
              onChange={handleChange}
              className="form-input"
              placeholder="Masukkan nama lengkap"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="form-input"
              placeholder="contoh@sekolah.id"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Kata Sandi</label>
            <div className="form-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                className="form-input"
                placeholder="Masukkan kata sandi"
                required
              />
              <button
                type="button"
                className="form-input-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {form.password && (
              <div className="password-rules">
                <span className={passwordChecks.hasUpper ? 'rule-pass' : 'rule-fail'}>
                  {passwordChecks.hasUpper ? '✓' : '✗'} Huruf besar
                </span>
                <span className={passwordChecks.hasLower ? 'rule-pass' : 'rule-fail'}>
                  {passwordChecks.hasLower ? '✓' : '✗'} Huruf kecil
                </span>
                <span className={passwordChecks.hasDigit ? 'rule-pass' : 'rule-fail'}>
                  {passwordChecks.hasDigit ? '✓' : '✗'} Angka
                </span>
                <span className={passwordChecks.hasLength ? 'rule-pass' : 'rule-fail'}>
                  {passwordChecks.hasLength ? '✓' : '✗'} Min. 6 karakter
                </span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Jabatan</label>
            <select
              name="jabatan"
              value={form.jabatan}
              onChange={handleChange}
              className="form-input form-select"
              required
            >
              <option value="">Pilih Jabatan</option>
              <option value="siswa">Siswa</option>
              <option value="guru">Guru</option>
            </select>
          </div>

          {form.jabatan === 'siswa' && (
            <div className="form-group">
              <label className="form-label">NISN</label>
              <input
                type="text"
                name="nisn"
                value={form.nisn}
                onChange={handleChange}
                className="form-input"
                placeholder="Masukkan NISN (maksimal 10 digit)"
                maxLength={10}
                inputMode="numeric"
                pattern="[0-9]*"
                required
              />
            </div>
          )}

          {form.jabatan === 'guru' && (
            <div className="form-group">
              <label className="form-label">NIP</label>
              <input
                type="text"
                name="nip"
                value={form.nip}
                onChange={handleChange}
                className="form-input"
                placeholder="Masukkan NIP (maksimal 10 digit)"
                maxLength={10}
                inputMode="numeric"
                pattern="[0-9]*"
                required
              />
            </div>
          )}

          {form.jabatan === 'siswa' && (
            <div className="form-group">
              <label className="form-label">Kelas</label>
              <input
                type="text"
                name="kelas"
                value={form.kelas}
                onChange={handleChange}
                className="form-input"
                placeholder="Contoh: XII RPL 1"
              />
            </div>
          )}

          <button
            type="submit"
            className="btn btn--primary btn--full"
            disabled={loading}
          >
            {loading ? (
              <span className="btn__loader"></span>
            ) : (
              <>
                <UserPlus size={18} />
                Daftar
              </>
            )}
          </button>
        </form>

        <p className="login-card__footer">
          Sudah punya akun? <Link to="/login" className="login-card__link">Klik masuk</Link>
        </p>
      </div>
    </div>
  );
}
