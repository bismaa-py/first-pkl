import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DaftarBarang from './pages/DaftarBarang';
import FormBarang from './pages/FormBarang';
import DaftarPeminjaman from './pages/DaftarPeminjaman';
import FormPeminjaman from './pages/FormPeminjaman';
import Kategori from './pages/Kategori';
import AdminPengguna from './pages/AdminPengguna';
import AdminLogAktivitas from './pages/AdminLogAktivitas';
import AdminHistory from './pages/AdminHistory';
import Profile from './pages/Profile';
import UserHistory from './pages/UserHistory';
import Panduan from './pages/Panduan';
import { PopupProvider } from './context/PopupContext';

function App() {
  return (
    <PopupProvider>
      <BrowserRouter>
        <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/barang" element={<DaftarBarang />} />
          <Route path="/barang/tambah" element={<FormBarang />} />
          <Route path="/barang/edit/:id" element={<FormBarang />} />
          <Route path="/peminjaman" element={<DaftarPeminjaman />} />
          <Route path="/peminjaman/tambah" element={<FormPeminjaman />} />
          <Route path="/kategori" element={<Kategori />} />
          <Route path="/admin/pengguna" element={<AdminPengguna />} />
          <Route path="/admin/log-aktivitas" element={<AdminLogAktivitas />} />
          <Route path="/admin/history" element={<AdminHistory />} />
          <Route path="/profil" element={<Profile />} />
          <Route path="/history" element={<UserHistory />} />
          <Route path="/panduan" element={<Panduan />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </BrowserRouter>
    </PopupProvider>
  );
}

export default App;
