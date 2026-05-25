import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Eye, EyeOff, LogIn } from 'lucide-react';
import api from '../api/axios';
import logoSmk from '../assets/logo_smk.png';

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', {
        email: form.email,
        password: form.password,
      });
      localStorage.setItem('token', res.data.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.data.user));
      navigate('/');
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

      <div className="login-card">
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
          <p className="login-card__subtitle">Sistem Peminjaman Barang Sekolah</p>
        </div>

        {error && (
          <div className="login-card__error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-card__form">
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
          </div>

          <button
            type="submit"
            className="btn btn--primary btn--full"
            disabled={loading}
          >
            {loading ? (
              <span className="btn__loader"></span>
            ) : (
              <>
                <LogIn size={18} />
                Masuk
              </>
            )}
          </button>
        </form>

        <p className="login-card__footer">
          Belum punya akun? <Link to="/register" className="login-card__link">Klik daftar</Link>
        </p>
      </div>
    </div>
  );
}
