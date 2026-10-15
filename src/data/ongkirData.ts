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
  let biayaPerKoli = Math.max(service.minimumHarga, Math.round(rawCost));

  // Batas maksimum tarif koli (mengikuti batas maximumHarga)
  const maxLimit = service.maximumHarga;
  if (maxLimit !== undefined && maxLimit > 0) {
    biayaPerKoli = Math.min(biayaPerKoli, maxLimit);
  }

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
  {
    id: 'ongkir-2',
    service: 'Paxel Big',
    kotaAsal: 'Bandung',
    kotaTujuan: 'Depok',
    estimasiTiba: '1 - 2 Hari',
    hargaPerKg: 2000,
    minimumHarga: 60000,
    maximumHarga: calculateMaxOngkir(2000, 60000),
  },
  {
    id: 'ongkir-3',
    service: 'Paxel Big',
    kotaAsal: 'Bandung',
    kotaTujuan: 'Bogor',
    estimasiTiba: '1 - 2 Hari',
    hargaPerKg: 2000,
    minimumHarga: 60000,
    maximumHarga: calculateMaxOngkir(2000, 60000),
  },
  {
    id: 'ongkir-4',
    service: 'Paxel Big',
    kotaAsal: 'Bandung',
    kotaTujuan: 'Bekasi',
    estimasiTiba: '1 - 2 Hari',
    hargaPerKg: 2000,
    minimumHarga: 60000,
    maximumHarga: calculateMaxOngkir(2000, 60000),
  },
  {
    id: 'ongkir-5',
    service: 'Paxel Big',
    kotaAsal: 'Bandung',
    kotaTujuan: 'Jakarta Pusat',
    estimasiTiba: '1 - 2 Hari',
    hargaPerKg: 2000,
    minimumHarga: 60000,
    maximumHarga: calculateMaxOngkir(2000, 60000),
  },
  {
    id: 'ongkir-6',
    service: 'Paxel Big',
    kotaAsal: 'Bandung',
    kotaTujuan: 'Jakarta Selatan',
    estimasiTiba: '1 - 2 Hari',
    hargaPerKg: 2000,
    minimumHarga: 60000,
    maximumHarga: calculateMaxOngkir(2000, 60000),
  },
  {
    id: 'ongkir-7',
    service: 'Paxel Big',
    kotaAsal: 'Bandung',
    kotaTujuan: 'Jakarta Timur',
    estimasiTiba: '1 - 2 Hari',
    hargaPerKg: 2000,
    minimumHarga: 60000,
    maximumHarga: calculateMaxOngkir(2000, 60000),
  },
  {
    id: 'ongkir-8',
    service: 'Paxel Big',
    kotaAsal: 'Bandung',
    kotaTujuan: 'Jakarta Utara',
    estimasiTiba: '1 - 2 Hari',
    hargaPerKg: 2000,
    minimumHarga: 60000,
    maximumHarga: calculateMaxOngkir(2000, 60000),
  },
  {
    id: 'ongkir-9',
    service: 'Paxel Big',
    kotaAsal: 'Bandung',
    kotaTujuan: 'Jakarta Barat',
    estimasiTiba: '1 - 2 Hari',
    hargaPerKg: 2000,
    minimumHarga: 60000,
    maximumHarga: calculateMaxOngkir(2000, 60000),
  },
  {
    id: 'ongkir-10',
    service: 'Paxel Big',
    kotaAsal: 'Bandung',
    kotaTujuan: 'Cilegon',
    estimasiTiba: '1 Hari',
    hargaPerKg: 8500,
    minimumHarga: 107500,
    maximumHarga: calculateMaxOngkir(8500, 107500),
  },
  {
    id: 'ongkir-11',
    service: 'Paxel Big',
    kotaAsal: 'Bandung',
    kotaTujuan: 'Salatiga',
    estimasiTiba: '1 Hari',
    hargaPerKg: 10000,
    minimumHarga: 122000,
    maximumHarga: calculateMaxOngkir(10000, 122000),
  },
  {
    id: 'ongkir-12',
    service: 'Paxel Big',
    kotaAsal: 'Bandung',
    kotaTujuan: 'Bandung',
    estimasiTiba: '1 Hari',
    hargaPerKg: 2000,
    minimumHarga: 40000,
    maximumHarga: calculateMaxOngkir(2000, 40000),
  },
  {
    id: 'ongkir-13',
    service: 'Paxel Big',
    kotaAsal: 'Bandung',
    kotaTujuan: 'Banyuwangi',
    estimasiTiba: '2 Hari',
    hargaPerKg: 13500,
    minimumHarga: 135000,
    maximumHarga: calculateMaxOngkir(13500, 135000),
  },
  {
    id: 'ongkir-14',
    service: 'Paxel Big',
    kotaAsal: 'Bandung',
    kotaTujuan: 'Cikarang',
    estimasiTiba: '1 Hari',
    hargaPerKg: 5000,
    minimumHarga: 60000,
    maximumHarga: calculateMaxOngkir(5000, 60000),
  },
  {
    id: 'ongkir-15',
    service: 'Paxel Big',
    kotaAsal: 'Bandung',
    kotaTujuan: 'Denpasar',
    estimasiTiba: '2 Hari',
    hargaPerKg: 14500,
    minimumHarga: 160000,
    maximumHarga: calculateMaxOngkir(14500, 160000),
  },
  {
    id: 'ongkir-16',
    service: 'Paxel Big',
    kotaAsal: 'Bandung',
    kotaTujuan: 'Garut',
    estimasiTiba: '1 Hari',
    hargaPerKg: 3000,
    minimumHarga: 50000,
    maximumHarga: calculateMaxOngkir(3000, 50000),
  },
  {
    id: 'ongkir-17',
    service: 'Paxel Big',
    kotaAsal: 'Bandung',
    kotaTujuan: 'Jember',
    estimasiTiba: '1 Hari',
    hargaPerKg: 13500,
    minimumHarga: 135000,
    maximumHarga: calculateMaxOngkir(13500, 135000),
  },
  {
    id: 'ongkir-18',
    service: 'Paxel Big',
    kotaAsal: 'Bandung',
    kotaTujuan: 'Kediri',
    estimasiTiba: '1 Hari',
    hargaPerKg: 11500,
    minimumHarga: 155000,
    maximumHarga: calculateMaxOngkir(11500, 155000),
  },
  {
    id: 'ongkir-19',
    service: 'Paxel Big',
    kotaAsal: 'Bandung',
    kotaTujuan: 'Kuningan',
    estimasiTiba: '1 Hari',
    hargaPerKg: 6000,
    minimumHarga: 80000,
    maximumHarga: calculateMaxOngkir(6000, 80000),
  },
  {
    id: 'ongkir-20',
    service: 'Paxel Big',
    kotaAsal: 'Bandung',
    kotaTujuan: 'Lampung',
    estimasiTiba: '2 Hari',
    hargaPerKg: 6500,
    minimumHarga: 75000,
    maximumHarga: calculateMaxOngkir(6500, 75000),
  },
  {
    id: 'ongkir-21',
    service: 'Paxel Big',
    kotaAsal: 'Bandung',
    kotaTujuan: 'Madiun',
    estimasiTiba: '1 Hari',
    hargaPerKg: 13500,
    minimumHarga: 130000,
    maximumHarga: calculateMaxOngkir(13500, 130000),
  },
  {
    id: 'ongkir-22',
    service: 'Paxel Big',
    kotaAsal: 'Bandung',
    kotaTujuan: 'Magelang',
    estimasiTiba: '1 Hari',
    hargaPerKg: 8500,
    minimumHarga: 90000,
    maximumHarga: calculateMaxOngkir(8500, 90000),
  },
  {
    id: 'ongkir-23',
    service: 'Paxel Big',
    kotaAsal: 'Bandung',
    kotaTujuan: 'Malang',
    estimasiTiba: '1 Hari',
    hargaPerKg: 10500,
    minimumHarga: 115000,
    maximumHarga: calculateMaxOngkir(10500, 115000),
  },
  {
    id: 'ongkir-24',
    service: 'Paxel Big',
    kotaAsal: 'Bandung',
    kotaTujuan: 'Metro',
    estimasiTiba: '2 Hari',
    hargaPerKg: 7500,
    minimumHarga: 95000,
    maximumHarga: calculateMaxOngkir(7500, 95000),
  },
  {
    id: 'ongkir-25',
    service: 'Paxel Big',
    kotaAsal: 'Bandung',
    kotaTujuan: 'Mojokerto',
    estimasiTiba: '1 Hari',
    hargaPerKg: 10000,
    minimumHarga: 135000,
    maximumHarga: calculateMaxOngkir(10000, 135000),
  },
  {
    id: 'ongkir-26',
    service: 'Paxel Big',
    kotaAsal: 'Bandung',
    kotaTujuan: 'Palembang',
    estimasiTiba: '2 Hari',
    hargaPerKg: 13000,
    minimumHarga: 135000,
    maximumHarga: calculateMaxOngkir(13000, 135000),
  },
  {
    id: 'ongkir-27',
    service: 'Paxel Big',
    kotaAsal: 'Bandung',
    kotaTujuan: 'Pasuruan',
    estimasiTiba: '1 Hari',
    hargaPerKg: 10000,
    minimumHarga: 120000,
    maximumHarga: calculateMaxOngkir(10000, 120000),
  },
  {
    id: 'ongkir-28',
    service: 'Paxel Big',
    kotaAsal: 'Bandung',
    kotaTujuan: 'Purwokerto',
    estimasiTiba: '1 Hari',
    hargaPerKg: 11000,
    minimumHarga: 110000,
    maximumHarga: calculateMaxOngkir(11000, 110000),
  },
  {
    id: 'ongkir-29',
    service: 'Paxel Big',
    kotaAsal: 'Bandung',
    kotaTujuan: 'Semarang',
    estimasiTiba: '1 Hari',
    hargaPerKg: 4500,
    minimumHarga: 75000,
    maximumHarga: calculateMaxOngkir(4500, 75000),
  },
  {
    id: 'ongkir-30',
    service: 'Paxel Big',
    kotaAsal: 'Bandung',
    kotaTujuan: 'Sidoarjo',
    estimasiTiba: '1 Hari',
    hargaPerKg: 8000,
    minimumHarga: 110000,
    maximumHarga: calculateMaxOngkir(8000, 110000),
  },
  {
    id: 'ongkir-31',
    service: 'Paxel Big',
    kotaAsal: 'Bandung',
    kotaTujuan: 'Solo',
    estimasiTiba: '1 Hari',
    hargaPerKg: 5500,
    minimumHarga: 65000,
    maximumHarga: calculateMaxOngkir(5500, 65000),
  },
  {
    id: 'ongkir-32',
    service: 'Paxel Big',
    kotaAsal: 'Bandung',
    kotaTujuan: 'Surabaya',
    estimasiTiba: '1 Hari',
    hargaPerKg: 7500,
    minimumHarga: 100000,
    maximumHarga: calculateMaxOngkir(7500, 100000),
  },
  {
    id: 'ongkir-33',
    service: 'Paxel Big',
    kotaAsal: 'Bandung',
    kotaTujuan: 'Tasikmalaya',
    estimasiTiba: '1 Hari',
    hargaPerKg: 3000,
    minimumHarga: 50000,
    maximumHarga: calculateMaxOngkir(3000, 50000),
  },
  {
    id: 'ongkir-34',
    service: 'Paxel Big',
    kotaAsal: 'Bandung',
    kotaTujuan: 'Tegal',
    estimasiTiba: '1 Hari',
    hargaPerKg: 10000,
    minimumHarga: 100000,
    maximumHarga: calculateMaxOngkir(10000, 100000),
  },
  {
    id: 'ongkir-35',
    service: 'Paxel Big',
    kotaAsal: 'Bandung',
    kotaTujuan: 'Yogyakarta',
    estimasiTiba: '1 Hari',
    hargaPerKg: 5500,
    minimumHarga: 65000,
    maximumHarga: calculateMaxOngkir(5500, 65000),
  },
];


