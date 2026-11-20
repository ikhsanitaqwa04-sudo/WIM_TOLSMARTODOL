# Menyiapkan Login TOLSMART-ODOL

Login menggunakan Supabase Auth (email + password), dengan peran admin, operator, dan observer.

## A. Buat proyek Supabase
1. Buat proyek di https://supabase.com/.
2. Buka Project Settings > API.
3. Salin Project URL dan anon/publishable key.
4. Edit `assets/supabase-config.js`; isi dua nilai tersebut. Jangan pernah memasukkan service_role/secret key ke frontend atau repository.

## B. Buat tabel dan kebijakan akses
1. Buka SQL Editor pada proyek Supabase.
2. Jalankan seluruh isi `supabase/schema.sql`.
3. Daftarkan akun email pemilik proyek melalui halaman `login.html`.
4. Konfirmasi email jika konfirmasi email diaktifkan.
5. Pada SQL Editor, jalankan query bootstrap admin dengan mengganti email:
   `update public.profiles set role='admin', approval_status='approved' where email='EMAIL_ADMIN_KAMU';`
6. Login ulang. Admin dapat menyetujui akun baru dengan mengubah role dan approval_status melalui SQL Editor.

## C. Peran
- admin: administrator yang menyetujui dan mengelola akun.
- operator: petugas/operator operasional.
- observer: pengamat baca-saja.
Pendaftaran mandiri selalu menghasilkan observer berstatus pending. Tidak ada pilihan role dari form pendaftaran, agar pengguna tidak bisa menaikkan hak aksesnya sendiri.

## D. Publikasi
Pastikan GitHub Pages menerbitkan branch main dari root repository. Buka `/login.html` untuk mengakses halaman login.

Catatan: file dashboard HTML statis tidak dapat menjadi batas keamanan server-side untuk semua data. Untuk produksi, data operasional harus dipindahkan ke tabel/API Supabase dan dilindungi dengan Row Level Security. Jangan memasukkan data CCTV, password, atau kredensial kamera ke frontend.
