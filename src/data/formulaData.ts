export interface ModelFormulaItem {
  id: string;
  modelBox: string;
  boardBody: string;
  boardTutup: string;
  lapisanDalamBody: string;
  lapisanDalamTutup: string;
  lapisanLuarBody: string;
  lapisanLuarTutup: string;
  pisauBody: string;
  pisauTutup: string;
}

export const INITIAL_FORMULA_DATA: ModelFormulaItem[] = [
  {
    id: 'rumus-1',
    modelBox: 'Box Buka Tutup (Terpisah)',
    boardBody: 'P + (2 x T) | L + (2 x T)',
    boardTutup:
      'P + 0.6 + (2 x Tt) | L + 0.6 + (2 x Tt) [Aturan Tt: T < 5cm -> Tt=2; T < 10cm -> Tt=2.5; T >= 10cm -> Tt=3]',
    lapisanDalamBody: 'Sama seperti Board Body: P + (2 x T) | L + (2 x T)',
    lapisanDalamTutup: 'Total Board Tutup',
    lapisanLuarBody: 'P + (2 x T) + 4 cm | L + (2 x T) + 4 cm',
    lapisanLuarTutup: 'P + 0.6 + (2 x Tt) + 4 cm | L + 0.6 + (2 x Tt) + 4 cm',
    pisauBody: '((P x 4) + (L + 4) + (T + 8)) x 450',
    pisauTutup: '(((P + 0.6) x 4) + ((L + 0.6) + 4) + ((T - 0.6) + 8)) x 450',
  },
  {
    id: 'rumus-2',
    modelBox: 'Box Magnet (Model Buku)',
    boardBody: 'P + (2 x T) | L + (2 x T)',
    boardTutup: 'P + 1 | L + L + T + T + 1.5 + 1',
    lapisanDalamBody: 'P + (2 x T) | L + (2 x T)',
    lapisanDalamTutup: 'P + 1 | L + T + (T/2) + 1 + 0.5',
    lapisanLuarBody: 'P + (2 x T) + 4 cm | L + (2 x T) + 4 cm',
    lapisanLuarTutup: 'Total P. Board Tutup + 4cm | L. Board Tutup + 4cm',
    pisauBody: '((P x 4) + (L + 4) + (T + 8)) x 450',
    pisauTutup: '(((P + 1) x 8) + ((L + 1) x 4) + (T x 4)) x 450',
  },
  {
    id: 'rumus-3',
    modelBox: 'Flap Pita',
    boardBody: 'P + (2 x T) | L + (2 x T)',
    boardTutup: 'P + 1 | L + L + T + 2 + 1',
    lapisanDalamBody: 'P + (2 x T) | L + (2 x T)',
    lapisanDalamTutup: 'P + 1 | L + 1 + (T/2)',
    lapisanLuarBody: 'Total P. Board body + 4cm | L. Board body + 4cm',
    lapisanLuarTutup: 'Total P. Board Tutup + 4cm | L. Board Tutup + 4cm',
    pisauBody: '((P x 4) + (L + 4) + (T + 8)) x 450',
    pisauTutup: '(((P + 1) x 6) + ((L + 1) x 4) + (T x 2)) x 450',
  },
  {
    id: 'rumus-4',
    modelBox: 'Slide Korek AB',
    boardBody: 'P + (2 x T) | L + (2 x T)',
    boardTutup: '(((P + 0.7) x 2) + ((T + 0.5) x 2)) | L + 0.7',
    lapisanDalamBody: 'P + (2 x T) | L + (2 x T)',
    lapisanDalamTutup: '(((P + 0.7) x 2) + ((T + 0.5) x 2)) | L + 0.7',
    lapisanLuarBody: 'Total P. Board body + 4cm | L. Board body + 4cm',
    lapisanLuarTutup: 'Total P. Board Tutup + 4cm | L. Board Tutup + 4cm',
    pisauBody: '((P x 4) + (L + 4) + (T + 8)) x 450',
    pisauTutup: '(((P + 0.7) x 4) + ((L + 0.7) x 5) + ((T + 0.5) x 4)) x 450',
  },
  {
    id: 'rumus-5',
    modelBox: 'Slide Korek KK',
    boardBody: 'P + (2 x T) | L + (2 x T)',
    boardTutup: '(((L + 0.7) x 2) + ((T + 0.5) x 2)) | P + 0.7',
    lapisanDalamBody: 'P + (2 x T) | L + (2 x T)',
    lapisanDalamTutup: '(((L + 0.7) x 2) + ((T + 0.5) x 2)) | P + 0.7',
    lapisanLuarBody: 'Total P. Board body + 4cm | L. Board body + 4cm',
    lapisanLuarTutup: 'Total P. Board Tutup + 4cm | L. Board Tutup + 4cm',
    pisauBody: '((P x 4) + (L + 4) + (T + 8)) x 450',
    pisauTutup: '(((P + 0.7) x 4) + ((L + 0.7) x 5) + ((T + 0.5) x 4)) x 450',
  },
  {
    id: 'rumus-6',
    modelBox: 'Slide Pita KK',
    boardBody: 'P + (2 x T) | L + (2 x T)',
    boardTutup: '((P + 0.7) + (T + 0.5)) | (((L + 0.7) x 2) + ((T + 0.5) x 2))',
    lapisanDalamBody: 'P + (2 x T) | L + (2 x T)',
    lapisanDalamTutup:
      '((P + 0.7) + (T + 0.5)) | (((L + 0.7) x 2) + ((T + 0.5) x 2))',
    lapisanLuarBody: 'Total P. Board body + 4cm | L. Board body + 4cm',
    lapisanLuarTutup: 'Total P. Board Tutup + 4cm | L. Board Tutup + 4cm',
    pisauBody: '((P x 4) + (L + 4) + (T + 8)) x 450',
    pisauTutup: '(((P + 0.7) x 5) + ((L + 0.7) x 4) + ((T + 0.5) x 6)) x 450',
  },
  {
    id: 'rumus-7',
    modelBox: 'Buka Tutup Full',
    boardBody: 'P + (2 x T) | L + (2 x T)',
    boardTutup: 'P + 0.7 + (2 x T) | L + 0.7 + (2 x T)',
    lapisanDalamBody: 'P + (2 x T) | L + (2 x T)',
    lapisanDalamTutup: 'P + 0.7 + (2 x T) | L + 0.7 + (2 x T)',
    lapisanLuarBody: 'Total P. Board body + 4cm | L. Board body + 4cm',
    lapisanLuarTutup: 'Total P. Board Tutup + 4cm | L. Board Tutup + 4cm',
    pisauBody: '((P x 4) + (L + 4) + (T + 8)) x 450',
    pisauTutup: '(((P + 0.7) x 4) + ((L + 0.7) x 4) + (T x 8)) x 450',
  },
];
