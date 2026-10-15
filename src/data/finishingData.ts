export interface FinishingCostItem {
  id: string;
  modelBox: string;
  minPrice: number;
  maxPrice: number;
  specialInstructions: string;
}

export const DEFAULT_INSTRUCTION =
  'Biaya dinamis berbasis volume box. Patokan min: 15 x 15 x 3 cm (675 cm³) biaya terendah (di bawah ini tetap harga terendah), patokan max: 40 x 30 x 10 cm (12.000 cm³) biaya tertinggi (di atas ini mentok). Ukuran di antaranya dihitung proporsional.';

export const INITIAL_FINISHING_DATA: FinishingCostItem[] = [
  {
    id: 'fin-1',
    modelBox: 'Box Buka Tutup (Terpisah)',
    minPrice: 3500,
    maxPrice: 7000,
    specialInstructions: DEFAULT_INSTRUCTION,
  },
  {
    id: 'fin-2',
    modelBox: 'Box Magnet (Model Buku)',
    minPrice: 6000,
    maxPrice: 10000,
    specialInstructions: DEFAULT_INSTRUCTION,
  },
  {
    id: 'fin-3',
    modelBox: 'Flap Pita',
    minPrice: 6000,
    maxPrice: 9000,
    specialInstructions: DEFAULT_INSTRUCTION,
  },
  {
    id: 'fin-4',
    modelBox: 'Slide Korek AB',
    minPrice: 5000,
    maxPrice: 8000,
    specialInstructions: DEFAULT_INSTRUCTION,
  },
  {
    id: 'fin-5',
    modelBox: 'Slide Korek KK',
    minPrice: 5000,
    maxPrice: 8000,
    specialInstructions: DEFAULT_INSTRUCTION,
  },
  {
    id: 'fin-6',
    modelBox: 'Slide Pita KK',
    minPrice: 6000,
    maxPrice: 9000,
    specialInstructions: DEFAULT_INSTRUCTION,
  },
  {
    id: 'fin-7',
    modelBox: 'Buka Tutup Full',
    minPrice: 3500,
    maxPrice: 8000,
    specialInstructions: DEFAULT_INSTRUCTION,
  },
];

export function formatRupiah(amount: number): string {
  return 'Rp ' + amount.toLocaleString('id-ID');
}
