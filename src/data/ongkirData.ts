export interface ShippingRateItem {
  id: string;
  service: string;       // Service Kurir / Ekspedisi (e.g. Paxel Big)
  kotaAsal: string;      // Kota Asal (e.g. Bandung)
  kotaTujuan: string;    // Kota Tujuan (e.g. Tangerang)
  estimasiTiba: string;  // Estimasi Tiba (e.g. 1 - 2 Hari)
  hargaPerKg: number;    // Harga Perkg (e.g. 2000)
  minimumHarga: number;  // Minimum Harga (e.g. 60000)
  maximumHarga?: number; // Maximum Harga otomatis: ((25 - 10) * hargaPerKg) + minimumHarga
}

/**
 * Spesifikasi Kardus Master Packing yang kita miliki di workshop
 */
export const MASTER_CARTON = {
  panjang: 55, // cm
  lebar: 55,   // cm
  tinggi: 40,  // cm
  volumeCm3: 55 * 55 * 40, // 121.000 cm³
  volumetricWeightKg: 30.25, // (55 * 55 * 40) / 4000 = 30.25 kg kargo
};

/**
 * Rumus Maximum Harga:
 * = ((25 - 10) * Harga perkg) + Minimum harga
 */
export const calculateMaxOngkir = (hargaPerKg: number, minimumHarga: number): number => {
  const kgRate = Number(hargaPerKg) || 0;
  const minRate = Number(minimumHarga) || 0;
  return ((25 - 10) * kgRate) + minRate;
};

export interface PackingCalculationResult {
  boxP: number;
  boxL: number;
  boxT: number;
  boxQty: number;
  boxVolumeCm3: number;
  masterP: number;
  masterL: number;
  masterT: number;
  masterVolumeCm3: number;
  pcsPerCarton: number;
  totalKoli: number;
  fullCartons: number;
  lastCartonPcs: number;
  weightPerKoliKg: number;
  totalWeightKg: number;
  arrangementLabel: string;
}

/**
 * Menghitung kapasitas muatan box dalam kardus master 55x55x40 cm
 * dengan mencoba kombinasi orientasi 3D terbaik.
 */
export function calculateCartonPacking(
  p: number,
  l: number,
  t: number,
  qty: number,
  masterP = MASTER_CARTON.panjang,
  masterL = MASTER_CARTON.lebar,
  masterT = MASTER_CARTON.tinggi
): PackingCalculationResult {
  const safeP = Math.max(0, p);
  const safeL = Math.max(0, l);
  const safeT = Math.max(0, t);
  const safeQty = Math.max(0, Math.floor(qty));
  const boxVolumeCm3 = safeP * safeL * safeT;
  const masterVolumeCm3 = masterP * masterL * masterT;
  const weightPerKoliKg = MASTER_CARTON.volumetricWeightKg;

  if (safeP <= 0 || safeL <= 0 || safeT <= 0 || safeQty <= 0) {
    return {
      boxP: safeP,
      boxL: safeL,
      boxT: safeT,
      boxQty: safeQty,
      boxVolumeCm3,
      masterP,
      masterL,
      masterT,
      masterVolumeCm3,
      pcsPerCarton: 0,
      totalKoli: 0,
      fullCartons: 0,
      lastCartonPcs: 0,
      weightPerKoliKg,
      totalWeightKg: 0,
      arrangementLabel: 'Dimensi / Qty belum diisi',
    };
  }

  // 6 Permutasi orientasi 3D
  const perms = [
    [safeP, safeL, safeT],
    [safeP, safeT, safeL],
    [safeL, safeP, safeT],
    [safeL, safeT, safeP],
    [safeT, safeP, safeL],
    [safeT, safeL, safeP],
  ];

  let bestCount = 0;
  let bestDimCounts = [0, 0, 0];

  for (const [dp, dl, dt] of perms) {
    const fitP = Math.floor(masterP / dp);
    const fitL = Math.floor(masterL / dl);
    const fitT = Math.floor(masterT / dt);
    const totalFit = fitP * fitL * fitT;
    if (totalFit > bestCount) {
      bestCount = totalFit;
      bestDimCounts = [fitP, fitL, fitT];
    }
  }

  const pcsPerCarton = bestCount > 0 ? bestCount : 1;
  const totalKoli = Math.ceil(safeQty / pcsPerCarton);
  const fullCartons = Math.floor(safeQty / pcsPerCarton);
  const lastCartonPcs = safeQty % pcsPerCarton === 0 ? pcsPerCarton : safeQty % pcsPerCarton;
  const totalWeightKg = totalKoli * weightPerKoliKg;

  const arrangementLabel =
    bestCount > 0
      ? `${bestDimCounts[0]} P x ${bestDimCounts[1]} L x ${bestDimCounts[2]} T susun`
      : 'Ukuran melebihi kardus 55x55x40 (1 pcs/koli)';

  return {
    boxP: safeP,
    boxL: safeL,
    boxT: safeT,
    boxQty: safeQty,
    boxVolumeCm3,
    masterP,
    masterL,
    masterT,
    masterVolumeCm3,
    pcsPerCarton,
    totalKoli,
    fullCartons,
    lastCartonPcs,
    weightPerKoliKg,
    totalWeightKg,
    arrangementLabel,
  };
}

/**
 * Menghitung estimasi biaya ongkir berdasarkan jumlah koli dan tarif service
 */
export function estimateShippingCost(
  service: ShippingRateItem,
  totalKoli: number,
  weightPerKoliKg = MASTER_CARTON.volumetricWeightKg
): { biayaPerKoli: number; totalOngkir: number } {
  if (totalKoli <= 0) {
    return { biayaPerKoli: 0, totalOngkir: 0 };
  }

  const baseWeight = Math.max(10, weightPerKoliKg);
  const rawCost = service.minimumHarga + ((baseWeight - 10) * service.hargaPerKg);
  const biayaPerKoli = Math.max(service.minimumHarga, Math.round(rawCost));
  const totalOngkir = biayaPerKoli * totalKoli;

  return { biayaPerKoli, totalOngkir };
}

export const INITIAL_ONGKIR_DATA: ShippingRateItem[] = [
  {
    id: 'ongkir-1',
    service: 'Paxel Big',
    kotaAsal: 'Bandung',
    kotaTujuan: 'Tangerang',
    estimasiTiba: '1 - 2 Hari',
    hargaPerKg: 2000,
    minimumHarga: 60000,
    maximumHarga: calculateMaxOngkir(2000, 60000),
  },
];
