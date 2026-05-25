--
-- PostgreSQL database dump
--

\restrict wA5Uf2JkP79p1qWs3KmA8znigwTdZBO5er7rLXKUMHiYEYRONmacECpw2qOzEPH

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.activity_logs (
    id bigint NOT NULL,
    user_id bigint,
    action character varying(100) NOT NULL,
    detail text,
    ip_address character varying(45),
    created_at timestamp with time zone
);


ALTER TABLE public.activity_logs OWNER TO postgres;

--
-- Name: activity_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.activity_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.activity_logs_id_seq OWNER TO postgres;

--
-- Name: activity_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.activity_logs_id_seq OWNED BY public.activity_logs.id;


--
-- Name: barangs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.barangs (
    id bigint NOT NULL,
    nama character varying(150) NOT NULL,
    kode_barang character varying(50) NOT NULL,
    kategori_id bigint,
    jumlah_total bigint DEFAULT 0,
    jumlah_tersedia bigint DEFAULT 0,
    kondisi character varying(30) DEFAULT 'Baik'::character varying,
    lokasi character varying(100),
    deskripsi text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE public.barangs OWNER TO postgres;

--
-- Name: barangs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.barangs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.barangs_id_seq OWNER TO postgres;

--
-- Name: barangs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.barangs_id_seq OWNED BY public.barangs.id;


--
-- Name: kategori_barangs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.kategori_barangs (
    id bigint NOT NULL,
    nama character varying(100) NOT NULL,
    deskripsi text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE public.kategori_barangs OWNER TO postgres;

--
-- Name: kategori_barangs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.kategori_barangs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.kategori_barangs_id_seq OWNER TO postgres;

--
-- Name: kategori_barangs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.kategori_barangs_id_seq OWNED BY public.kategori_barangs.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id bigint NOT NULL,
    user_id bigint,
    title character varying(200) NOT NULL,
    message text,
    type character varying(30) DEFAULT 'info'::character varying,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: peminjamen; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.peminjamen (
    id bigint NOT NULL,
    user_id bigint,
    barang_id bigint,
    jumlah bigint DEFAULT 1,
    tanggal_pinjam date,
    tanggal_kembali date,
    tanggal_dikembalikan date,
    status character varying(30) DEFAULT 'menunggu'::character varying,
    catatan text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE public.peminjamen OWNER TO postgres;

--
-- Name: peminjamen_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.peminjamen_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.peminjamen_id_seq OWNER TO postgres;

--
-- Name: peminjamen_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.peminjamen_id_seq OWNED BY public.peminjamen.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    nama character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(20) DEFAULT 'peminjam'::character varying,
    kelas character varying(20),
    created_at timestamp with time zone,
    jabatan character varying(20),
    n_ip character varying(30),
    nisn character varying(20),
    status character varying(20) DEFAULT 'pending'::character varying,
    foto_profil character varying(255)
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: activity_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs ALTER COLUMN id SET DEFAULT nextval('public.activity_logs_id_seq'::regclass);


--
-- Name: barangs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.barangs ALTER COLUMN id SET DEFAULT nextval('public.barangs_id_seq'::regclass);


--
-- Name: kategori_barangs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kategori_barangs ALTER COLUMN id SET DEFAULT nextval('public.kategori_barangs_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: peminjamen id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.peminjamen ALTER COLUMN id SET DEFAULT nextval('public.peminjamen_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.activity_logs (id, user_id, action, detail, ip_address, created_at) FROM stdin;
1	2	Login	Login berhasil	::1	2026-05-23 22:02:32.767413+07
2	2	Approve User	Admin menyetujui pendaftaran: aziz	::1	2026-05-23 22:03:16.160432+07
3	2	Approve User	Admin menyetujui pendaftaran: bisma	::1	2026-05-23 22:03:19.724618+07
4	1	Login	Login berhasil	::1	2026-05-23 22:04:14.816075+07
5	1	Konfirmasi Pengembalian	User mengkonfirmasi pengembalian peminjaman #1	::1	2026-05-23 22:04:30.11882+07
6	3	Login	Login berhasil	::1	2026-05-23 22:04:53.305485+07
7	3	Peminjaman	Mengajukan peminjaman: Net Voli (1 unit)	::1	2026-05-23 22:06:29.399186+07
8	2	Login	Login berhasil	::1	2026-05-23 22:06:39.21182+07
9	2	Approve Peminjaman	Menyetujui peminjaman #2	::1	2026-05-23 22:07:33.466463+07
10	2	Return Peminjaman	Admin memverifikasi pengembalian peminjaman #2	::1	2026-05-23 22:07:37.504851+07
11	2	Return Peminjaman	Admin memverifikasi pengembalian peminjaman #1	::1	2026-05-23 22:07:41.674283+07
12	1	Login	Login berhasil	::1	2026-05-23 22:07:50.464372+07
13	2	Login	Login berhasil	::1	2026-05-23 22:10:45.682122+07
14	1	Login	Login berhasil	::1	2026-05-23 22:11:51.781569+07
15	1	Login	Login berhasil	::1	2026-05-24 19:38:26.640748+07
16	1	Peminjaman	Mengajukan peminjaman: Speaker Portable JBL (1 unit)	::1	2026-05-24 19:39:15.726721+07
17	1	Login	Login berhasil	::1	2026-05-24 19:46:27.954501+07
18	2	Login	Login berhasil	::1	2026-05-24 19:47:45.226899+07
19	2	Approve Peminjaman	Menyetujui peminjaman #3	::1	2026-05-24 19:51:18.030681+07
20	1	Login	Login berhasil	::1	2026-05-24 19:51:27.657696+07
21	1	Konfirmasi Pengembalian	User mengkonfirmasi pengembalian peminjaman #3	::1	2026-05-24 19:51:46.640754+07
22	2	Login	Login berhasil	::1	2026-05-24 19:52:00.006629+07
23	2	Return Peminjaman	Admin memverifikasi pengembalian peminjaman #3	::1	2026-05-24 19:52:09.297354+07
24	1	Login	Login berhasil	::1	2026-05-24 20:02:49.099331+07
25	1	Upload Foto	Mengubah foto profil	::1	2026-05-24 20:04:56.09713+07
26	2	Login	Login berhasil	::1	2026-05-24 20:06:51.837386+07
27	1	Login	Login berhasil	::1	2026-05-24 20:08:39.540137+07
28	1	Peminjaman	Mengajukan peminjaman: Bola Sepak Mikasa (1 unit)	::1	2026-05-24 20:09:02.918178+07
29	2	Login	Login berhasil	::1	2026-05-24 20:10:21.816052+07
30	2	Login	Login berhasil	::1	2026-05-24 20:32:56.822232+07
31	3	Login	Login berhasil	::1	2026-05-24 20:33:39.409783+07
32	3	Upload Foto	Mengubah foto profil	::1	2026-05-24 20:34:01.167178+07
33	3	Peminjaman	Mengajukan peminjaman: Meja Lipat (1 unit)	::1	2026-05-24 20:34:35.952935+07
34	2	Login	Login berhasil	::1	2026-05-24 20:35:35.259213+07
35	1	Login	Login berhasil	::1	2026-05-24 20:37:01.316178+07
37	2	Login	Login berhasil	::1	2026-05-24 20:41:42.141461+07
38	2	Update User	Admin mengubah data user: aziz	::1	2026-05-24 20:41:56.685997+07
39	1	Login	Login berhasil	::1	2026-05-24 20:44:36.020499+07
40	2	Login	Login berhasil	::1	2026-05-24 20:59:02.856947+07
41	2	Reject Peminjaman	Menolak peminjaman #5	::1	2026-05-24 20:59:14.094587+07
42	2	Reject Peminjaman	Menolak peminjaman #4	::1	2026-05-24 20:59:16.724637+07
43	1	Login	Login berhasil	::1	2026-05-24 21:10:43.328672+07
44	1	Upload Foto	Mengubah foto profil	::1	2026-05-24 21:10:53.078481+07
45	1	Hapus Foto	Menghapus foto profil	::1	2026-05-24 21:10:55.10223+07
46	3	Login	Login berhasil	::1	2026-05-24 21:11:03.21773+07
47	3	Hapus Foto	Menghapus foto profil	::1	2026-05-24 21:11:07.71352+07
48	2	Login	Login berhasil	::1	2026-05-24 21:11:29.598652+07
49	2	Approve User	Admin menyetujui pendaftaran: ayung	::1	2026-05-24 21:11:38.432632+07
50	1	Login	Login berhasil	::1	2026-05-24 21:21:27.31392+07
51	1	Peminjaman	Mengajukan peminjaman: Raket Badminton Yonex (1 unit)	::1	2026-05-24 21:22:06.659804+07
52	2	Login	Login berhasil	::1	2026-05-24 21:22:29.126982+07
53	2	Login	Login berhasil	::1	2026-05-24 21:33:16.513583+07
54	2	Login	Login berhasil	::1	2026-05-24 21:51:00.485689+07
56	3	Login	Login berhasil	::1	2026-05-25 10:46:28.872717+07
57	2	Login	Login berhasil	::1	2026-05-25 10:46:54.236204+07
58	2	Reject User	Admin menolak pendaftaran: maurist	::1	2026-05-25 10:52:28.59785+07
60	2	Login	Login berhasil	::1	2026-05-25 11:00:19.643002+07
61	2	Approve User	Admin menyetujui pendaftaran: 1	::1	2026-05-25 11:00:32.398968+07
63	2	Login	Login berhasil	::1	2026-05-25 11:01:11.125987+07
64	2	Reject User	Admin menolak pendaftaran: 3	::1	2026-05-25 11:01:33.232806+07
65	2	Delete User	Admin menghapus user: 3 (c@gmail.com)	::1	2026-05-25 11:01:35.622334+07
66	2	Delete User	Admin menghapus user: 3 (c@gmail.com)	::1	2026-05-25 11:01:37.683032+07
67	2	Delete User	Admin menghapus user: 3 (c@gmail.com)	::1	2026-05-25 11:01:39.739059+07
68	2	Delete User	Admin menghapus user: 3 (c@gmail.com)	::1	2026-05-25 11:01:42.891354+07
69	2	Delete User	Admin menghapus user: 3 (c@gmail.com)	::1	2026-05-25 11:01:45.538557+07
70	2	Delete User	Admin menghapus user: 3 (c@gmail.com)	::1	2026-05-25 11:01:48.949121+07
71	2	Delete User	Admin menghapus user: 3 (c@gmail.com)	::1	2026-05-25 11:01:51.827989+07
72	2	Delete User	Admin menghapus user: 1 (b@gmail.com)	::1	2026-05-25 11:01:54.518941+07
73	2	Delete User	Admin menghapus user: 3 (c@gmail.com)	::1	2026-05-25 11:09:38.243985+07
74	2	Delete User	Admin menghapus user: 3 (c@gmail.com)	::1	2026-05-25 11:12:43.481131+07
75	2	Delete User	Admin menghapus user: 3 (c@gmail.com)	::1	2026-05-25 11:12:46.424166+07
76	2	Delete User	Admin menghapus user: 3 (c@gmail.com)	::1	2026-05-25 11:12:53.303407+07
77	2	Delete User	Admin menghapus user: maurist (maurist@gmail.com)	::1	2026-05-25 11:13:15.68997+07
79	2	Login	Login berhasil	::1	2026-05-25 11:28:05.924836+07
80	2	Delete User	Admin menghapus user: 3 (c@gmail.com)	::1	2026-05-25 11:28:11.717746+07
81	2	Reject User	Admin menolak pendaftaran: 43	::1	2026-05-25 11:33:16.092797+07
82	2	Delete User	Admin menghapus user: 43 (f@gmail.com)	::1	2026-05-25 11:33:18.366579+07
83	2	Delete User	Admin menghapus user: 3 (c@gmail.com)	::1	2026-05-25 11:33:21.177153+07
84	2	Delete User	Admin menghapus user: 1 (b@gmail.com)	::1	2026-05-25 11:33:26.153917+07
85	2	Delete User	Admin menghapus user: maurist (maurist@gmail.com)	::1	2026-05-25 11:33:28.613452+07
87	1	Login	Login berhasil	::1	2026-05-25 11:34:56.446397+07
88	1	Peminjaman	Mengajukan peminjaman: Mikroskop Binokuler (1 unit)	::1	2026-05-25 11:35:31.836399+07
89	2	Login	Login berhasil	::1	2026-05-25 11:35:42.770357+07
90	2	Approve Peminjaman	Menyetujui peminjaman #7	::1	2026-05-25 11:35:50.987586+07
91	1	Login	Login berhasil	::1	2026-05-25 11:38:32.713229+07
92	1	Peminjaman	Mengajukan peminjaman: Spidol Snowman (1 unit)	::1	2026-05-25 11:39:02.148991+07
93	2	Login	Login berhasil	::1	2026-05-25 11:39:10.49289+07
97	2	Login	Login berhasil	::1	2026-05-25 12:13:56.158538+07
98	2	Approve User	Admin menyetujui pendaftaran: Test Unique	::1	2026-05-25 12:13:56.164881+07
99	2	Delete User	Admin menghapus user: Test Unique (testunique@gmail.com)	::1	2026-05-25 12:13:56.17191+07
100	1	Login	Login berhasil	::1	2026-05-25 12:14:44.075978+07
101	2	Upload Foto	Mengubah foto profil	::1	2026-05-25 12:15:10.040288+07
102	2	Hapus Foto	Menghapus foto profil	::1	2026-05-25 12:15:11.63827+07
103	2	Login	Login berhasil	::1	2026-05-25 12:21:13.048873+07
104	2	Login	Login berhasil	::1	2026-05-25 12:21:57.336337+07
105	2	Update User	Admin mengubah data user: aziz	::1	2026-05-25 12:21:57.341167+07
106	2	Approve User	Admin menyetujui pendaftaran: maurist	::1	2026-05-25 12:23:55.204266+07
107	2	Login	Login berhasil	::1	2026-05-25 12:28:47.212079+07
108	2	Delete User	Admin menghapus user: maurist (maurist@gmail.com)	::1	2026-05-25 12:30:15.813056+07
\.


--
-- Data for Name: barangs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.barangs (id, nama, kode_barang, kategori_id, jumlah_total, jumlah_tersedia, kondisi, lokasi, deskripsi, created_at, updated_at) FROM stdin;
4	Bola Sepak Mikasa	OLR-001	2	8	8	Baik	Gudang Olahraga	Bola sepak standar	2026-05-22 19:02:51.095248+07	2026-05-22 19:02:51.095248+07
5	Raket Badminton Yonex	OLR-002	2	12	12	Baik	Gudang Olahraga	Raket badminton untuk ekskul	2026-05-22 19:02:51.095248+07	2026-05-22 19:02:51.095248+07
9	Spidol Snowman	ATK-001	5	50	50	Baik	Ruang TU	Spidol whiteboard	2026-05-22 19:02:51.095248+07	2026-05-22 19:02:51.095248+07
2	Laptop Lenovo IdeaPad	ELK-002	1	10	10	Baik	Ruang Sarpras	Laptop untuk kegiatan belajar	2026-05-22 19:02:51.095248+07	2026-05-24 21:22:42.086361+07
8	Meja Lipat	FRN-001	4	20	20	Baik	Ruang Sarpras	Meja lipat untuk acara	2026-05-22 19:02:51.095248+07	2026-05-24 21:22:55.085744+07
6	Net Voli	OLR-003	2	2	2	Baik	Gudang Olahraga	Net voli standar	2026-05-22 19:02:51.095248+07	2026-05-24 21:23:03.1611+07
3	Speaker Portable JBL	ELK-003	1	3	3	Baik	Ruang Sarpras	Speaker untuk acara sekolah	2026-05-22 19:02:51.095248+07	2026-05-24 21:23:12.758435+07
1	Proyektor Epson EB-X51	ELK-001	1	5	5	Baik	Ruang Sarpras	Proyektor untuk presentasi kelas	2026-05-22 19:02:51.095248+07	2026-05-24 21:23:19.470735+07
7	Mikroskop Binokuler	LAB-001	3	15	14	Baik	Ruang Sarpras	Mikroskop untuk praktikum	2026-05-22 19:02:51.095248+07	2026-05-25 11:35:50.979746+07
\.


--
-- Data for Name: kategori_barangs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.kategori_barangs (id, nama, deskripsi, created_at, updated_at) FROM stdin;
1	Elektronik	Peralatan elektronik seperti proyektor, laptop, speaker	2026-05-22 19:02:51.094181+07	2026-05-22 19:02:51.094181+07
2	Olahraga	Peralatan olahraga seperti bola, raket, net	2026-05-22 19:02:51.094181+07	2026-05-22 19:02:51.094181+07
3	Laboratorium	Peralatan laboratorium seperti mikroskop, tabung reaksi	2026-05-22 19:02:51.094181+07	2026-05-22 19:02:51.094181+07
4	Furniture	Perabotan seperti meja, kursi, lemari	2026-05-22 19:02:51.094181+07	2026-05-22 19:02:51.094181+07
5	ATK	Alat tulis kantor seperti spidol, penghapus, penggaris	2026-05-22 19:02:51.094181+07	2026-05-22 19:02:51.094181+07
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, title, message, type, is_read, created_at) FROM stdin;
1	3	Akun Disetujui	Selamat! Akun Anda telah disetujui oleh admin. Silakan login.	info	f	2026-05-23 22:03:16.162125+07
4	3	Peminjaman Disetujui	Peminjaman Net Voli telah disetujui.	info	f	2026-05-23 22:07:33.467527+07
5	3	Barang Dikembalikan	Pengembalian Net Voli telah diverifikasi admin.	info	f	2026-05-23 22:07:37.506569+07
2	1	Akun Disetujui	Selamat! Akun Anda telah disetujui oleh admin. Silakan login.	info	t	2026-05-23 22:03:19.725666+07
6	1	Barang Dikembalikan	Pengembalian Proyektor Epson EB-X51 telah diverifikasi admin.	info	t	2026-05-23 22:07:41.675399+07
8	2	Konfirmasi Pengembalian	bisma mengkonfirmasi pengembalian Speaker Portable JBL.	info	t	2026-05-24 19:51:46.642395+07
3	2	Konfirmasi Pengembalian	bisma mengkonfirmasi pengembalian Proyektor Epson EB-X51.	info	t	2026-05-23 22:04:30.121098+07
7	1	Peminjaman Disetujui	Peminjaman Speaker Portable JBL telah disetujui.	info	t	2026-05-24 19:51:18.034177+07
9	1	Barang Dikembalikan	Pengembalian Speaker Portable JBL telah diverifikasi admin.	info	t	2026-05-24 19:52:09.299247+07
10	2	Pendaftaran Baru	ayung (siswa) mendaftar dan menunggu persetujuan.	info	f	2026-05-24 20:41:33.625533+07
11	3	Peminjaman Ditolak	Peminjaman Meja Lipat telah ditolak.	info	f	2026-05-24 20:59:14.095843+07
12	1	Peminjaman Ditolak	Peminjaman Bola Sepak Mikasa telah ditolak.	info	t	2026-05-24 20:59:16.725169+07
14	2	Pendaftaran Baru	maurist (siswa) mendaftar dan menunggu persetujuan.	info	f	2026-05-25 10:45:12.466312+07
15	2	Pendaftaran Baru	1 (siswa) mendaftar dan menunggu persetujuan.	info	f	2026-05-25 10:59:48.112359+07
17	2	Pendaftaran Baru	3 (siswa) mendaftar dan menunggu persetujuan.	info	f	2026-05-25 11:01:05.679345+07
18	2	Pendaftaran Baru	43 (siswa) mendaftar dan menunggu persetujuan.	info	f	2026-05-25 11:13:56.979112+07
19	2	Pendaftaran Baru	maurist (siswa) mendaftar dan menunggu persetujuan.	info	f	2026-05-25 11:33:54.181313+07
20	1	Peminjaman Disetujui	Peminjaman Mikroskop Binokuler telah disetujui.	info	f	2026-05-25 11:35:50.988652+07
22	2	Pendaftaran Baru	Test Unique (siswa) mendaftar dan menunggu persetujuan.	info	f	2026-05-25 12:07:47.818299+07
23	2	Pendaftaran Baru	Test Unique (siswa) mendaftar dan menunggu persetujuan.	info	f	2026-05-25 12:13:56.110038+07
\.


--
-- Data for Name: peminjamen; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.peminjamen (id, user_id, barang_id, jumlah, tanggal_pinjam, tanggal_kembali, tanggal_dikembalikan, status, catatan, created_at, updated_at) FROM stdin;
2	3	6	1	2026-05-23	2026-05-22	2026-05-23	dikembalikan		2026-05-23 22:06:29.394294+07	2026-05-23 22:07:37.501551+07
1	1	1	5	2026-05-22	2026-05-23	2026-05-23	dikembalikan	untuk pembelajaran dikelas	2026-05-22 19:11:50.683632+07	2026-05-23 22:07:41.67089+07
3	1	3	1	2026-05-24	2026-05-24	2026-05-24	dikembalikan		2026-05-24 19:39:15.721275+07	2026-05-24 19:52:09.293933+07
5	3	8	1	2026-05-24	\N	\N	ditolak	untuk syuting\n	2026-05-24 20:34:35.949156+07	2026-05-24 20:59:14.090715+07
4	1	4	1	2026-05-24	2026-05-24	\N	ditolak		2026-05-24 20:09:02.912998+07	2026-05-24 20:59:16.718989+07
6	1	5	1	2026-05-24	2026-05-24	\N	menunggu	buat olahraga\n	2026-05-24 21:22:06.654835+07	2026-05-24 21:22:06.654835+07
7	1	7	1	2026-05-25	2026-05-25	\N	disetujui	pinjem buat praktek\n	2026-05-25 11:35:31.830796+07	2026-05-25 11:35:50.983626+07
8	1	9	1	2026-05-25	2026-05-25	\N	menunggu	butuh untuk pembelajaran	2026-05-25 11:39:02.141707+07	2026-05-25 11:39:02.141707+07
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, nama, email, password, role, kelas, created_at, jabatan, n_ip, nisn, status, foto_profil) FROM stdin;
1	bisma	bisma@gmail.com	$2a$10$1R2Z46reaq.S7P52cF2K7eC0rz8brafKJ9i5WoMEZLdXd0ZH20xC6	peminjam	XI RPL 1	2026-05-22 19:05:56.934954+07	siswa		1234567890	active	
2	Admin SAPRAS	admin@sekolah.id	$2a$10$YnZjW.Js8rYIhq1zESsBG.pcLJpG9OY5iekZNhi5nAcmI/LapADXy	admin		2026-05-22 19:15:09.144629+07				active	
3	aziz	aziz@gmail.com	$2a$10$jn0.aVrCfQvEJWtIJJs2ie22Z6/OxANw8mYg0UfDKgq6yOlmqNSYO	peminjam	XI RPL 2	2026-05-23 19:37:22.009464+07	siswa		1111111111	active	
\.


--
-- Name: activity_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.activity_logs_id_seq', 108, true);


--
-- Name: barangs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.barangs_id_seq', 10, true);


--
-- Name: kategori_barangs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.kategori_barangs_id_seq', 11, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 25, true);


--
-- Name: peminjamen_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.peminjamen_id_seq', 9, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 14, true);


--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- Name: barangs barangs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.barangs
    ADD CONSTRAINT barangs_pkey PRIMARY KEY (id);


--
-- Name: kategori_barangs kategori_barangs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kategori_barangs
    ADD CONSTRAINT kategori_barangs_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: peminjamen peminjamen_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.peminjamen
    ADD CONSTRAINT peminjamen_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_barangs_kode_barang; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_barangs_kode_barang ON public.barangs USING btree (kode_barang);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: activity_logs fk_activity_logs_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT fk_activity_logs_user FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: barangs fk_barangs_kategori; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.barangs
    ADD CONSTRAINT fk_barangs_kategori FOREIGN KEY (kategori_id) REFERENCES public.kategori_barangs(id);


--
-- Name: notifications fk_notifications_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: peminjamen fk_peminjamen_barang; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.peminjamen
    ADD CONSTRAINT fk_peminjamen_barang FOREIGN KEY (barang_id) REFERENCES public.barangs(id);


--
-- Name: peminjamen fk_peminjamen_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.peminjamen
    ADD CONSTRAINT fk_peminjamen_user FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict wA5Uf2JkP79p1qWs3KmA8znigwTdZBO5er7rLXKUMHiYEYRONmacECpw2qOzEPH

