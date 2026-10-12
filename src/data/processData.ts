export interface DigitalProcessItem {
  id: string;
  namaMesin: string;
  ukuranArea: string;
  hargaCetak: string;
  keterangan: string;
}

export interface OffsetProcessItem {
  id: string;
  mesinCetak: string;
  ukuranAreaCetak: string;
  biayaCetak: string;
  lebihDruk: string;
}

export interface LaminasiProcessItem {
  id: string;
  jenisLaminasi: string;
  type: 'Digital' | 'Offset';
  maxUkuran: string;
  harga: string;
  biayaMinimum: string;
  rumusMinimum: string;
}

export interface LogoProcessItem {
  id: string;
  jenisLogo: string;
  harga: string;
  biayaMin: string;
  rumusLogo: string;
  keterangan: string;
}

export const INITIAL_DIGITAL_DATA: DigitalProcessItem[] = [
  {
    id: 'dig-1',
    namaMesin: 'Digital A3+',
    ukuranArea: '32 x 48',
    hargaCetak: 'Rp 2.000 / lembar',
    keterangan: 'Sudah sama kertas',
  },
];

export const INITIAL_OFFSET_DATA: OffsetProcessItem[] = [
  {
    id: 'off-1',
    mesinCetak: 'Mesin 52',
    ukuranAreaCetak: '34 x 52',
    biayaCetak: 'Rp 500.000/page',
    lebihDruk:
      '= Jumlah page x Biaya cetak + (((jumlah lembar x sisi) - 2000) x 25 x jumlah page',
  },
  {
    id: 'off-2',
    mesinCetak: 'Mesin 58',
    ukuranAreaCetak: '44 x 58',
    biayaCetak: 'Rp 500.000/page',
    lebihDruk:
      '= Jumlah page x Biaya cetak + (((jumlah lembar x sisi) - 2000) x 30 x jumlah page',
  },
];

export const INITIAL_LAMINASI_DATA: LaminasiProcessItem[] = [
  {
    id: 'lam-1',
    jenisLaminasi: 'Laminasi Doff',
    type: 'Digital',
    maxUkuran: '32 x 48',
    harga: 'Rp 2.000',
    biayaMinimum: 'Rp 2.000',
    rumusMinimum: 'Tidak ada rumus.',
  },
  {
    id: 'lam-2',
    jenisLaminasi: 'Laminasi Glossy',
    type: 'Digital',
    maxUkuran: '32 x 48',
    harga: 'Rp 2.000',
    biayaMinimum: 'Rp 2.000',
    rumusMinimum: 'Tidak ada rumus.',
  },
  {
    id: 'lam-3',
    jenisLaminasi: 'Laminasi Doff',
    type: 'Offset',
    maxUkuran: 'Custom',
    harga: '0.19',
    biayaMinimum: 'Rp 130.000',
    rumusMinimum: '=pxlxhargaxjumlah lembar',
  },
  {
    id: 'lam-4',
    jenisLaminasi: 'Laminasi Glossy',
    type: 'Offset',
    maxUkuran: 'Custom',
    harga: '0.16',
    biayaMinimum: 'Rp 120.000',
    rumusMinimum: '=pxlxhargaxjumlah lembar',
  },
];

export const INITIAL_LOGO_DATA: LogoProcessItem[] = [
  {
    id: 'log-1',
    jenisLogo: 'Foil',
    harga: 'Rp 550',
    biayaMin: 'Rp 75.000',
    rumusLogo: '(P x L x Harga)+50000',
    keterangan: 'Jika harga akhir dibawah 75 kena min, jika lebih sesuai hitungan.',
  },
  {
    id: 'log-2',
    jenisLogo: 'Embos',
    harga: 'Rp 1.000',
    biayaMin: 'Rp 85.000',
    rumusLogo: '(P x L x Harga)+50000',
    keterangan: 'Jika harga akhir dibawah 75 kena min, jika lebih sesuai hitungan.',
  },
];
