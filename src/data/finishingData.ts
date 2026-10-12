export interface FinishingCostItem {
  id: string;
  modelBox: string;
  minPrice: number;
  maxPrice: number;
  specialInstructions: string;
}

export const DEFAULT_INSTRUCTION =
  'Biaya dinamis berbasis volume (P x L x T). Ditambah ekstra biaya penalti jika ada sambungan board (+Rp1500) atau kertas (+Rp1000).';

export const INITIAL_FINISHING_DATA: FinishingCostItem[] = [
  {
    id: 'fin-1',
    modelBox: 'Box Buka Tutup (Terpisah)',
    minPrice: 4500,
    maxPrice: 12000,
    specialInstructions: DEFAULT_INSTRUCTION,
  },
  {
    id: 'fin-2',
    modelBox: 'Box Magnet (Model Buku)',
    minPrice: 7500,
    maxPrice: 16000,
    specialInstructions: DEFAULT_INSTRUCTION,
  },
  {
    id: 'fin-3',
    modelBox: 'Flap Pita',
    minPrice: 7500,
    maxPrice: 16000,
    specialInstructions: DEFAULT_INSTRUCTION,
  },
  {
    id: 'fin-4',
    modelBox: 'Slide Korek AB',
    minPrice: 5000,
    maxPrice: 12000,
    specialInstructions: DEFAULT_INSTRUCTION,
  },
  {
    id: 'fin-5',
    modelBox: 'Slide Korek KK',
    minPrice: 5000,
    maxPrice: 12000,
    specialInstructions: DEFAULT_INSTRUCTION,
  },
  {
    id: 'fin-6',
    modelBox: 'Slide Pita KK',
    minPrice: 6000,
    maxPrice: 15000,
    specialInstructions: DEFAULT_INSTRUCTION,
  },
  {
    id: 'fin-7',
    modelBox: 'Buka Tutup Full',
    minPrice: 4500,
    maxPrice: 12000,
    specialInstructions: DEFAULT_INSTRUCTION,
  },
];

export function formatRupiah(amount: number): string {
  return 'Rp ' + amount.toLocaleString('id-ID');
}
