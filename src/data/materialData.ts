export type MaterialTabKey =
  | 'bahan-dasar'
  | 'kertas-std'
  | 'kertas-premium'
  | 'innerbox';

export interface MaterialItem {
  id: string;
  namaBahan: string;
  ukuranPlano: string;
  hargaLembar: string;
}

export const INITIAL_BAHAN_DASAR_DATA: MaterialItem[] = [
  {
    id: 'bd-1',
    namaBahan: 'Karton Grey 30A',
    ukuranPlano: '74 x 64',
    hargaLembar: 'Rp 7.900',
  },
  {
    id: 'bd-2',
    namaBahan: 'Karton Grey 30',
    ukuranPlano: '74 x 64',
    hargaLembar: 'Rp 6.000',
  },
  {
    id: 'bd-3',
    namaBahan: 'Karton Yellow',
    ukuranPlano: '74 x 64',
    hargaLembar: 'Rp 5.000',
  },
];

export const INITIAL_KERTAS_STD_DATA: MaterialItem[] = [
  {
    id: 'ks-1',
    namaBahan: 'Kertas BC',
    ukuranPlano: '86 x 60',
    hargaLembar: 'Rp 2.100',
  },
  {
    id: 'ks-2',
    namaBahan: 'AP 150 Gr',
    ukuranPlano: '100 x 65',
    hargaLembar: 'Rp 2.900',
  },
  {
    id: 'ks-3',
    namaBahan: 'Ap 150 gr',
    ukuranPlano: '109 x 79',
    hargaLembar: 'Rp 3.200',
  },
  {
    id: 'ks-4',
    namaBahan: 'Ap 150 gr',
    ukuranPlano: '32 x 48',
    hargaLembar: 'Nol (Sudah include data proses Digital A3+)',
  },
];

export const INITIAL_KERTAS_PREMIUM_DATA: MaterialItem[] = [
  {
    id: 'kp-1',
    namaBahan: 'RCP',
    ukuranPlano: '109 x 79',
    hargaLembar: 'Rp 10.700',
  },
];

export const INITIAL_INNERBOX_DATA: MaterialItem[] = [
  {
    id: 'ib-1',
    namaBahan: 'Busa Ati',
    ukuranPlano: '200 x 100',
    hargaLembar: 'Rp 85.000',
  },
];
