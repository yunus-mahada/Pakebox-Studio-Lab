export type LogicTabKey =
  | 'logika-model'
  | 'logika-mesin'
  | 'logika-proses'
  | 'logika-harga'
  | 'logika-ongkir';

export interface LogicRuleItem {
  id: string;
  namaAturan: string;
  kondisiTrigger: string;
  rumusTindakan: string;
  keterangan: string;
  aksi: string;
}

export interface MarginMultiplierRow {
  marginPct: number;
  marginLabel: string;
  pengali: number;
  rumusHargaJual: string;
}

export interface MarginQtyTierRow {
  id: string;
  rentangQty: string;
  ketentuanMargin: string;
  pengaliRange: string;
  keterangan: string;
}

export const MARGIN_MULTIPLIER_TABLE: MarginMultiplierRow[] = [
  { marginPct: 5, marginLabel: '5%', pengali: 1.05, rumusHargaJual: 'Modal x 1.05' },
  { marginPct: 10, marginLabel: '10%', pengali: 1.11, rumusHargaJual: 'Modal x 1.11' },
  { marginPct: 15, marginLabel: '15%', pengali: 1.18, rumusHargaJual: 'Modal x 1.18' },
  { marginPct: 20, marginLabel: '20%', pengali: 1.25, rumusHargaJual: 'Modal x 1.25' },
  { marginPct: 25, marginLabel: '25%', pengali: 1.33, rumusHargaJual: 'Modal x 1.33' },
  { marginPct: 30, marginLabel: '30%', pengali: 1.43, rumusHargaJual: 'Modal x 1.43' },
  { marginPct: 35, marginLabel: '35%', pengali: 1.54, rumusHargaJual: 'Modal x 1.54' },
  { marginPct: 40, marginLabel: '40%', pengali: 1.67, rumusHargaJual: 'Modal x 1.67' },
  { marginPct: 45, marginLabel: '45%', pengali: 1.82, rumusHargaJual: 'Modal x 1.82' },
  { marginPct: 50, marginLabel: '50%', pengali: 2.0, rumusHargaJual: 'Modal x 2.00' },
];

export const MARGIN_QTY_TIERS: MarginQtyTierRow[] = [
  {
    id: 'mqt-1',
    rentangQty: 'Qty < 12 pcs',
    ketentuanMargin: '45%',
    pengaliRange: '1.82',
    keterangan: 'Margin tetap 45% (Harga Jual = Modal x 1.82)',
  },
  {
    id: 'mqt-2',
    rentangQty: 'Qty 12-49 pcs',
    ketentuanMargin: 'Interpolasi 45% ➔ 40%',
    pengaliRange: '1.82 ➔ 1.67',
    keterangan: 'Interpolasi margin bertahap dari 45% ke 40%',
  },
  {
    id: 'mqt-3',
    rentangQty: 'Qty 50-100 pcs',
    ketentuanMargin: 'Interpolasi 37% ➔ 35%',
    pengaliRange: '1.59 ➔ 1.54',
    keterangan: 'Interpolasi margin bertahap dari 37% ke 35%',
  },
  {
    id: 'mqt-4',
    rentangQty: 'Qty 101-300 pcs',
    ketentuanMargin: 'Interpolasi 35% ➔ 32%',
    pengaliRange: '1.54 ➔ 1.47',
    keterangan: 'Interpolasi margin bertahap dari 35% ke 32%',
  },
  {
    id: 'mqt-5',
    rentangQty: 'Qty > 300 pcs',
    ketentuanMargin: 'Interpolasi 32% ➔ 30%',
    pengaliRange: '1.47 ➔ 1.43',
    keterangan: 'Interpolasi margin dari 32% menuju 30%',
  },
];

export const INITIAL_LOGIKA_MODEL_DATA: LogicRuleItem[] = [
  {
    id: 'lm-1',
    namaAturan: 'Tinggi Tutup (Tt) Otomatis – Buka Tutup',
    kondisiTrigger: 'Model Box = Buka Tutup AND T < 5 cm',
    rumusTindakan: 'Tt = 2 cm',
    keterangan:
      'Tinggi tutup otomatis untuk model Buka Tutup dengan tinggi box di bawah 5 cm',
    aksi: 'Set Tt = 2 cm',
  },
  {
    id: 'lm-2',
    namaAturan: 'Tinggi Tutup (Tt) Otomatis – Buka Tutup',
    kondisiTrigger: 'Model Box = Buka Tutup AND 5 ≤ T < 10 cm',
    rumusTindakan: 'Tt = 2,5 cm',
    keterangan:
      'Tinggi tutup otomatis untuk model Buka Tutup dengan tinggi box 5–9,9 cm',
    aksi: 'Set Tt = 2,5 cm',
  },
  {
    id: 'lm-3',
    namaAturan: 'Tinggi Tutup (Tt) Otomatis – Buka Tutup',
    kondisiTrigger: 'Model Box = Buka Tutup AND T ≥ 10 cm',
    rumusTindakan: 'Tt = 3 cm',
    keterangan:
      'Tinggi tutup otomatis untuk model Buka Tutup dengan tinggi box minimal 10 cm',
    aksi: 'Set Tt = 3 cm',
  },
  {
    id: 'lm-4',
    namaAturan: 'Sambungan 3 – Model Buka Tutup',
    kondisiTrigger: 'Model = Buka Tutup (Terpisah / Full) AND bentangan lapisan luar tidak muat utuh di mesin',
    rumusTindakan:
      'Lapisan Luar Tutup: [P+0.6] | [L+0.6+0.6+T+T+4] & [T+4] | [L+4] (×2) | ' +
      'Lapisan Luar Body: [P] | [L+T+T+4] & [T+4] | [L+4] (×2)',
    keterangan:
      'Pemecahan layout 3 bagian (Sambungan 3) untuk box buka tutup pisah. Digunakan ketika bentangan lapisan luar tidak muat dalam 1 lembar utuh di mesin yang dipilih. Ketentuan: Jika pada mesin (Digital, Offset 52, atau Offset 58) muat utuh, maka rekomendasi sambungan 3 dan 5 tidak aktif. Sambungan 3 aktif jika mesin tidak bisa mencetak utuh (pada Digital, opsi utuh tidak ditampilkan).',
    aksi: 'Hitung biaya per potongan × qty, bandingkan dengan metode Utuh/Sambungan 5',
  },
  {
    id: 'lm-5',
    namaAturan: 'Sambungan 5 – Model Buka Tutup (Fallback)',
    kondisiTrigger: 'Model = Buka Tutup AND Sambungan 3 tidak muat di mesin',
    rumusTindakan:
      'Lapisan Tutup Luar: [P+0.6] | [L+0.6] & [T+4] | [L+4] (×2) & [T+4] | [P+4] (×2) | ' +
      'Lapisan Body Luar: [P] | [L] & [T+4] | [L+4] (×2) & [T+4] | [P+4] (×2)',
    keterangan:
      'Pemecahan layout 5 bagian (Sambungan 5) untuk box buka tutup pisah. Digunakan sebagai fallback ketika Sambungan 3 tidak muat di Digital/Offset. Ketentuan: Pada box ukuran besar dan qty sedikit (mis. 40 x 30 x 12 qty 50), Sambungan 5 di Digital menjadi opsi yang sangat ekonomis dan tetap ditampilkan bersama Offset 52/58.',
    aksi: 'Hitung biaya per potongan × qty, bandingkan dengan Sambungan 3 dan Utuh',
  },
  {
    id: 'lm-6',
    namaAturan: 'Rumus Sambungan Khusus (Magnet Model)',
    kondisiTrigger:
      'Model Box = Box Magnet (Model Buku) AND bentangan lapisan tidak muat di Plano / Mesin',
    rumusTindakan:
      'Lapisan Luar Tutup:\n' +
      '- Total P. Board Tutup + 4cm | ((L. Board Tutup + 4cm)/2)+1.5\n' +
      '- Total P. Board Tutup + 4cm | ((L. Board Tutup + 4cm)/2)+1\n\n' +
      'Lapisan Dalam tutup:\n' +
      '- P + 1 | L + (T/2) + 1 + 0.5\n' +
      '- P + 1 | L + T + 1\n\n' +
      'Lapisan Luar body:\n' +
      '- P + L + 4 | T + 4\n' +
      '- P + L | T + 4\n\n' +
      'Lapisan Dalam body:\n' +
      '- P | L + (Tx2)\n' +
      '- L x 2 | T x 2',
    keterangan:
      'Pemecahan layout dua bagian pada box magnet jika lapisan tidak muat di Plano / Mesin. Membagi dimensi spesifik jika terjadi Splicing (Sambung 2) pada box magnet. Rumus ini di gunakan ketika sambung 2 masih tidak muat ke bentangan digital/offset.',
    aksi:
      'Pecah layout komponen cover tutup dan body box magnet menjadi 2 potongan spesifik (Sambung 2)',
  },
];

export const INITIAL_LOGIKA_MESIN_DATA: LogicRuleItem[] = [
  {
    id: 'lme-1',
    namaAturan: 'Pemilihan Proses Cetak – AP 150 gr',
    kondisiTrigger: 'Bahan = AP 150 gr',
    rumusTindakan: 'Cek Digital dan Offset',
    keterangan: 'AP 150 gr dapat diproses melalui Digital maupun Offset. Sistem akan membandingkan kedua opsi dan memilih yang termurah.',
    aksi: 'Ambil data mesin yang tersedia',
  },
  {
    id: 'lme-2',
    namaAturan: 'Validasi Digital',
    kondisiTrigger: 'Bahan = AP 150 gr AND bentangan ≤ ukuran maksimal Digital A3+',
    rumusTindakan: 'Digital = Valid',
    keterangan:
      'Jika bentangan masih masuk area cetak Digital, Digital menjadi opsi cetak',
    aksi: 'Masukkan Digital sebagai kandidat',
  },
  {
    id: 'lme-3',
    namaAturan: 'Fallback ke Offset (AP 150 terlalu besar)',
    kondisiTrigger: 'Bahan = AP 150 gr AND bentangan > ukuran maksimal Digital',
    rumusTindakan: 'Digital = Tidak Valid → Cek Offset',
    keterangan: 'Jika tidak masuk Digital, sistem naik ke mesin Offset',
    aksi: 'Cek Mesin 52 dan 58',
  },
  {
    id: 'lme-7',
    namaAturan: 'Bahan Selain AP 150 gr → Langsung ke Offset',
    kondisiTrigger: 'Bahan ≠ AP 150 gr (mis. RCP, Jasmine, Concorde, Linen, dll)',
    rumusTindakan: 'Digital = Tidak Tersedia → Langsung ke Offset',
    keterangan:
      'Bahan selain AP 150 gr tidak bisa diproses via mesin Digital A3+. Sistem langsung menghitung via Offset menggunakan ukuran plano asli bahan (mis. RCP → plano 109 x 79 cm), karena ukurannya muat lebih banyak dan lebih efisien.',
    aksi: 'Skip Digital → Langsung Cek Mesin Offset',
  },
  {
    id: 'lme-8',
    namaAturan: 'Ukuran Plano Bahan Non-AP150 → Gunakan Ukuran Asli',
    kondisiTrigger: 'Bahan ≠ AP 150 gr AND proses = Offset',
    rumusTindakan: 'Plano = Ukuran asli bahan (mis. 109 x 79, bukan 32 x 48)',
    keterangan:
      'Untuk bahan lapisan luar selain AP 150, ukuran plano yang digunakan adalah ukuran asli dari database bahan (mis. RCP 109 x 79 cm), bukan ukuran digital. Satu plano bisa muat lebih banyak pcs sehingga lebih efisien biaya kertas.',
    aksi: 'Hitung fit berdasarkan ukuran plano asli bahan',
  },
  {
    id: 'lme-4',
    namaAturan: 'Validasi Mesin Offset 52',
    kondisiTrigger: 'Bentangan ≤ area cetak Mesin 52',
    rumusTindakan: 'Mesin 52 = Valid',
    keterangan: 'Mesin 52 dapat digunakan',
    aksi: 'Hitung Page & biaya',
  },
  {
    id: 'lme-5',
    namaAturan: 'Validasi Mesin Offset 58',
    kondisiTrigger: 'Bentangan ≤ area cetak Mesin 58',
    rumusTindakan: 'Mesin 58 = Valid',
    keterangan: 'Mesin 58 dapat digunakan',
    aksi: 'Hitung Page & biaya',
  },
  {
    id: 'lme-6',
    namaAturan: 'Pemilihan Mesin',
    kondisiTrigger: 'Terdapat ≥ 2 mesin valid',
    rumusTindakan: 'Bandingkan total biaya',
    keterangan: 'Sistem memilih opsi mesin cetak (Digital vs Offset) dengan total biaya termurah',
    aksi: 'Pilih mesin rekomendasi',
  },
  {
    id: 'lme-9',
    namaAturan: 'Rekomendasi Mesin – Hardbox Ukuran Besar & Qty Sedikit',
    kondisiTrigger: 'Model Buka Tutup AND Ukuran Besar AND Qty Sedikit (mis. Qty ≤ 300 / contoh 40 x 30 x 12 Qty 50)',
    rumusTindakan: 'Tampilkan Digital (Sambungan 3 / 5) dan Offset (Mesin 52 / Mesin 58) → Rekomendasikan yang Termurah',
    keterangan: 'Untuk hardbox ukuran besar dengan kuantitas sedikit (contoh 40 x 30 x 12 cm qty 50), mesin Digital (Sambungan 5) menjadi alternatif yang sangat ekonomis karena tidak terkena biaya plat cetak per page. Sistem menampilkan perbandingan Digital & Offset 52/58, merekomendasikan opsi termurah, dan user dapat bebas memilih/mengeklik mesin yang diinginkan.',
    aksi: 'Tampilkan opsi Digital & Offset, prioritaskan biaya termurah, dan izinkan user memilih opsi mesin',
  },
];

export const INITIAL_LOGIKA_PROSES_DATA: LogicRuleItem[] = [
  {
    id: 'lp-1',
    namaAturan: 'Kondisi Laminasi Aktif',
    kondisiTrigger: 'Lapisan = Art Paper 150 gr (AP 150 gr) OR AC 260 gr',
    rumusTindakan: 'Laminasi = Aktif (Selain itu Laminasi = Tidak Aktif)',
    keterangan:
      'Perhitungan dan tampilan harga laminasi hanya aktif jika lapisan yang dipilih menggunakan Art Paper 150 gr atau AC 260 gr',
    aksi: 'Aktifkan / Sembunyikan Laminasi',
  },
  {
    id: 'lp-2',
    namaAturan: 'Prioritas Laminasi – Digital Terlebih Dahulu',
    kondisiTrigger: 'Laminasi = Aktif AND Ukuran Potong ≤ Area Laminasi Digital (32 x 48 cm)',
    rumusTindakan: 'Cek Laminasi Digital; jika ukuran tidak memenuhi → Gunakan Laminasi Offset',
    keterangan:
      'Gunakan laminasi digital terlebih dahulu jika ukuran memenuhi syarat. Jika tidak memenuhi, gunakan laminasi offset.',
    aksi: 'Prioritaskan Laminasi Digital',
  },
  {
    id: 'lp-3',
    namaAturan: 'Batas Harga Laminasi Digital (≤ Rp 130.000)',
    kondisiTrigger: 'Ukuran Memenuhi Syarat Digital AND Biaya Laminasi Digital ≤ Rp 130.000',
    rumusTindakan: 'Gunakan Harga Laminasi Digital',
    keterangan:
      'Jika biaya laminasi digital Rp 130.000 atau kurang dan ukuran memenuhi syarat, gunakan harga digital.',
    aksi: 'Pakai Laminasi Digital',
  },
  {
    id: 'lp-4',
    namaAturan: 'Batas Harga Laminasi Digital (> Rp 130.000)',
    kondisiTrigger: 'Biaya Laminasi Digital > Rp 130.000 OR Ukuran Tidak Memenuhi Syarat Digital',
    rumusTindakan: 'Rekomendasikan Laminasi Offset',
    keterangan:
      'Jika biaya laminasi digital lebih dari Rp 130.000, rekomendasikan laminasi offset.',
    aksi: 'Pakai Laminasi Offset',
  },
  {
    id: 'lp-5',
    namaAturan: 'Tampilan Estimasi Biaya Laminasi',
    kondisiTrigger: 'Lapisan ≠ Art Paper 150 gr AND Lapisan ≠ AC 260 gr',
    rumusTindakan: 'Sembunyikan Rincian Biaya Laminasi',
    keterangan:
      'Hilangkan rincian biaya laminasi jika tidak diperlukan. Tampilkan harga laminasi hanya jika menggunakan Art Paper 150 gr, AC 260 gr.',
    aksi: 'Sembunyikan Baris Laminasi',
  },
  {
    id: 'lp-6',
    namaAturan: 'Proses Logo – Pilihan Std vs Custom',
    kondisiTrigger: 'Pilih Logo (Foil / Embos / Logo Lainnya) → Pilih Tipe Std atau Custom',
    rumusTindakan: 'Std = Harga Minimal + Rp 50.000 | Custom = Rumus Logo ((P x L x Harga) + 50.000)',
    keterangan:
      'Logo Std menggunakan Harga Minimal + Rp 50.000; Logo Custom menggunakan Rumus Logo sesuai ukuran P x L custom.',
    aksi: 'Hitung Biaya Logo',
  },
  {
    id: 'lp-7',
    namaAturan: 'Analisis Pisau Pond (+1 cm) & Biaya Pisau',
    kondisiTrigger: 'Qty ≥ 100 pcs (Aktif) | Qty < 100 pcs (Tidak Aktif)',
    rumusTindakan: 'Jika Qty ≥ 100 pcs → Board +1 cm & Hitung Pisau Pond; Jika < 100 pcs → Tanpa +1 cm',
    keterangan:
      'Aktif jika qty yang dipesan 100 pcs ke atas; jika di bawah 100 pcs tidak aktif sehingga tidak perlu tambah 1 cm.',
    aksi: 'Aktifkan / Nonaktifkan Pond',
  },
  {
    id: 'lp-8',
    namaAturan: 'Biaya Pisau Innerbox',
    kondisiTrigger: 'User memilih Tambah Inner (Aktif) | Tidak memilih Tambah Inner (Tidak Aktif)',
    rumusTindakan: '((P x 4) + (L x 4)) x 450',
    keterangan:
      'Perhitungan biaya pisau innerbox berdasarkan ukuran dasar box (P x L). Jika user memilih tambah inner maka ketentuan ini aktif, jika tidak memilih maka tidak aktif.',
    aksi: 'Aktifkan / Hitung Pisau Innerbox',
  },
  {
    id: 'lp-9',
    namaAturan: 'Penentuan Biaya Finishing (Jasa Rakit Dinamis)',
    kondisiTrigger: 'Perhitungan Jasa Rakit Model Box',
    rumusTindakan:
      'Volume ≤ 675 cm³ (15x15x3) ➔ Harga Terendah; Volume ≥ 12.000 cm³ (40x30x10) ➔ Harga Maksimal (Mentok); ' +
      'Rentang 675–12.000 cm³ ➔ Min + [((Vol - 675)/(12.000 - 675)) x (Max - Min)]',
    keterangan:
      'Patokan volume min 15 x 15 x 3 cm (675 cm³) dikenakan harga terendah (jika ukuran di bawah itu tetap terhitung biaya terendah). Patokan volume max 40 x 30 x 10 cm (12.000 cm³) dikenakan harga maksimal tertinggi (jika ukuran di atas ini tarif mentok di harga maksimal). Ukuran di antara rentang tersebut dihitung proporsional berbasis rasio volume.',
    aksi: 'Hitung Jasa Rakit Proporsional Berbasis Rentang Volume',
  },
];

export const INITIAL_LOGIKA_HARGA_DATA: LogicRuleItem[] = [
  // Ketentuan Logika Margin Berdasarkan Qty
  {
    id: 'lh-qty-1',
    namaAturan: 'Logika Margin – Qty < 12 pcs',
    kondisiTrigger: 'Qty < 12 pcs',
    rumusTindakan: 'Margin = 45% (Modal x 1.82)',
    keterangan: 'Pesanan di bawah 12 pcs menggunakan margin 45% (Pengali 1.82)',
    aksi: 'Ambil 45% (x 1.82)',
  },
  {
    id: 'lh-qty-2',
    namaAturan: 'Logika Margin – Qty 12-49 pcs',
    kondisiTrigger: '12 ≤ Qty ≤ 49 pcs',
    rumusTindakan: 'Interpolasi 45% ➔ 40%',
    keterangan: 'Interpolasi persentase margin dari 45% (Pengali 1.82) ke 40% (Pengali 1.67)',
    aksi: 'Interpolasi 45% ➔ 40%',
  },
  {
    id: 'lh-qty-3',
    namaAturan: 'Logika Margin – Qty 50-100 pcs',
    kondisiTrigger: '50 ≤ Qty ≤ 100 pcs',
    rumusTindakan: 'Interpolasi 37% ➔ 35%',
    keterangan: 'Interpolasi persentase margin dari 37% (Pengali 1.59) ke 35% (Pengali 1.54)',
    aksi: 'Interpolasi 37% ➔ 35%',
  },
  {
    id: 'lh-qty-4',
    namaAturan: 'Logika Margin – Qty 101-300 pcs',
    kondisiTrigger: '101 ≤ Qty ≤ 300 pcs',
    rumusTindakan: 'Interpolasi 35% ➔ 32%',
    keterangan: 'Interpolasi persentase margin dari 35% (Pengali 1.54) ke 32% (Pengali 1.47)',
    aksi: 'Interpolasi 35% ➔ 32%',
  },
  {
    id: 'lh-qty-5',
    namaAturan: 'Logika Margin – Qty > 300 pcs',
    kondisiTrigger: 'Qty > 300 pcs',
    rumusTindakan: 'Interpolasi 32% ➔ 30%',
    keterangan: 'Interpolasi persentase margin dari 32% (Pengali 1.47) menuju 30% (Pengali 1.43)',
    aksi: 'Interpolasi 32% ➔ 30%',
  },
  // Tabel Persentase Margin (%) & Pengali Harga Jual
  {
    id: 'lh-m-5',
    namaAturan: 'Tabel Pengali – Margin 5%',
    kondisiTrigger: 'Margin = 5%',
    rumusTindakan: 'Pengali = 1.05 (Modal x 1.05)',
    keterangan: 'Mencari harga jual dengan margin 5%: Modal x 1.05',
    aksi: 'Kalikan 1.05',
  },
  {
    id: 'lh-m-10',
    namaAturan: 'Tabel Pengali – Margin 10%',
    kondisiTrigger: 'Margin = 10%',
    rumusTindakan: 'Pengali = 1.11 (Modal x 1.11)',
    keterangan: 'Mencari harga jual dengan margin 10%: Modal x 1.11',
    aksi: 'Kalikan 1.11',
  },
  {
    id: 'lh-m-15',
    namaAturan: 'Tabel Pengali – Margin 15%',
    kondisiTrigger: 'Margin = 15%',
    rumusTindakan: 'Pengali = 1.18 (Modal x 1.18)',
    keterangan: 'Mencari harga jual dengan margin 15%: Modal x 1.18',
    aksi: 'Kalikan 1.18',
  },
  {
    id: 'lh-m-20',
    namaAturan: 'Tabel Pengali – Margin 20%',
    kondisiTrigger: 'Margin = 20%',
    rumusTindakan: 'Pengali = 1.25 (Modal x 1.25)',
    keterangan: 'Mencari harga jual dengan margin 20%: Modal x 1.25',
    aksi: 'Kalikan 1.25',
  },
  {
    id: 'lh-m-25',
    namaAturan: 'Tabel Pengali – Margin 25%',
    kondisiTrigger: 'Margin = 25%',
    rumusTindakan: 'Pengali = 1.33 (Modal x 1.33)',
    keterangan: 'Mencari harga jual dengan margin 25%: Modal x 1.33',
    aksi: 'Kalikan 1.33',
  },
  {
    id: 'lh-m-30',
    namaAturan: 'Tabel Pengali – Margin 30%',
    kondisiTrigger: 'Margin = 30%',
    rumusTindakan: 'Pengali = 1.43 (Modal x 1.43)',
    keterangan: 'Mencari harga jual dengan margin 30%: Modal x 1.43',
    aksi: 'Kalikan 1.43',
  },
  {
    id: 'lh-m-35',
    namaAturan: 'Tabel Pengali – Margin 35%',
    kondisiTrigger: 'Margin = 35%',
    rumusTindakan: 'Pengali = 1.54 (Modal x 1.54)',
    keterangan: 'Mencari harga jual dengan margin 35%: Modal x 1.54',
    aksi: 'Kalikan 1.54',
  },
  {
    id: 'lh-m-40',
    namaAturan: 'Tabel Pengali – Margin 40%',
    kondisiTrigger: 'Margin = 40%',
    rumusTindakan: 'Pengali = 1.67 (Modal x 1.67)',
    keterangan: 'Mencari harga jual dengan margin 40%: Modal x 1.67',
    aksi: 'Kalikan 1.67',
  },
  {
    id: 'lh-m-45',
    namaAturan: 'Tabel Pengali – Margin 45%',
    kondisiTrigger: 'Margin = 45%',
    rumusTindakan: 'Pengali = 1.82 (Modal x 1.82)',
    keterangan: 'Contoh: Modal x 1.82 berarti ambil 45% untuk mencari Harga Jual',
    aksi: 'Kalikan 1.82',
  },
  {
    id: 'lh-m-50',
    namaAturan: 'Tabel Pengali – Margin 50%',
    kondisiTrigger: 'Margin = 50%',
    rumusTindakan: 'Pengali = 2.00 (Modal x 2.00)',
    keterangan: 'Mencari harga jual dengan margin 50%: Modal x 2.00',
    aksi: 'Kalikan 2.00',
  },
];

export const INITIAL_LOGIKA_ONGKIR_DATA: LogicRuleItem[] = [
  {
    id: 'lo-1',
    namaAturan: 'Kardus Master Packing Standar',
    kondisiTrigger: 'Wadah Koli Pengiriman Workshop',
    rumusTindakan: 'Dimensi = 55 cm x 55 cm x 40 cm (Volume = 121.000 cm³)',
    keterangan: 'Ukuran kardus master standar yang kita miliki di sistem untuk menghitung daya tampung koli pengiriman.',
    aksi: 'Pakai Kardus 55x55x40 cm',
  },
  {
    id: 'lo-2',
    namaAturan: 'Perhitungan Kapasitas & Jumlah Koli',
    kondisiTrigger: 'Input Dimensi Box (P x L x T) & Qty',
    rumusTindakan: 'Pcs/Kardus = floor(55/P) x floor(55/L) x floor(40/T); Jumlah Koli = ceil(Qty / Pcs Per Kardus)',
    keterangan: 'Sistem mencoba kombinasi orientasi 3D terbaik untuk menampung box secara maksimal ke dalam kardus master 55x55x40 cm.',
    aksi: 'Hitung Muatan Koli',
  },
  {
    id: 'lo-3',
    namaAturan: 'Berat Volumetrik Kargo Ekspedisi',
    kondisiTrigger: 'Kargo / Paket Besar (Paxel Big, Trucking)',
    rumusTindakan: 'Berat Volumetrik = (55 x 55 x 40) / 4.000 = 30.25 kg per koli',
    keterangan: 'Perhitungan berat kubikasi kardus master 55x55x40 cm sesuai regulasi berat volumetrik kargo ekspedisi.',
    aksi: 'Hitung Volumetrik 30.25 kg/koli',
  },
  {
    id: 'lo-paxel-1',
    namaAturan: 'Ketentuan Khusus Paxel Big – Batas Maksimal Tarif per Koli',
    kondisiTrigger: 'Service = Paxel Big (Kardus Master 55x55x40 cm / 30.25 kg)',
    rumusTindakan: 'Maksimal 1 koli harganya 90 rb (Biaya per Koli = Min(Tarif Hitung, Rp 90.000))',
    keterangan: 'Khusus untuk Paxel Big memiliki ketentuan: Maksimal 1 koli harganya Rp 90.000. Biaya per koli tidak boleh melebihi Rp 90.000 meskipun berat volumetrik kardus master dihitung 30.25 kg.',
    aksi: 'Kunci Maksimal Rp 90.000 / Koli',
  },
  {
    id: 'lo-lintas-1',
    namaAturan: 'Ketentuan Khusus Lintas Travel – Sistem Volumetrik, Batas Max 35 kg & Estimasi Tiba',
    kondisiTrigger: 'Service = Lintas Travel (Rute Bandung ke Jabodetabek)',
    rumusTindakan: 'Berat Volumetrik = (P x L x T) / 4.000 = Jumlah Kilo | Batas Max Berat: 35 kg per koli | Estimasi Tiba: 4 - 5 Jam',
    keterangan: 'Khusus untuk Lintas Travel memiliki ketentuan: Gunakan sistem volumetrik (P x L x T : 4.000 = Jumlah kilo). Batas maksimum berat koli adalah 35 kg (Maksimal Biaya Rp 165.000/koli), dengan estimasi tiba pengiriman kurang lebih 4 - 5 jam.',
    aksi: 'Terapkan Volumetrik 4000, Batas Max 35 kg & Estimasi 4-5 Jam',
  },
  {
    id: 'lo-4',
    namaAturan: 'Kalkulasi Tarif Dasar & Minimum Ongkir',
    kondisiTrigger: 'Perhitungan Biaya per Koli dari Database Modal Ongkir',
    rumusTindakan: 'Biaya = Min(Max(Minimum Harga, Min + ((Berat - 10) x Harga/kg)), Maximum Harga)',
    keterangan: 'Biaya per koli tidak boleh lebih kecil dari Minimum Harga dan mengikuti batasan maximum harga modal ongkir (Paxel Big max Rp 90.000).',
    aksi: 'Terapkan Tarif Dasar Ongkir',
  },
  {
    id: 'lo-5',
    namaAturan: 'Rekomendasi Layanan Termurah',
    kondisiTrigger: 'Pencarian Layanan pada Rute Kota Asal ➔ Kota Tujuan',
    rumusTindakan: 'Urutkan Total Biaya Ascending ➔ Tandai Service Terendah sebagai "Rekomendasi Termurah"',
    keterangan: 'Sistem secara otomatis merekomendasikan ekspedisi dengan biaya total paling hemat untuk rute yang dipilih.',
    aksi: 'Rekomendasikan Layanan Termurah',
  },
];
