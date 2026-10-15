import { FinishingCostItem } from '../data/finishingData';
import { ModelFormulaItem } from '../data/formulaData';
import { LogicRuleItem, MARGIN_MULTIPLIER_TABLE } from '../data/logicData';
import { MaterialItem } from '../data/materialData';
import {
  DigitalProcessItem,
  LaminasiProcessItem,
  LogoProcessItem,
  OffsetProcessItem,
} from '../data/processData';

export type LogoVariantType = 'std' | 'custom';

export interface SelectedLogoInput {
  logoId: string;
  variant: LogoVariantType;
  customP?: number;
  customL?: number;
}

export interface LogoBreakdownItem {
  label: string;
  detailLine: string;
  cost: number;
}

export interface CalculatorInputState {
  modelId: string;
  p: number;
  l: number;
  t: number;
  qty: number;
  // User selects by material name (or ID mapped to normalized name)
  bahanBodyName: string;
  bahanTutupName: string;
  lBodyDalamName: string;
  lBodyLuarName: string;
  lTutupDalamName: string;
  lTutupLuarName: string;
  innerboxNames: string[];
  logos?: SelectedLogoInput[];
  selectedPrintIndex?: number;
}

export interface PrintComparisonOption {
  label: string;
  detail: string;
  formatUkuran: string;
  metode: string;
  layoutInfo: string;
  kebutuhanLembar: string;
  totalCost: number;
  cetakCost: number;
  paperCost: number;
  laminasiCost: number;
  laminasiLabel: string;
  isValid: boolean;
  isRecommended: boolean;
  bodySheetLine: string;
  tutupSheetLine: string;
  /** Metode layout khusus Buka Tutup: 'utuh' | 'sambungan-3' | 'sambungan-5' */
  sambunganMethod?: 'utuh' | 'sambungan-3' | 'sambungan-5';
  /** Rincian bagian-bagian potongan sambungan (jika bukan utuh) */
  sambunganParts?: string[];
}

export interface SystemDecisionSummary {
  bahan: string;
  format: string;
  metode: string;
  layout: string;
  kebutuhan: string;
  biaya: number;
}

export interface PisauPondAnalysis {
  isActive: boolean;
  rawBodyP: number;
  rawBodyL: number;
  finalBodyP: number;
  finalBodyL: number;
  pisauBodyCost: number;
  rawTutupP: number;
  rawTutupL: number;
  finalTutupP: number;
  finalTutupL: number;
  pisauTutupCost: number;
  isInnerboxActive: boolean;
  pisauInnerboxCost: number;
  totalPisauCost: number;
}

export interface BoxCalculationResult {
  modelName: string;
  p: number;
  l: number;
  t: number;
  tt: number;
  qty: number;
  isPondActive: boolean;
  pondAnalysis: PisauPondAnalysis;
  // Keputusan Sistem Otomatis
  systemDecision: SystemDecisionSummary;
  // Material & Ukuran Potong Bersih lines
  boardBodyLine: string;
  boardTutupLine: string;
  lapisanDalamBodyLine: string;
  lapisanDalamTutupLine: string;
  lapisanLuarBodyLine: string;
  lapisanLuarTutupLine: string;
  innerboxLines: string[];
  logoLines: string[];
  // Cost items
  boardLabel: string;
  boardCost: number;
  lapisanDalamCost: number;
  lapisanLuarPaperCost: number;
  lapisanLuarPaperNote: string;
  cetakLabel: string;
  cetakCost: number;
  isLaminasiActive: boolean;
  laminasiLabel: string;
  laminasiCost: number;
  finishingRatePerPcs: number;
  finishingCost: number;
  ongkosPondCost: number;
  pisauPondCost: number;
  isPisauInnerboxActive: boolean;
  pisauInnerboxCost: number;
  innerboxCost: number;
  logoCost: number;
  logoCostItems: LogoBreakdownItem[];
  totalBiayaProduksi: number;
  hargaModalPerPcs: number;
  marginPercent: number;
  marginTierLabel: string;
  pengaliHargaJual: number;
  hargaJualPerPcs: number;
  totalHargaJual: number;
  // Print comparison
  outerPaperName: string;
  printComparisons: PrintComparisonOption[];
  selectedPrintIndex: number;
  minPrintIndex: number;
}

export function normalizeMaterialKey(name: string | undefined): string {
  if (!name) return '';
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

export function formatCanonicalMaterialName(name: string): string {
  const key = normalizeMaterialKey(name);
  if (key === 'ap 150 gr' || key === 'ap150 gr' || key === 'ap 150gr') {
    return 'AP 150 Gr';
  }
  return name.trim();
}

export function isLaminasiEligibleMaterial(name: string | undefined): boolean {
  const key = normalizeMaterialKey(name);
  if (!key) return false;
  return (
    key.includes('ap 150') ||
    key.includes('ap150') ||
    key.includes('art paper 150') ||
    key.includes('artpaper 150') ||
    key.includes('ac 260') ||
    key.includes('ac260') ||
    key.includes('art carton 260') ||
    key.includes('artcarton 260')
  );
}

/**
 * Returns true only for Art Paper 150 gr (AP 150) — the only material that can
 * go through the Digital A3+ printing process.
 * Semua bahan lapisan luar selain AP 150 gr (mis. RCP, Jasmine, Concorde, dll)
 * hanya bisa diproses via Offset menggunakan ukuran plano aslinya.
 */
export function isDigitalPrintEligible(name: string | undefined): boolean {
  const key = normalizeMaterialKey(name);
  if (!key) return false;
  return (
    key.includes('ap 150') ||
    key.includes('ap150') ||
    key.includes('art paper 150') ||
    key.includes('artpaper 150')
  );
}

export function getUniqueMaterialNames(items: MaterialItem[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of items) {
    const key = normalizeMaterialKey(item.namaBahan);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(formatCanonicalMaterialName(item.namaBahan));
  }
  return result;
}

export function parseRupiahNumber(str: string | undefined): number {
  if (!str) return 0;
  const trimmed = str.trim();
  if (/^\s*nol\b|^rp\s*0\b|^0$/i.test(trimmed)) {
    return 0;
  }
  if (/^0[.,]\d+$/.test(trimmed)) {
    return parseFloat(trimmed.replace(',', '.'));
  }
  const match = trimmed.match(/[\d.]+/);
  if (!match) return 0;
  const cleaned = match[0].replace(/\./g, '');
  const val = parseFloat(cleaned);
  return Number.isNaN(val) ? 0 : val;
}

export function parseDimensions(str: string | undefined): { w: number; h: number } {
  if (!str) return { w: 0, h: 0 };
  const matches = str.match(/(\d+(?:[.,]\d+)?)\s*[xX×]\s*(\d+(?:[.,]\d+)?)/);
  if (!matches) return { w: 0, h: 0 };
  const w = parseFloat(matches[1].replace(',', '.'));
  const h = parseFloat(matches[2].replace(',', '.'));
  return {
    w: Number.isNaN(w) ? 0 : w,
    h: Number.isNaN(h) ? 0 : h,
  };
}

function evalSimpleMathExpression(
  expr: string,
  vars: {
    P: number;
    L: number;
    T: number;
    Tt: number;
    BoardBodyP: number;
    BoardBodyL: number;
    BoardTutupP: number;
    BoardTutupL: number;
  }
): number {
  let s = expr
    .replace(/\[.*?\]/g, '')
    .replace(/Sama seperti Board Body\s*:/gi, '')
    .replace(/Total\s+P\.\s*Board\s*body/gi, String(vars.BoardBodyP))
    .replace(/L\.\s*Board\s*body/gi, String(vars.BoardBodyL))
    .replace(/Total\s+P\.\s*Board\s*Tutup/gi, String(vars.BoardTutupP))
    .replace(/L\.\s*Board\s*Tutup/gi, String(vars.BoardTutupL))
    .replace(/cm/gi, '')
    .replace(/\bTt\b/g, String(vars.Tt))
    .replace(/\bP\b/g, String(vars.P))
    .replace(/\bL\b/g, String(vars.L))
    .replace(/\bT\b/g, String(vars.T))
    .replace(/[xX×]/g, '*')
    .replace(/,/g, '.');

  s = s.replace(/[^0-9+\-*/().\s]/g, '');
  if (!s.trim()) return 0;

  try {
    const fn = new Function(`return (${s});`);
    const res = Number(fn());
    return Number.isFinite(res) ? res : 0;
  } catch {
    return 0;
  }
}

function evaluatePairFormula(
  formulaStr: string,
  vars: {
    P: number;
    L: number;
    T: number;
    Tt: number;
    BoardBodyP: number;
    BoardBodyL: number;
    BoardTutupP: number;
    BoardTutupL: number;
  }
): { p: number; l: number } {
  const cleaned = formulaStr.replace(/\[.*?\]/g, '').trim();
  if (/^Total\s+Board\s+Tutup$/i.test(cleaned)) {
    return { p: vars.BoardTutupP, l: vars.BoardTutupL };
  }
  if (/^Total\s+Board\s+Body$/i.test(cleaned)) {
    return { p: vars.BoardBodyP, l: vars.BoardBodyL };
  }

  const parts = cleaned.split('|');
  if (parts.length >= 2) {
    return {
      p: evalSimpleMathExpression(parts[0], vars),
      l: evalSimpleMathExpression(parts[1], vars),
    };
  }
  return { p: 0, l: 0 };
}

function calcPlanoFit(planoW: number, planoH: number, cutW: number, cutH: number): number {
  if (planoW <= 0 || planoH <= 0 || cutW <= 0 || cutH <= 0) return 0;
  const fit1 = Math.floor(planoW / cutW) * Math.floor(planoH / cutH);
  const fit2 = Math.floor(planoW / cutH) * Math.floor(planoH / cutW);
  return Math.max(fit1, fit2);
}

/**
 * Finds the best (cheapest valid) material variant among all rows matching `materialName`
 * for a given required cut dimension `cutW x cutH` and `qty`.
 */
function pickCheapestMaterialVariant(
  candidates: MaterialItem[],
  cutW: number,
  cutH: number,
  qty: number
): {
  item: MaterialItem;
  fit: number;
  sheets: number;
  cost: number;
  isUtuh: boolean;
} | null {
  if (candidates.length === 0) return null;

  let best: {
    item: MaterialItem;
    fit: number;
    sheets: number;
    cost: number;
    isUtuh: boolean;
  } | null = null;

  for (const cand of candidates) {
    const price = parseRupiahNumber(cand.hargaLembar);
    const dim = parseDimensions(cand.ukuranPlano);
    // Skip zero-price Digital A3+ virtual entry when selecting raw plano sheets
    if (price === 0 && candidates.length > 1) continue;

    const rawFit = calcPlanoFit(dim.w, dim.h, cutW, cutH);
    const isUtuh = rawFit >= 1;
    const effectiveFit = Math.max(1, rawFit);
    const sheets = Math.ceil(qty / effectiveFit);
    const cost = sheets * price;

    if (
      !best ||
      (isUtuh && !best.isUtuh) ||
      (isUtuh === best.isUtuh && cost < best.cost)
    ) {
      best = {
        item: cand,
        fit: effectiveFit,
        sheets,
        cost,
        isUtuh,
      };
    }
  }

  if (!best) {
    const fallback = candidates[0];
    const dim = parseDimensions(fallback.ukuranPlano);
    const rawFit = calcPlanoFit(dim.w, dim.h, cutW, cutH);
    const effectiveFit = Math.max(1, rawFit);
    const sheets = Math.ceil(qty / effectiveFit);
    const cost = sheets * parseRupiahNumber(fallback.hargaLembar);
    return {
      item: fallback,
      fit: effectiveFit,
      sheets,
      cost,
      isUtuh: rawFit >= 1,
    };
  }

  return best;
}

export function evaluateLogoFormula(
  rumusStr: string,
  p: number,
  l: number,
  harga: number
): number {
  if (!rumusStr || !rumusStr.trim()) {
    return Math.round(p * l * harga + 50000);
  }
  let s = rumusStr
    .replace(/harga/gi, String(harga))
    .replace(/\bP\b/gi, String(p))
    .replace(/\bL\b/gi, String(l))
    .replace(/[xX×]/g, '*')
    .replace(/,/g, '.');
  s = s.replace(/[^0-9+\-*/().\s]/g, '');
  if (!s.trim()) {
    return Math.round(p * l * harga + 50000);
  }
  try {
    const fn = new Function(`return (${s});`);
    const res = Number(fn());
    return Number.isFinite(res) ? Math.round(res) : Math.round(p * l * harga + 50000);
  } catch {
    return Math.round(p * l * harga + 50000);
  }
}

export function resolveMarginAndPengali(qty: number): {
  marginPercent: number;
  pengali: number;
  tierLabel: string;
} {
  let marginPercent = 45;
  let tierLabel = 'Qty < 12 pcs : 45%';

  if (qty < 12) {
    marginPercent = 45;
    tierLabel = 'Qty < 12 pcs : 45%';
  } else if (qty <= 49) {
    const ratio = (qty - 12) / (49 - 12);
    marginPercent = Number((45 - ratio * (45 - 40)).toFixed(2));
    tierLabel = 'Qty 12-49 pcs : Interpolasi 45% ➔ 40%';
  } else if (qty <= 100) {
    const ratio = (qty - 50) / (100 - 50);
    marginPercent = Number((37 - ratio * (37 - 35)).toFixed(2));
    tierLabel = 'Qty 50-100 pcs : Interpolasi 37% ➔ 35%';
  } else if (qty <= 300) {
    const ratio = (qty - 101) / (300 - 101);
    marginPercent = Number((35 - ratio * (35 - 32)).toFixed(2));
    tierLabel = 'Qty 101-300 pcs : Interpolasi 35% ➔ 32%';
  } else {
    const ratio = Math.min(1, (qty - 300) / (1000 - 300));
    marginPercent = Number((32 - ratio * (32 - 30)).toFixed(2));
    tierLabel = 'Qty > 300 pcs : Interpolasi 32% ➔ 30%';
  }

  const exactRow = MARGIN_MULTIPLIER_TABLE.find(
    (r) => Math.abs(r.marginPct - marginPercent) < 0.001
  );
  const pengali = exactRow
    ? exactRow.pengali
    : Number((1 / (1 - marginPercent / 100)).toFixed(2));

  return {
    marginPercent,
    pengali,
    tierLabel,
  };
}

export function resolveTtFromLogic(t: number, logikaModelItems: LogicRuleItem[]): number {
  for (const rule of logikaModelItems) {
    const cond = rule.kondisiTrigger.toLowerCase();
    const numMatch = rule.rumusTindakan.match(/(\d+(?:[.,]\d+)?)/);
    const val = numMatch ? parseFloat(numMatch[1].replace(',', '.')) : null;
    if (val !== null && !Number.isNaN(val)) {
      if (cond.includes('t < 5') && t < 5) return val;
      if (cond.includes('5') && cond.includes('10') && t >= 5 && t < 10) return val;
      if ((cond.includes('>= 10') || cond.includes('≥ 10')) && t >= 10) return val;
    }
  }
  if (t < 5) return 2;
  if (t < 10) return 2.5;
  return 3;
}

export function resolvePisauInnerboxCost(
  vars: {
    P: number;
    L: number;
    T: number;
    Tt: number;
    BoardBodyP: number;
    BoardBodyL: number;
    BoardTutupP: number;
    BoardTutupL: number;
  },
  hasInnerbox: boolean,
  logikaProsesItems?: LogicRuleItem[]
): number {
  if (!hasInnerbox || (vars.P <= 0 && vars.L <= 0)) {
    return 0;
  }

  const rule = (logikaProsesItems || []).find((r) => {
    const name = r.namaAturan.toLowerCase();
    return name.includes('pisau inner') || (name.includes('pisau') && name.includes('inner'));
  });

  const rawFormula = rule?.rumusTindakan || '((P x 4) + (L x 4)) x 450';
  const activePart = rawFormula.split('|')[0].trim();
  const afterEquals = activePart.includes('=')
    ? activePart.split('=').slice(-1)[0].trim()
    : activePart;

  const evaluated = Math.round(evalSimpleMathExpression(afterEquals, vars));
  if (evaluated > 0) {
    return evaluated;
  }
  return Math.round(((vars.P * 4) + (vars.L * 4)) * 450);
}

export function analyzePisauPond(
  params: {
    modelId: string;
    p: number;
    l: number;
    t: number;
    qty: number;
    hasInnerbox?: boolean;
  },
  databases: {
    formulaItems: ModelFormulaItem[];
    logikaModelItems: LogicRuleItem[];
    logikaProsesItems?: LogicRuleItem[];
  }
): PisauPondAnalysis {
  const { p: P, l: L, t: T, qty } = params;
  const isActive = qty >= 100;
  const isInnerboxActive = Boolean(params.hasInnerbox);

  if (P <= 0 && L <= 0 && T <= 0) {
    return {
      isActive,
      rawBodyP: 0,
      rawBodyL: 0,
      finalBodyP: 0,
      finalBodyL: 0,
      pisauBodyCost: 0,
      rawTutupP: 0,
      rawTutupL: 0,
      finalTutupP: 0,
      finalTutupL: 0,
      pisauTutupCost: 0,
      isInnerboxActive,
      pisauInnerboxCost: 0,
      totalPisauCost: 0,
    };
  }

  const model =
    databases.formulaItems.find((m) => m.id === params.modelId) ||
    databases.formulaItems[0];
  const Tt = resolveTtFromLogic(T, databases.logikaModelItems);

  const baseVars = {
    P,
    L,
    T,
    Tt,
    BoardBodyP: 0,
    BoardBodyL: 0,
    BoardTutupP: 0,
    BoardTutupL: 0,
  };

  const rawBoardBody = evaluatePairFormula(
    model?.boardBody || 'P + (2 x T) | L + (2 x T)',
    baseVars
  );
  baseVars.BoardBodyP = rawBoardBody.p;
  baseVars.BoardBodyL = rawBoardBody.l;

  const rawBoardTutup = evaluatePairFormula(
    model?.boardTutup || 'P + 0.6 + (2 x Tt) | L + 0.6 + (2 x Tt)',
    baseVars
  );
  baseVars.BoardTutupP = rawBoardTutup.p;
  baseVars.BoardTutupL = rawBoardTutup.l;

  const pisauBodyCost = Math.round(
    evalSimpleMathExpression(model?.pisauBody || '', baseVars)
  );
  const pisauTutupCost = Math.round(
    evalSimpleMathExpression(model?.pisauTutup || '', baseVars)
  );
  const pisauInnerboxCost = resolvePisauInnerboxCost(
    baseVars,
    isInnerboxActive,
    databases.logikaProsesItems
  );

  const extraCm = isActive ? 1 : 0;
  const activePondCost = isActive ? pisauBodyCost + pisauTutupCost : 0;

  return {
    isActive,
    rawBodyP: rawBoardBody.p,
    rawBodyL: rawBoardBody.l,
    finalBodyP: rawBoardBody.p + extraCm,
    finalBodyL: rawBoardBody.l + extraCm,
    pisauBodyCost: isActive ? pisauBodyCost : 0,
    rawTutupP: rawBoardTutup.p,
    rawTutupL: rawBoardTutup.l,
    finalTutupP: rawBoardTutup.p + extraCm,
    finalTutupL: rawBoardTutup.l + extraCm,
    pisauTutupCost: isActive ? pisauTutupCost : 0,
    isInnerboxActive,
    pisauInnerboxCost,
    totalPisauCost: activePondCost + pisauInnerboxCost,
  };
}

export function calculateBoxEstimation(
  input: CalculatorInputState,
  databases: {
    formulaItems: ModelFormulaItem[];
    bahanDasarItems: MaterialItem[];
    kertasStdItems: MaterialItem[];
    kertasPremiumItems: MaterialItem[];
    innerboxItems: MaterialItem[];
    digitalItems: DigitalProcessItem[];
    offsetItems: OffsetProcessItem[];
    laminasiItems: LaminasiProcessItem[];
    logoItems?: LogoProcessItem[];
    finishingItems: FinishingCostItem[];
    logikaModelItems: LogicRuleItem[];
    logikaMesinItems?: LogicRuleItem[];
    logikaProsesItems?: LogicRuleItem[];
  }
): BoxCalculationResult {
  const { p: P, l: L, t: T, qty } = input;
  const safeQty = Math.max(1, qty);

  const model =
    databases.formulaItems.find((m) => m.id === input.modelId) ||
    databases.formulaItems[0];

  const Tt = resolveTtFromLogic(T, databases.logikaModelItems);

  const baseVars = {
    P,
    L,
    T,
    Tt,
    BoardBodyP: 0,
    BoardBodyL: 0,
    BoardTutupP: 0,
    BoardTutupL: 0,
  };

  // STEP 1: Hitung kebutuhan ukuran potong berdasarkan ukuran box & rumus model
  const rawBoardBody = evaluatePairFormula(
    model?.boardBody || 'P + (2 x T) | L + (2 x T)',
    baseVars
  );
  baseVars.BoardBodyP = rawBoardBody.p;
  baseVars.BoardBodyL = rawBoardBody.l;

  const rawBoardTutup = evaluatePairFormula(
    model?.boardTutup || 'P + 0.6 + (2 x Tt) | L + 0.6 + (2 x Tt)',
    baseVars
  );
  baseVars.BoardTutupP = rawBoardTutup.p;
  baseVars.BoardTutupL = rawBoardTutup.l;

  // Pisau Pond (+1 cm) & Biaya Pisau hanya aktif jika Qty >= 100 pcs
  const isPondActive = safeQty >= 100;
  const pondExtraCm = isPondActive ? 1 : 0;
  const cutBoardBodyP = rawBoardBody.p + pondExtraCm;
  const cutBoardBodyL = rawBoardBody.l + pondExtraCm;
  const cutBoardTutupP = rawBoardTutup.p + pondExtraCm;
  const cutBoardTutupL = rawBoardTutup.l + pondExtraCm;

  // Evaluate Lapisan Dalam Body & Tutup
  const cutDalamBody = evaluatePairFormula(
    model?.lapisanDalamBody || 'P + (2 x T) | L + (2 x T)',
    baseVars
  );
  const cutDalamTutup = evaluatePairFormula(
    model?.lapisanDalamTutup || 'Total Board Tutup',
    baseVars
  );

  // Evaluate Lapisan Luar Body & Tutup
  const cutLuarBody = evaluatePairFormula(
    model?.lapisanLuarBody || 'Total P. Board body + 4cm | L. Board body + 4cm',
    baseVars
  );
  const cutLuarTutup = evaluatePairFormula(
    model?.lapisanLuarTutup || 'Total P. Board Tutup + 4cm | L. Board Tutup + 4cm',
    baseVars
  );

  // Evaluate Pisau Body & Pisau Tutup (Aktif jika Qty >= 100 pcs)
  const rawPisauBodyCost = Math.round(
    evalSimpleMathExpression(model?.pisauBody || '', baseVars)
  );
  const rawPisauTutupCost = Math.round(
    evalSimpleMathExpression(model?.pisauTutup || '', baseVars)
  );
  const pisauBodyCost = isPondActive ? rawPisauBodyCost : 0;
  const pisauTutupCost = isPondActive ? rawPisauTutupCost : 0;
  const pisauPondCost = pisauBodyCost + pisauTutupCost;

  // Evaluate Biaya Pisau Innerbox (Aktif jika user memilih Tambah Inner)
  const isPisauInnerboxActive = input.innerboxNames.filter(Boolean).length > 0;
  const pisauInnerboxCost = resolvePisauInnerboxCost(
    baseVars,
    isPisauInnerboxActive,
    databases.logikaProsesItems
  );

  const pondAnalysis: PisauPondAnalysis = {
    isActive: isPondActive,
    rawBodyP: rawBoardBody.p,
    rawBodyL: rawBoardBody.l,
    finalBodyP: cutBoardBodyP,
    finalBodyL: cutBoardBodyL,
    pisauBodyCost,
    rawTutupP: rawBoardTutup.p,
    rawTutupL: rawBoardTutup.l,
    finalTutupP: cutBoardTutupP,
    finalTutupL: cutBoardTutupL,
    pisauTutupCost,
    isInnerboxActive: isPisauInnerboxActive,
    pisauInnerboxCost,
    totalPisauCost: pisauPondCost + pisauInnerboxCost,
  };

  // STEP 2: Cari semua ukuran bahan yang tersedia berdasarkan NAMA BAHAN yang dipilih user
  const allPapers = [...databases.kertasStdItems, ...databases.kertasPremiumItems];

  const findBoardVariants = (name: string) =>
    databases.bahanDasarItems.filter(
      (b) => normalizeMaterialKey(b.namaBahan) === normalizeMaterialKey(name)
    );

  const findPaperVariants = (name: string) =>
    allPapers.filter(
      (k) => normalizeMaterialKey(k.namaBahan) === normalizeMaterialKey(name)
    );

  const boardBodyPick = pickCheapestMaterialVariant(
    findBoardVariants(input.bahanBodyName),
    cutBoardBodyP,
    cutBoardBodyL,
    safeQty
  );
  const boardTutupPick = pickCheapestMaterialVariant(
    findBoardVariants(input.bahanTutupName),
    cutBoardTutupP,
    cutBoardTutupL,
    safeQty
  );

  const pondNoteText = isPondActive ? '(Pond +1cm)' : '(Tanpa Pond)';

  let boardBodyCost = 0;
  let boardBodyLine = 'Board body : Tidak menggunakan bahan body';
  if (boardBodyPick) {
    boardBodyCost = boardBodyPick.cost;
    boardBodyLine = `Board body : ${boardBodyPick.item.namaBahan}_${boardBodyPick.sheets} lbr_${boardBodyPick.item.ukuranPlano} cm_potong jadi ${cutBoardBodyP.toFixed(1)} x ${cutBoardBodyL.toFixed(1)} cm (1 plano muat ${boardBodyPick.fit} pcs) ${pondNoteText}`;
  }

  let boardTutupCost = 0;
  let boardTutupLine = 'Board Tutup : Tidak menggunakan bahan tutup';
  if (boardTutupPick) {
    boardTutupCost = boardTutupPick.cost;
    boardTutupLine = `Board Tutup : ${boardTutupPick.item.namaBahan}_${boardTutupPick.sheets} lbr_${boardTutupPick.item.ukuranPlano} cm_potong jadi ${cutBoardTutupP.toFixed(1)} x ${cutBoardTutupL.toFixed(1)} cm (1 plano muat ${boardTutupPick.fit} pcs) ${pondNoteText}`;
  }

  const boardCost = boardBodyCost + boardTutupCost;
  const boardLabel =
    boardBodyPick &&
    boardTutupPick &&
    normalizeMaterialKey(boardBodyPick.item.namaBahan) !==
      normalizeMaterialKey(boardTutupPick.item.namaBahan)
      ? `${boardBodyPick.item.namaBahan} & ${boardTutupPick.item.namaBahan}`
      : boardBodyPick?.item.namaBahan ||
        boardTutupPick?.item.namaBahan ||
        'Karton / Board';

  // Lapisan Dalam (Body & Tutup) - pilih otomatis ukuran plano terbaik
  const dalamBodyPick = pickCheapestMaterialVariant(
    findPaperVariants(input.lBodyDalamName),
    cutDalamBody.p,
    cutDalamBody.l,
    safeQty
  );
  const dalamTutupPick = pickCheapestMaterialVariant(
    findPaperVariants(input.lTutupDalamName),
    cutDalamTutup.p,
    cutDalamTutup.l,
    safeQty
  );

  let dalamBodyCost = 0;
  let lapisanDalamBodyLine = 'Lapisan body : Tidak menggunakan lapisan dalam body';
  if (dalamBodyPick) {
    dalamBodyCost = dalamBodyPick.cost;
    const status = dalamBodyPick.isUtuh ? '(Utuh)' : '(Sambung)';
    lapisanDalamBodyLine = `Lapisan body : ${dalamBodyPick.item.namaBahan}_${dalamBodyPick.sheets} lbr_${dalamBodyPick.item.ukuranPlano} cm_potong jadi ${cutDalamBody.p.toFixed(1)} x ${cutDalamBody.l.toFixed(1)} cm ${status}`;
  }

  let dalamTutupCost = 0;
  let lapisanDalamTutupLine = 'Lapisan tutup : Tidak menggunakan lapisan dalam tutup';
  if (dalamTutupPick) {
    dalamTutupCost = dalamTutupPick.cost;
    const status = dalamTutupPick.isUtuh ? '(Utuh)' : '(Sambung)';
    lapisanDalamTutupLine = `Lapisan tutup : ${dalamTutupPick.item.namaBahan}_${dalamTutupPick.sheets} lbr_${dalamTutupPick.item.ukuranPlano} cm_potong jadi ${cutDalamTutup.p.toFixed(1)} x ${cutDalamTutup.l.toFixed(1)} cm ${status}`;
  }

  const lapisanDalamCost = dalamBodyCost + dalamTutupCost;

  // STEP 3, 4, 5, 6, 7: Evaluasi Semua Metode Produksi & Semua Ukuran Bahan Lapisan Luar
  const outerBodyVariants = findPaperVariants(input.lBodyLuarName);
  const outerTutupVariants = findPaperVariants(input.lTutupLuarName);
  const hasOuterBody = outerBodyVariants.length > 0;
  const hasOuterTutup = outerTutupVariants.length > 0;

  const canonicalOuterName = formatCanonicalMaterialName(
    input.lBodyLuarName || input.lTutupLuarName || 'AP 150 Gr'
  );

  // Laminasi lookup & logic:
  // 1. Kondisi Laminasi Aktif: Hanya aktif jika lapisan menggunakan Art Paper 150 gr (AP 150 gr) atau AC 260 gr
  const bodyNeedsLaminasi =
    hasOuterBody && isLaminasiEligibleMaterial(input.lBodyLuarName);
  const tutupNeedsLaminasi =
    hasOuterTutup && isLaminasiEligibleMaterial(input.lTutupLuarName);
  const isLaminasiActive = bodyNeedsLaminasi || tutupNeedsLaminasi;

  const digitalLamItem =
    databases.laminasiItems.find((l) => l.type === 'Digital') ||
    databases.laminasiItems[0];
  const offsetLamItem =
    databases.laminasiItems.find((l) => l.type === 'Offset') ||
    databases.laminasiItems[0];

  const digLamDim = parseDimensions(digitalLamItem?.maxUkuran || '32 x 48');
  const digLamMaxW = Math.max(digLamDim.w || 48, digLamDim.h || 32);
  const digLamMaxH = Math.min(digLamDim.w || 48, digLamDim.h || 32);
  const digLamRate = parseRupiahNumber(digitalLamItem?.harga || 'Rp 2.000') || 2000;
  const digLamMinCost =
    parseRupiahNumber(digitalLamItem?.biayaMinimum || 'Rp 2.000') || 2000;

  const lamOffsetMinCost =
    parseRupiahNumber(offsetLamItem?.biayaMinimum || 'Rp 130.000') || 130000;
  const lamOffsetRate = parseRupiahNumber(offsetLamItem?.harga || '0.19') || 0.19;

  let sharedLaminasiCost = 0;
  let sharedLaminasiLabel = '';

  if (isLaminasiActive) {
    // Hitung biaya Laminasi Offset berdasarkan area lapisan yang menggunakan AP 150 gr / AC 260 gr
    const areaBody = bodyNeedsLaminasi ? cutLuarBody.p * cutLuarBody.l * safeQty : 0;
    const areaTutup = tutupNeedsLaminasi ? cutLuarTutup.p * cutLuarTutup.l * safeQty : 0;
    const rawOffsetLamCost = Math.round((areaBody + areaTutup) * lamOffsetRate);
    const offsetLamCost = Math.max(lamOffsetMinCost, rawOffsetLamCost);

    // 2. Prioritas Digital: Cek apakah ukuran potong memenuhi syarat area Laminasi Digital (32 x 48 cm)
    const fitLamBody = bodyNeedsLaminasi
      ? calcPlanoFit(digLamMaxW, digLamMaxH, cutLuarBody.p, cutLuarBody.l)
      : 1;
    const fitLamTutup = tutupNeedsLaminasi
      ? calcPlanoFit(digLamMaxW, digLamMaxH, cutLuarTutup.p, cutLuarTutup.l)
      : 1;
    const ukuranMemenuhiSyaratDigital = fitLamBody >= 1 && fitLamTutup >= 1;

    if (ukuranMemenuhiSyaratDigital) {
      const sheetsLamBody = bodyNeedsLaminasi ? Math.ceil(safeQty / fitLamBody) : 0;
      const sheetsLamTutup = tutupNeedsLaminasi ? Math.ceil(safeQty / fitLamTutup) : 0;
      const totalSheetsLamDigital = sheetsLamBody + sheetsLamTutup;
      const digitalLamCost = Math.max(
        digLamMinCost,
        totalSheetsLamDigital * digLamRate
      );

      // 3. Batas Harga Digital: Jika <= Rp 130.000 dan ukuran memenuhi syarat, gunakan harga digital.
      // Jika > Rp 130.000, rekomendasikan laminasi offset.
      if (digitalLamCost <= 130000) {
        sharedLaminasiCost = digitalLamCost;
        sharedLaminasiLabel = 'Laminasi (Digital)';
      } else {
        sharedLaminasiCost = offsetLamCost;
        sharedLaminasiLabel = 'Laminasi (Offset)';
      }
    } else {
      // Ukuran tidak memenuhi syarat digital -> gunakan Laminasi Offset
      sharedLaminasiCost = offsetLamCost;
      sharedLaminasiLabel = 'Laminasi (Offset)';
    }
  }

  // Aturan Cetak Lapisan Luar:
  // - AP 150 gr → bisa Digital A3+ dan/atau Offset (bandingkan, pilih termurah)
  // - Bahan lain (RCP, Jasmine, Concorde, Linen, dll) → TIDAK PERLU CETAK.
  //   Kertas fancy/dekoratif sudah berwarna/bertekstur, jadi hanya biaya kertas saja
  //   yang dihitung, menggunakan ukuran plano asli bahan (mis. RCP → 109 x 79 cm).
  const outerBodyNeedsPrint = hasOuterBody && isDigitalPrintEligible(input.lBodyLuarName);
  const outerTutupNeedsPrint = hasOuterTutup && isDigitalPrintEligible(input.lTutupLuarName);
  const isOuterPrintNeeded = outerBodyNeedsPrint || outerTutupNeedsPrint;

  const printComparisons: PrintComparisonOption[] = [];

  if (!isOuterPrintNeeded && (hasOuterBody || hasOuterTutup)) {
    // =====================================================================
    // BAHAN NON-AP150: TANPA CETAK – Hanya biaya kertas (plano asli)
    // =====================================================================
    const outerBodyPick = hasOuterBody
      ? pickCheapestMaterialVariant(
          outerBodyVariants.filter((v) => parseRupiahNumber(v.hargaLembar) > 0),
          cutLuarBody.p,
          cutLuarBody.l,
          safeQty
        )
      : null;
    const outerTutupPick = hasOuterTutup
      ? pickCheapestMaterialVariant(
          outerTutupVariants.filter((v) => parseRupiahNumber(v.hargaLembar) > 0),
          cutLuarTutup.p,
          cutLuarTutup.l,
          safeQty
        )
      : null;

    const outerBodyPaperCost = outerBodyPick?.cost || 0;
    const outerTutupPaperCost = outerTutupPick?.cost || 0;
    const totalPaperOnlyCost = outerBodyPaperCost + outerTutupPaperCost;

    const planoSizeLabel =
      outerBodyPick?.item.ukuranPlano || outerTutupPick?.item.ukuranPlano || '-';
    const totalSheets = (outerBodyPick?.sheets || 0) + (outerTutupPick?.sheets || 0);

    const bodyFitInfo = outerBodyPick
      ? `${outerBodyPick.fit}-up (${outerBodyPick.isUtuh ? 'Utuh' : 'Sambung'})`
      : '-';
    const tutupFitInfo = outerTutupPick
      ? `${outerTutupPick.fit}-up (${outerTutupPick.isUtuh ? 'Utuh' : 'Sambung'})`
      : '-';

    printComparisons.push({
      label: 'Tanpa Cetak',
      detail: `[Kertas ${canonicalOuterName} — tanpa proses cetak]`,
      formatUkuran: `Plano ${planoSizeLabel} cm (ukuran asli bahan)`,
      metode: 'Tanpa Cetak (Kertas Dekoratif)',
      layoutInfo:
        hasOuterBody && hasOuterTutup
          ? `Body ${bodyFitInfo}, Tutup ${tutupFitInfo}`
          : hasOuterBody
          ? `Body ${bodyFitInfo}`
          : `Tutup ${tutupFitInfo}`,
      kebutuhanLembar: `${totalSheets} lembar plano ${planoSizeLabel} cm`,
      totalCost: totalPaperOnlyCost,
      cetakCost: 0,
      paperCost: totalPaperOnlyCost,
      laminasiCost: 0,
      laminasiLabel: '',
      isValid: true,
      isRecommended: true,
      bodySheetLine: hasOuterBody && outerBodyPick
        ? `Lapisan body : ${canonicalOuterName}_${outerBodyPick.sheets} lbr_${outerBodyPick.item.ukuranPlano} cm_potong jadi ${cutLuarBody.p.toFixed(1)} x ${cutLuarBody.l.toFixed(1)} cm (1 plano muat ${outerBodyPick.fit} pcs) ${outerBodyPick.isUtuh ? '(Utuh)' : '(Sambung)'}`
        : 'Lapisan body : Tidak menggunakan lapisan luar body',
      tutupSheetLine: hasOuterTutup && outerTutupPick
        ? `Lapisan tutup : ${canonicalOuterName}_${outerTutupPick.sheets} lbr_${outerTutupPick.item.ukuranPlano} cm_potong jadi ${cutLuarTutup.p.toFixed(1)} x ${cutLuarTutup.l.toFixed(1)} cm (1 plano muat ${outerTutupPick.fit} pcs) ${outerTutupPick.isUtuh ? '(Utuh)' : '(Sambung)'}`
        : 'Lapisan tutup : Tidak menggunakan lapisan luar tutup',
    });

    // Override: Bahan non-AP150 tidak memerlukan laminasi
    sharedLaminasiCost = 0;
    sharedLaminasiLabel = '';
  } else {
    // =====================================================================
    // BAHAN AP 150 gr: Cetak Digital + Offset (bandingkan, pilih termurah)
    // Khusus model Buka Tutup (Terpisah/Full): evaluasi Utuh, Sambungan 3, Sambungan 5
    // =====================================================================

    /**
     * Apakah model ini termasuk Buka Tutup (Terpisah atau Full)
     * Jika ya, logika sambungan 3 dan 5 diaktifkan.
     */
    const isBukaTutupModel =
      model?.id === 'rumus-1' || model?.id === 'rumus-7' ||
      (model?.modelBox || '').toLowerCase().includes('buka tutup');

    /**
     * -----------------------------------------------------------------------
     * RUMUS SAMBUNGAN KHUSUS MODEL BUKA TUTUP PISAH (dari gambar referensi)
     * -----------------------------------------------------------------------
     * Sambungan 3 – Pemecahan 3 bagian:
     *   Lapisan Luar Tutup : [P+0.6] | [L+0.6+Tt+4] & [T+4] (×2)
     *   Lapisan Dalam Tutup: [P+0.6] | [L+0.6+Tt]   & [T]   (×2)
     *   Lapisan Luar Body  : [P]     | [L+T+4]       & [T+4] (×2)
     *   Lapisan Dalam Body : [P]     | [L+T]         & [T]   (×2)
     *
     * Sambungan 5 – Pemecahan 5 bagian (fallback jika sambungan 3 tidak muat):
     *   Lapisan Luar Tutup : [P+0.6] | [L+0.6+Tt+4] & [T+4] (×2) & [P] (×2)
     *   Lapisan Dalam Tutup: [P+0.6] | [L+0.6+Tt]   & [T]   (×2) & [P] (×2)
     *   Lapisan Luar Body  : [P]     | [L+T+4]       & [T+4] (×2) & [P+4] (×2)
     *   Lapisan Dalam Body : [P]     | [L+T]         & [T]   (×2) & [P]   (×2)
     * -----------------------------------------------------------------------
     */

    /** Dimensi potongan sambungan untuk model Buka Tutup */
    interface SambunganPieceSet {
      /** Bagian-bagian potongan. Setiap elemen = [panjang, lebar] dalam cm */
      pieces: Array<{ p: number; l: number; qty: number; label: string }>;
      /** Jumlah total lembar yang dibutuhkan dari setiap potongan dikalikan qty */
      totalSheets: number;
      /** Rincian teks sambungan */
      parts: string[];
    }

    /**
     * Hitung dimensi potongan sambungan untuk satu komponen (body atau tutup)
     * sesuai rumus referensi.
     */
    const buildSambunganPieces = (
      komponen: 'body' | 'tutup',
      metode: 'sambungan-3' | 'sambungan-5',
      qty: number
    ): SambunganPieceSet => {
      if (komponen === 'tutup') {
        const pTutup = P + 0.6;
        const lTutup = L + 0.6;
        const tTutup = Tt;

        if (metode === 'sambungan-3') {
          // Sambung 3 Tutup Luar:
          // P+0.6 | L+0.6+0.6+T+T+4 & T+4 | L+4 (x2)
          const pot1P = pTutup;
          const pot1L = lTutup + 0.6 + 2 * tTutup + 4;
          const pot2P = tTutup + 4;
          const pot2L = lTutup + 4;

          const luarParts = [
            `Pot 1 (Tengah): ${pot1P.toFixed(1)} × ${pot1L.toFixed(1)} cm (${qty} lbr)`,
            `Pot 2+3 (Samping ×2): ${pot2P.toFixed(1)} × ${pot2L.toFixed(1)} cm (${qty * 2} lbr)`,
          ];

          return {
            pieces: [
              { p: pot1P, l: pot1L, qty, label: 'Tutup Pot.1 (Tengah)' },
              { p: pot2P, l: pot2L, qty: qty * 2, label: 'Tutup Pot.2+3 (Samping ×2)' },
            ],
            totalSheets: qty + qty * 2,
            parts: luarParts,
          };
        } else {
          // Sambung 5 Tutup Luar:
          // P+0.6 | L+0.6 & T+4 | L+4 (x2) & T+4 | P (x2)
          const pot1P = pTutup;
          const pot1L = lTutup;
          const pot2P = tTutup + 4;
          const pot2L = lTutup + 4;
          const pot3P = tTutup + 4;
          const pot3L = pTutup + 3.4; // P + 4 cm margin

          const luarParts = [
            `Pot 1 (Muka): ${pot1P.toFixed(1)} × ${pot1L.toFixed(1)} cm (${qty} lbr)`,
            `Pot 2+3 (Sisi L ×2): ${pot2P.toFixed(1)} × ${pot2L.toFixed(1)} cm (${qty * 2} lbr)`,
            `Pot 4+5 (Sisi P ×2): ${pot3P.toFixed(1)} × ${pot3L.toFixed(1)} cm (${qty * 2} lbr)`,
          ];

          return {
            pieces: [
              { p: pot1P, l: pot1L, qty, label: 'Tutup Pot.1 (Muka)' },
              { p: pot2P, l: pot2L, qty: qty * 2, label: 'Tutup Pot.2+3 (Sisi L ×2)' },
              { p: pot3P, l: pot3L, qty: qty * 2, label: 'Tutup Pot.4+5 (Sisi P ×2)' },
            ],
            totalSheets: qty + qty * 2 + qty * 2,
            parts: luarParts,
          };
        }
      } else {
        // Komponen BODY
        const pBody = P;
        const lBody = L;
        const tBody = T;

        if (metode === 'sambungan-3') {
          // Sambung 3 Body Luar:
          // P | L+T+T+4 & T+4 | L+4 (x2)
          const pot1P = pBody;
          const pot1L = lBody + 2 * tBody + 4;
          const pot2P = tBody + 4;
          const pot2L = lBody + 4;

          const luarParts = [
            `Pot 1 (Tengah): ${pot1P.toFixed(1)} × ${pot1L.toFixed(1)} cm (${qty} lbr)`,
            `Pot 2+3 (Samping ×2): ${pot2P.toFixed(1)} × ${pot2L.toFixed(1)} cm (${qty * 2} lbr)`,
          ];

          return {
            pieces: [
              { p: pot1P, l: pot1L, qty, label: 'Body Pot.1 (Tengah)' },
              { p: pot2P, l: pot2L, qty: qty * 2, label: 'Body Pot.2+3 (Samping ×2)' },
            ],
            totalSheets: qty + qty * 2,
            parts: luarParts,
          };
        } else {
          // Sambung 5 Body Luar:
          // P | L & T+4 | L+4 (x2) & T+4 | P+4 (x2)
          const pot1P = pBody;
          const pot1L = lBody;
          const pot2P = tBody + 4;
          const pot2L = lBody + 4;
          const pot3P = tBody + 4;
          const pot3L = pBody + 4;

          const luarParts = [
            `Pot 1 (Muka): ${pot1P.toFixed(1)} × ${pot1L.toFixed(1)} cm (${qty} lbr)`,
            `Pot 2+3 (Sisi L ×2): ${pot2P.toFixed(1)} × ${pot2L.toFixed(1)} cm (${qty * 2} lbr)`,
            `Pot 4+5 (Sisi P ×2): ${pot3P.toFixed(1)} × ${pot3L.toFixed(1)} cm (${qty * 2} lbr)`,
          ];

          return {
            pieces: [
              { p: pot1P, l: pot1L, qty, label: 'Body Pot.1 (Muka)' },
              { p: pot2P, l: pot2L, qty: qty * 2, label: 'Body Pot.2+3 (Sisi L ×2)' },
              { p: pot3P, l: pot3L, qty: qty * 2, label: 'Body Pot.4+5 (Sisi P ×2)' },
            ],
            totalSheets: qty + qty * 2 + qty * 2,
            parts: luarParts,
          };
        }
      }
    };

    /**
     * Hitung biaya kertas plano untuk potongan sambungan dari satu plano kandidat.
     * Setiap potongan dihitung independen (fit per plano × lembar yang dibutuhkan).
     */
    const calcSambunganPaperCost = (
      pieces: Array<{ p: number; l: number; qty: number }>,
      planoItem: MaterialItem
    ): number => {
      const pDim = parseDimensions(planoItem.ukuranPlano);
      const pPrice = parseRupiahNumber(planoItem.hargaLembar) || 2900;
      let totalCostLocal = 0;
      for (const piece of pieces) {
        const fit = Math.max(1, calcPlanoFit(pDim.w, pDim.h, piece.p, piece.l));
        const sheets = Math.ceil(piece.qty / fit);
        totalCostLocal += sheets * pPrice;
      }
      return Math.round(totalCostLocal);
    };

    /**
     * Periksa apakah SEMUA potongan sambungan muat di area cetak mesin
     * (untuk validasi teknis)
     */
    const allPiecesFitMachine = (
      pieces: Array<{ p: number; l: number }>,
      mMaxW: number,
      mMinH: number
    ): boolean =>
      pieces.every(
        (pc) =>
          Math.max(pc.p, pc.l) <= mMaxW && Math.min(pc.p, pc.l) <= mMinH
      );

    // ---- Data mesin Digital ----
    const digitalMachine = databases.digitalItems[0];
    const digitalRawDim = parseDimensions(digitalMachine?.ukuranArea || '32 x 48');
    const digMaxW = Math.max(digitalRawDim.w, digitalRawDim.h) - 0.5; // 47.5 cm
    const digMaxH = Math.min(digitalRawDim.w, digitalRawDim.h) - 0.5; // 31.5 cm
    const digitalRate = parseRupiahNumber(digitalMachine?.hargaCetak || 'Rp 2.000');


    // =====================================================================
    // DIGITAL: Evaluasi Utuh vs Sambungan 3 vs Sambungan 5 (Model Buka Tutup)
    // Ketentuan:
    // 1. Jika Digital UTUH (semua lapisan luar muat utuh di A3+):
    //    - Perhitungan sambungan 3 dan 5 TIDAK BERFUNGSI (tidak dihitung)
    //    - Kata/opsi "utuh" pada digital tidak perlu ditampilkan (cukup label "Digital")
    // 2. Jika Digital TIDAK UTUH:
    //    - Opsi utuh pada digital TIDAK PERLU DITAMPILKAN
    //    - Rekomendasi sambungan 3 dan 5 AKTIF (dievaluasi dan ditampilkan jika muat)
    // =====================================================================
    if (isBukaTutupModel && (hasOuterBody || hasOuterTutup)) {
      // Periksa apakah lembaran luar muat UTUH di area cetak Digital A3+ (fit >= 1 tanpa sambung)
      const bodyUtuhFit = hasOuterBody
        ? calcPlanoFit(digMaxW, digMaxH, cutLuarBody.p, cutLuarBody.l)
        : 1;
      const tutupUtuhFit = hasOuterTutup
        ? calcPlanoFit(digMaxW, digMaxH, cutLuarTutup.p, cutLuarTutup.l)
        : 1;

      const isDigitalUtuh =
        (!hasOuterBody || bodyUtuhFit >= 1) &&
        (!hasOuterTutup || tutupUtuhFit >= 1);

      if (isDigitalUtuh) {
        // -----------------------------------------------------------------
        // KONDISI 1: DIGITAL UTUH
        // - Sambungan 3 dan 5 TIDAK BERFUNGSI (tidak dihitung / tidak ditampilkan)
        // - Tampilkan Digital standar tanpa embel-embel "utuh"
        // -----------------------------------------------------------------
        const digBodySheets = hasOuterBody ? Math.ceil(safeQty / bodyUtuhFit) : 0;
        const digTutupSheets = hasOuterTutup ? Math.ceil(safeQty / tutupUtuhFit) : 0;
        const totalSheets = digBodySheets + digTutupSheets;
        const totalClicks = totalSheets;
        const printCost = totalClicks * digitalRate;
        const totalCost = printCost + sharedLaminasiCost;

        const layoutDesc =
          hasOuterBody && hasOuterTutup
            ? `Body ${bodyUtuhFit}-up, Tutup ${tutupUtuhFit}-up`
            : `${Math.max(bodyUtuhFit, tutupUtuhFit)}-up`;

        printComparisons.push({
          label: 'Digital',
          detail: `[${totalClicks} klik A3+]`,
          formatUkuran: `A3+ (${digitalMachine?.ukuranArea || '32 x 48'} cm)`,
          metode: digitalMachine?.namaMesin || 'Digital A3+',
          layoutInfo: layoutDesc,
          kebutuhanLembar: `${totalSheets} lembar A3+ (${totalClicks} klik cetak)`,
          totalCost,
          cetakCost: printCost,
          paperCost: 0,
          laminasiCost: sharedLaminasiCost,
          laminasiLabel: sharedLaminasiLabel,
          isValid: true,
          isRecommended: false,
          bodySheetLine: hasOuterBody
            ? `Lapisan body : ${canonicalOuterName}_${digBodySheets} lbr A3+_${digMaxW.toFixed(1)} x ${digMaxH.toFixed(1)} cm_potong jadi ${cutLuarBody.p.toFixed(1)} x ${cutLuarBody.l.toFixed(1)} cm`
            : 'Lapisan body : Tidak menggunakan lapisan luar body',
          tutupSheetLine: hasOuterTutup
            ? `Lapisan tutup : ${canonicalOuterName}_${digTutupSheets} lbr A3+_${digMaxW.toFixed(1)} x ${digMaxH.toFixed(1)} cm_potong jadi ${cutLuarTutup.p.toFixed(1)} x ${cutLuarTutup.l.toFixed(1)} cm`
            : 'Lapisan tutup : Tidak menggunakan lapisan luar tutup',
          sambunganMethod: 'utuh',
          sambunganParts: [],
        });
      } else {
        // -----------------------------------------------------------------
        // KONDISI 2: DIGITAL TIDAK UTUH
        // - Digital Utuh TIDAK PERLU DITAMPILKAN
        // - Rekomendasi sambungan pada 3 - 5 AKTIF
        // -----------------------------------------------------------------
        type DigitalSambunganResult = {
          method: 'sambungan-3' | 'sambungan-5';
          isValid: boolean;
          totalClicks: number;
          totalSheets: number;
          printCost: number;
          totalCost: number;
          layoutDesc: string;
          bodyLine: string;
          tutupLine: string;
          parts: string[];
        };

        const evalDigitalSambungan = (
          method: 'sambungan-3' | 'sambungan-5'
        ): DigitalSambunganResult => {
          const bodyPieces = hasOuterBody
            ? buildSambunganPieces('body', method, safeQty)
            : null;
          const tutupPieces = hasOuterTutup
            ? buildSambunganPieces('tutup', method, safeQty)
            : null;

          // Validasi teknis: SEMUA potongan sambungan harus muat di Digital A3+ (fit >= 1)
          const allBodyFit =
            !bodyPieces ||
            bodyPieces.pieces.every(
              (pc) => calcPlanoFit(digMaxW, digMaxH, pc.p, pc.l) >= 1
            );
          const allTutupFit =
            !tutupPieces ||
            tutupPieces.pieces.every(
              (pc) => calcPlanoFit(digMaxW, digMaxH, pc.p, pc.l) >= 1
            );
          const isValid = allBodyFit && allTutupFit;

          // Hitung klik untuk tiap potongan yang muat
          const calcPieceClicks = (pc: { p: number; l: number; qty: number }) => {
            const fit = Math.max(1, calcPlanoFit(digMaxW, digMaxH, pc.p, pc.l));
            return Math.ceil(pc.qty / fit); // 1 lembar A3+ = 1 klik
          };

          const bodyClicks =
            bodyPieces && isValid
              ? bodyPieces.pieces.reduce(
                  (sum, pc) => sum + calcPieceClicks(pc),
                  0
                )
              : 0;
          const tutupClicks =
            tutupPieces && isValid
              ? tutupPieces.pieces.reduce(
                  (sum, pc) => sum + calcPieceClicks(pc),
                  0
                )
              : 0;

          const totalClicks = bodyClicks + tutupClicks;
          const bodySheets = bodyClicks;
          const tutupSheets = tutupClicks;

          const printCost = totalClicks * digitalRate;
          const totalCost = printCost + sharedLaminasiCost;

          const nBagian = method === 'sambungan-3' ? 3 : 5;
          const layoutDesc = `Sambungan ${nBagian} bagian — Body ${bodySheets} lbr, Tutup ${tutupSheets} lbr`;

          const allParts = [
            ...(bodyPieces?.parts.map((p) => `Body: ${p}`) || []),
            ...(tutupPieces?.parts.map((p) => `Tutup: ${p}`) || []),
          ];

          const bodyLineDetail = bodyPieces
            ? bodyPieces.pieces
                .map(
                  (pc) =>
                    `${pc.p.toFixed(1)}×${pc.l.toFixed(1)} cm (${pc.qty} lbr)`
                )
                .join(' + ')
            : '-';
          const tutupLineDetail = tutupPieces
            ? tutupPieces.pieces
                .map(
                  (pc) =>
                    `${pc.p.toFixed(1)}×${pc.l.toFixed(1)} cm (${pc.qty} lbr)`
                )
                .join(' + ')
            : '-';

          return {
            method,
            isValid,
            totalClicks,
            totalSheets: bodySheets + tutupSheets,
            printCost,
            totalCost,
            layoutDesc,
            bodyLine: hasOuterBody
              ? `Lapisan body : ${canonicalOuterName}_Sambungan ${nBagian}_A3+_${bodyLineDetail}`
              : 'Lapisan body : Tidak menggunakan lapisan luar body',
            tutupLine: hasOuterTutup
              ? `Lapisan tutup : ${canonicalOuterName}_Sambungan ${nBagian}_A3+_${tutupLineDetail}`
              : 'Lapisan tutup : Tidak menggunakan lapisan luar tutup',
            parts: allParts,
          };
        };

        const sambunganResults = (['sambungan-3', 'sambungan-5'] as const)
          .map(evalDigitalSambungan)
          .filter((r) => r.isValid);

        // Tambahkan semua opsi sambungan digital yang valid ke printComparisons
        sambunganResults.forEach((res) => {
          const methodLabel =
            res.method === 'sambungan-3' ? 'Sambungan 3' : 'Sambungan 5';
          printComparisons.push({
            label: `Digital (${methodLabel})`,
            detail: `[${res.totalClicks} klik A3+ — ${methodLabel} bagian]`,
            formatUkuran: `A3+ (${digitalMachine?.ukuranArea || '32 x 48'} cm)`,
            metode: `Digital A3+ — ${methodLabel}`,
            layoutInfo: res.layoutDesc,
            kebutuhanLembar: `${res.totalSheets} lembar A3+ (${res.totalClicks} klik cetak)`,
            totalCost: res.totalCost,
            cetakCost: res.printCost,
            paperCost: 0,
            laminasiCost: sharedLaminasiCost,
            laminasiLabel: sharedLaminasiLabel,
            isValid: true,
            isRecommended: false,
            bodySheetLine: res.bodyLine,
            tutupSheetLine: res.tutupLine,
            sambunganMethod: res.method,
            sambunganParts: res.parts,
          });
        });
      }
    } else {
      // Model non-Buka Tutup: logika digital lama (utuh/sambung sederhana)
      const calcDigitalPiece = (pieceW: number, pieceH: number) => {
        const maxSide = Math.max(pieceW, pieceH);
        const minSide = Math.min(pieceW, pieceH);
        const fit = calcPlanoFit(digMaxW, digMaxH, pieceW, pieceH);
        if (fit >= 1) {
          const sheets = Math.ceil(safeQty / fit);
          return { fit, sheets, clicks: sheets, status: 'utuh', isValid: true };
        }
        if (maxSide <= digMaxW + 15) {
          const overflow = Math.max(0, Math.ceil(minSide - digMaxH + 1.5));
          const sambungCm = Math.max(3, overflow);
          const extraClicks = Math.ceil(safeQty * (sambungCm / 12.5));
          const totalClicks = safeQty + extraClicks;
          const areaRatio = (maxSide * minSide) / (digMaxW * digMaxH * 1.152);
          const effectiveSheets = Math.ceil(safeQty * areaRatio);
          return { fit: 1, sheets: effectiveSheets, clicks: totalClicks, status: `sambung ${sambungCm}`, isValid: true };
        }
        return { fit: 0, sheets: 0, clicks: 0, status: 'tidak muat', isValid: false };
      };

      const digBody = hasOuterBody
        ? calcDigitalPiece(cutLuarBody.p, cutLuarBody.l)
        : { fit: 1, sheets: 0, clicks: 0, status: 'utuh', isValid: true };
      const digTutup = hasOuterTutup
        ? calcDigitalPiece(cutLuarTutup.p, cutLuarTutup.l)
        : { fit: 1, sheets: 0, clicks: 0, status: 'utuh', isValid: true };

      if (digBody.isValid && digTutup.isValid) {
        const totalDigitalClicks = digBody.clicks + digTutup.clicks;
        const digitalPrintCost = totalDigitalClicks * digitalRate;
        const digitalTotalOptionCost = digitalPrintCost + sharedLaminasiCost;
        const digLayoutDesc =
          hasOuterBody && hasOuterTutup
            ? `Body ${digBody.fit}-up (${digBody.status}), Tutup ${digTutup.fit}-up (${digTutup.status})`
            : `${Math.max(digBody.fit, digTutup.fit)}-up`;
        printComparisons.push({
          label: 'Digital',
          detail: `[${totalDigitalClicks} klik A3+]`,
          formatUkuran: `A3+ (${digitalMachine?.ukuranArea || '32 x 48'} cm)`,
          metode: digitalMachine?.namaMesin || 'Digital A3+',
          layoutInfo: digLayoutDesc,
          kebutuhanLembar: `${digBody.sheets + digTutup.sheets} lembar A3+ (${totalDigitalClicks} klik cetak)`,
          totalCost: digitalTotalOptionCost,
          cetakCost: digitalPrintCost,
          paperCost: 0,
          laminasiCost: sharedLaminasiCost,
          laminasiLabel: sharedLaminasiLabel,
          isValid: true,
          isRecommended: false,
          bodySheetLine: hasOuterBody
            ? `Lapisan body : ${canonicalOuterName}_${digBody.sheets} lbr A3+_${digMaxW.toFixed(1)} x ${digMaxH.toFixed(1)} cm_potong jadi ${cutLuarBody.p.toFixed(1)} x ${cutLuarBody.l.toFixed(1)} cm (digital) ${digBody.status}`
            : 'Lapisan body : Tidak menggunakan lapisan luar body',
          tutupSheetLine: hasOuterTutup
            ? `Lapisan tutup : ${canonicalOuterName}_${digTutup.sheets} lbr A3+_${digMaxW.toFixed(1)} x ${digMaxH.toFixed(1)} cm_potong jadi ${cutLuarTutup.p.toFixed(1)} x ${cutLuarTutup.l.toFixed(1)} cm (digital) ${digTutup.status}`
            : 'Lapisan tutup : Tidak menggunakan lapisan luar tutup',
        });
      }
    }

    // Candidates: Offset Machines – dievaluasi untuk semua ukuran plano yang tersedia
    const planoPaperCandidates = [...outerBodyVariants, ...outerTutupVariants].filter(
      (p) => parseRupiahNumber(p.hargaLembar) > 0
    );
    // Deduplicate plano sizes
    const uniquePlanoCandidates: MaterialItem[] = [];
    const seenPlanos = new Set<string>();
    for (const p of planoPaperCandidates) {
      const k = `${p.ukuranPlano}-${p.hargaLembar}`;
      if (!seenPlanos.has(k)) {
        seenPlanos.add(k);
        uniquePlanoCandidates.push(p);
      }
    }
    if (uniquePlanoCandidates.length === 0 && databases.kertasStdItems.length > 0) {
      const fallbackStd = databases.kertasStdItems.filter(
        (k) => parseRupiahNumber(k.hargaLembar) > 0
      );
      uniquePlanoCandidates.push(...fallbackStd);
    }

    databases.offsetItems.forEach((offMachine) => {
      const mDim = parseDimensions(offMachine.ukuranAreaCetak);
      const mMaxW = Math.max(mDim.w, mDim.h);
      const mMinH = Math.min(mDim.w, mDim.h);
      const biayaPerPage = parseRupiahNumber(offMachine.biayaCetak) || 500000;
      const lebihDrukRate = offMachine.lebihDruk.includes('30') ? 30 : 25;

      // -----------------------------------------------------------------------
      // Untuk model Buka Tutup: evaluasi Utuh, Sambungan 3, Sambungan 5
      // -----------------------------------------------------------------------
      if (isBukaTutupModel && (hasOuterBody || hasOuterTutup)) {
        type OffsetMethodResult = {
          method: 'utuh' | 'sambungan-3' | 'sambungan-5';
          isValid: boolean;
          totalPages: number;
          totalPlanoPotong: number;
          paperCost: number;
          cetakCost: number;
          totalCost: number;
          layoutDesc: string;
          kebutuhanDesc: string;
          bodyLine: string;
          tutupLine: string;
          parts: string[];
          planoSize: string;
        };

        const evalOffsetMethod = (method: 'utuh' | 'sambungan-3' | 'sambungan-5'): OffsetMethodResult => {
          if (method === 'utuh') {
            // Metode utuh: validasi per komponen apakah muat di mesin
            const bodyFitsSingle =
              Math.max(cutLuarBody.p, cutLuarBody.l) <= mMaxW &&
              Math.min(cutLuarBody.p, cutLuarBody.l) <= mMinH;
            const tutupFitsSingle =
              Math.max(cutLuarTutup.p, cutLuarTutup.l) <= mMaxW &&
              Math.min(cutLuarTutup.p, cutLuarTutup.l) <= mMinH;

            // Jika salah satu tidak muat → tidak valid untuk metode utuh di mesin ini
            const isValidLocal =
              (!hasOuterBody || bodyFitsSingle) && (!hasOuterTutup || tutupFitsSingle);

            const machineFitBody = Math.max(1, calcPlanoFit(mMaxW, mMinH, cutLuarBody.p, cutLuarBody.l));
            const machineFitTutup = Math.max(1, calcPlanoFit(mMaxW, mMinH, cutLuarTutup.p, cutLuarTutup.l));

            const bodyPages = hasOuterBody ? (bodyFitsSingle ? 1 : 2) : 0;
            const tutupPages = hasOuterTutup ? (tutupFitsSingle ? 1 : 2) : 0;
            const totalPages = Math.max(1, bodyPages + tutupPages);

            // Pilih plano terbaik
            let bestOpt: {
              planoItem: MaterialItem;
              pFitBody: number; pFitTutup: number;
              rBody: number; rTutup: number;
              totalPlanoPotong: number; paperOffsetCost: number;
            } | null = null;

            for (const planoCand of uniquePlanoCandidates) {
              const pDim = parseDimensions(planoCand.ukuranPlano);
              const pPrice = parseRupiahNumber(planoCand.hargaLembar) || 2900;
              const pFitBody = Math.max(1, calcPlanoFit(pDim.w || 100, pDim.h || 65, cutLuarBody.p, cutLuarBody.l));
              const pFitTutup = Math.max(1, calcPlanoFit(pDim.w || 100, pDim.h || 65, cutLuarTutup.p, cutLuarTutup.l));
              const rBody = hasOuterBody ? Math.ceil(safeQty / pFitBody) : 0;
              const rTutup = hasOuterTutup ? Math.ceil(safeQty / pFitTutup) : 0;
              const basePlano = Math.max(safeQty, rBody + rTutup);
              const inschiet = totalPages === 2 ? 75 : totalPages * 25 + 50;
              const totalPlanoPotong = basePlano + inschiet;
              const paperOffsetCost = totalPages === 3
                ? Math.round((totalPlanoPotong / 275) * 220800 * (pPrice / 2900))
                : Math.round((totalPlanoPotong / 225) * 339000 * (pPrice / 2900));
              if (!bestOpt || paperOffsetCost < bestOpt.paperOffsetCost) {
                bestOpt = { planoItem: planoCand, pFitBody, pFitTutup, rBody, rTutup, totalPlanoPotong, paperOffsetCost };
              }
            }

            if (!bestOpt) return { method, isValid: false, totalPages: 0, totalPlanoPotong: 0, paperCost: 0, cetakCost: 0, totalCost: 0, layoutDesc: '', kebutuhanDesc: '', bodyLine: '', tutupLine: '', parts: [], planoSize: '' };

            const extraDruk = safeQty > 2000 ? (safeQty - 2000) * lebihDrukRate * totalPages : 0;
            const cetakCostLocal = totalPages * biayaPerPage + extraDruk;
            const totalCostLocal = cetakCostLocal + sharedLaminasiCost + bestOpt.paperOffsetCost;

            const planoSize = bestOpt.planoItem.ukuranPlano;
            return {
              method,
              isValid: isValidLocal,
              totalPages,
              totalPlanoPotong: bestOpt.totalPlanoPotong,
              paperCost: bestOpt.paperOffsetCost,
              cetakCost: cetakCostLocal,
              totalCost: totalCostLocal,
              layoutDesc: `Utuh — Body ${bestOpt.pFitBody}-up/plano (${machineFitBody}-up/plat), Tutup ${bestOpt.pFitTutup}-up/plano (${machineFitTutup}-up/plat)`,
              kebutuhanDesc: `${bestOpt.totalPlanoPotong} lembar plano potong (${totalPages} Page, Utuh)`,
              bodyLine: hasOuterBody
                ? `Lapisan body : ${canonicalOuterName}_${bestOpt.rBody} lbr plano_${planoSize} cm_potong jadi ${cutLuarBody.p.toFixed(1)} x ${cutLuarBody.l.toFixed(1)} cm (offset ${offMachine.mesinCetak} utuh — 1 plano muat ${bestOpt.pFitBody} pcs)`
                : 'Lapisan body : Tidak menggunakan lapisan luar body',
              tutupLine: hasOuterTutup
                ? `Lapisan tutup : ${canonicalOuterName}_${bestOpt.rTutup} lbr plano_${planoSize} cm_potong jadi ${cutLuarTutup.p.toFixed(1)} x ${cutLuarTutup.l.toFixed(1)} cm (offset ${offMachine.mesinCetak} utuh — 1 plano muat ${bestOpt.pFitTutup} pcs)`
                : 'Lapisan tutup : Tidak menggunakan lapisan luar tutup',
              parts: [],
              planoSize,
            };
          } else {
            // Sambungan 3 atau 5
            const nBagian = method === 'sambungan-3' ? 3 : 5;
            const bodyPieces = hasOuterBody ? buildSambunganPieces('body', method, safeQty) : null;
            const tutupPieces = hasOuterTutup ? buildSambunganPieces('tutup', method, safeQty) : null;

            // Validasi: semua potongan harus muat di area mesin offset
            const allBodyFit = !bodyPieces || allPiecesFitMachine(bodyPieces.pieces, mMaxW, mMinH);
            const allTutupFit = !tutupPieces || allPiecesFitMachine(tutupPieces.pieces, mMaxW, mMinH);
            const isValidLocal = allBodyFit && allTutupFit;

            // Hitung page: setiap potongan unik = 1 page
            const bodyPageCount = bodyPieces ? bodyPieces.pieces.length : 0;
            const tutupPageCount = tutupPieces ? tutupPieces.pieces.length : 0;
            const totalPages = Math.max(1, bodyPageCount + tutupPageCount);

            // Pilih plano terbaik: hitung biaya kertas untuk semua potongan sambungan
            let bestOpt2: {
              planoItem: MaterialItem;
              paperCostLocal: number;
              totalPlanoPotong: number;
            } | null = null;

            for (const planoCand of uniquePlanoCandidates) {
              const allPieces = [
                ...(bodyPieces?.pieces || []),
                ...(tutupPieces?.pieces || []),
              ];
              const paperCostLocal = calcSambunganPaperCost(allPieces, planoCand);
              // Estimasi total plano potong (jumlah semua lembar potongan + inschiet)
              const totalPlanoEst = allPieces.reduce((sum, pc) => {
                const pDim = parseDimensions(planoCand.ukuranPlano);
                const fit = Math.max(1, calcPlanoFit(pDim.w, pDim.h, pc.p, pc.l));
                return sum + Math.ceil(pc.qty / fit);
              }, 0) + totalPages * 25 + 50;

              if (!bestOpt2 || paperCostLocal < bestOpt2.paperCostLocal) {
                bestOpt2 = { planoItem: planoCand, paperCostLocal, totalPlanoPotong: totalPlanoEst };
              }
            }

            if (!bestOpt2) return { method, isValid: false, totalPages: 0, totalPlanoPotong: 0, paperCost: 0, cetakCost: 0, totalCost: 0, layoutDesc: '', kebutuhanDesc: '', bodyLine: '', tutupLine: '', parts: [], planoSize: '' };

            const extraDruk = safeQty > 2000 ? (safeQty - 2000) * lebihDrukRate * totalPages : 0;
            const cetakCostLocal = totalPages * biayaPerPage + extraDruk;
            const totalCostLocal = cetakCostLocal + sharedLaminasiCost + bestOpt2.paperCostLocal;

            const planoSize = bestOpt2.planoItem.ukuranPlano;

            const bodyLineDetail = bodyPieces
              ? bodyPieces.pieces.map((pc) => `${pc.p.toFixed(1)}×${pc.l.toFixed(1)} cm (${pc.qty} lbr)`).join(' + ')
              : '-';
            const tutupLineDetail = tutupPieces
              ? tutupPieces.pieces.map((pc) => `${pc.p.toFixed(1)}×${pc.l.toFixed(1)} cm (${pc.qty} lbr)`).join(' + ')
              : '-';

            const allParts = [
              ...(bodyPieces?.parts.map((p) => `Body: ${p}`) || []),
              ...(tutupPieces?.parts.map((p) => `Tutup: ${p}`) || []),
            ];

            return {
              method,
              isValid: isValidLocal,
              totalPages,
              totalPlanoPotong: bestOpt2.totalPlanoPotong,
              paperCost: bestOpt2.paperCostLocal,
              cetakCost: cetakCostLocal,
              totalCost: totalCostLocal,
              layoutDesc: `Sambungan ${nBagian} — ${totalPages} page (body ${bodyPageCount} page, tutup ${tutupPageCount} page)`,
              kebutuhanDesc: `${bestOpt2.totalPlanoPotong} lembar plano potong (${totalPages} Page, Sambungan ${nBagian})`,
              bodyLine: hasOuterBody
                ? `Lapisan body : ${canonicalOuterName}_Sambungan ${nBagian}_plano ${planoSize} cm_${bodyLineDetail}`
                : 'Lapisan body : Tidak menggunakan lapisan luar body',
              tutupLine: hasOuterTutup
                ? `Lapisan tutup : ${canonicalOuterName}_Sambungan ${nBagian}_plano ${planoSize} cm_${tutupLineDetail}`
                : 'Lapisan tutup : Tidak menggunakan lapisan luar tutup',
              parts: allParts,
              planoSize,
            };
          }
        };

        // Evaluasi metode untuk mesin Offset ini sesuai aturan Buka Tutup:
        // Jika pada mesin offset (52 atau 58) UTUH valid, maka rekomendasi sambungan 3 dan 5 TIDAK AKTIF.
        // Sambungan 3 dan 5 hanya aktif jika mesin offset ini TIDAK bisa mencetak secara utuh.
        const utuhResult = evalOffsetMethod('utuh');
        const offResults: OffsetMethodResult[] = [];

        if (utuhResult.isValid) {
          // Mesin ini bisa cetak utuh -> sambungan 3 dan 5 tidak aktif
          offResults.push(utuhResult);
        } else {
          // Mesin ini tidak bisa cetak utuh -> evaluasi rekomendasi sambungan 3 dan 5
          const sambunganResults = (['sambungan-3', 'sambungan-5'] as const)
            .map(evalOffsetMethod)
            .filter((r) => r.isValid);
          offResults.push(...sambunganResults);
        }

        // Urutkan dari termurah
        offResults.sort((a, b) => a.totalCost - b.totalCost);

        // Tambahkan semua alternatif yang aktif dan valid ke printComparisons
        offResults.forEach((res, idx) => {
          const methodLabel = res.method === 'utuh' ? 'Utuh' : res.method === 'sambungan-3' ? 'Sambungan 3' : 'Sambungan 5';
          const labelStr = `${offMachine.mesinCetak} (${methodLabel})`;
          printComparisons.push({
            label: labelStr,
            detail: `[${res.totalPages} Page — ${methodLabel} (${res.totalPlanoPotong} lbr plano)]`,
            formatUkuran: `Plano ${res.planoSize} cm (Area Mesin ${offMachine.ukuranAreaCetak} cm)`,
            metode: `Offset ${offMachine.mesinCetak} — ${methodLabel}`,
            layoutInfo: res.layoutDesc,
            kebutuhanLembar: res.kebutuhanDesc,
            totalCost: res.totalCost,
            cetakCost: res.cetakCost,
            paperCost: res.paperCost,
            laminasiCost: sharedLaminasiCost,
            laminasiLabel: sharedLaminasiLabel,
            isValid: true,
            isRecommended: false,
            bodySheetLine: res.bodyLine,
            tutupSheetLine: res.tutupLine,
            sambunganMethod: res.method,
            sambunganParts: res.parts,
          });
        });
      } else {
        // Model non-Buka Tutup: logika Offset lama
        const bodyFitsSingle =
          Math.max(cutLuarBody.p, cutLuarBody.l) <= mMaxW &&
          Math.min(cutLuarBody.p, cutLuarBody.l) <= mMinH;
        const tutupFitsSingle =
          Math.max(cutLuarTutup.p, cutLuarTutup.l) <= mMaxW &&
          Math.min(cutLuarTutup.p, cutLuarTutup.l) <= mMinH;

        const machineFitBody = Math.max(1, calcPlanoFit(mMaxW, mMinH, cutLuarBody.p, cutLuarBody.l));
        const machineFitTutup = Math.max(1, calcPlanoFit(mMaxW, mMinH, cutLuarTutup.p, cutLuarTutup.l));

        const bodyPages = hasOuterBody ? (bodyFitsSingle ? 1 : 2) : 0;
        const tutupPages = hasOuterTutup ? (tutupFitsSingle ? 1 : 2) : 0;
        const totalPages = Math.max(1, bodyPages + tutupPages);

        let bestPlanoOption: {
          planoItem: MaterialItem;
          planoFitBody: number;
          planoFitTutup: number;
          rawPlanoBody: number;
          rawPlanoTutup: number;
          totalPlanoPotong: number;
          paperOffsetCost: number;
        } | null = null;

        for (const planoCand of uniquePlanoCandidates) {
          const pDim = parseDimensions(planoCand.ukuranPlano);
          const pPrice = parseRupiahNumber(planoCand.hargaLembar) || 2900;
          const pFitBody = Math.max(1, calcPlanoFit(pDim.w || 100, pDim.h || 65, cutLuarBody.p, cutLuarBody.l));
          const pFitTutup = Math.max(1, calcPlanoFit(pDim.w || 100, pDim.h || 65, cutLuarTutup.p, cutLuarTutup.l));
          const rBody = hasOuterBody ? Math.ceil(safeQty / pFitBody) : 0;
          const rTutup = hasOuterTutup ? Math.ceil(safeQty / pFitTutup) : 0;
          const basePlano = Math.max(safeQty, rBody + rTutup);
          const inschietSheets = totalPages === 2 ? 75 : totalPages * 25 + 50;
          const totalPlanoPotong = basePlano + inschietSheets;
          const paperOffsetCost =
            totalPages === 3
              ? Math.round((totalPlanoPotong / 275) * 220800 * (pPrice / 2900))
              : Math.round((totalPlanoPotong / 225) * 339000 * (pPrice / 2900));
          if (!bestPlanoOption || paperOffsetCost < bestPlanoOption.paperOffsetCost) {
            bestPlanoOption = { planoItem: planoCand, planoFitBody: pFitBody, planoFitTutup: pFitTutup, rawPlanoBody: rBody, rawPlanoTutup: rTutup, totalPlanoPotong, paperOffsetCost };
          }
        }

        if (bestPlanoOption) {
          const extraDruk = safeQty > 2000 ? (safeQty - 2000) * lebihDrukRate * totalPages : 0;
          const cetakOffsetCost = totalPages * biayaPerPage + extraDruk;
          const offsetTotalCost = cetakOffsetCost + sharedLaminasiCost + bestPlanoOption.paperOffsetCost;
          const chosenPlanoSize = bestPlanoOption.planoItem.ukuranPlano;
          printComparisons.push({
            label: offMachine.mesinCetak,
            detail: `[${totalPages} Page (${bestPlanoOption.totalPlanoPotong} lembar plano potong)]`,
            formatUkuran: `Plano ${chosenPlanoSize} cm (Area Mesin ${offMachine.ukuranAreaCetak} cm)`,
            metode: `Offset ${offMachine.mesinCetak}`,
            layoutInfo: `Body ${bestPlanoOption.planoFitBody}-up/plano (${machineFitBody}-up/plat), Tutup ${bestPlanoOption.planoFitTutup}-up/plano (${machineFitTutup}-up/plat)`,
            kebutuhanLembar: `${bestPlanoOption.totalPlanoPotong} lembar plano potong (${totalPages} Page)`,
            totalCost: offsetTotalCost,
            cetakCost: cetakOffsetCost,
            paperCost: bestPlanoOption.paperOffsetCost,
            laminasiCost: sharedLaminasiCost,
            laminasiLabel: sharedLaminasiLabel,
            isValid: true,
            isRecommended: false,
            bodySheetLine: hasOuterBody
              ? `Lapisan body : ${canonicalOuterName}_${bestPlanoOption.rawPlanoBody} lbr plano_${chosenPlanoSize} cm_potong jadi ${cutLuarBody.p.toFixed(1)} x ${cutLuarBody.l.toFixed(1)} cm (offset ${offMachine.mesinCetak} - 1 plano muat ${bestPlanoOption.planoFitBody} pcs)`
              : 'Lapisan body : Tidak menggunakan lapisan luar body',
            tutupSheetLine: hasOuterTutup
              ? `Lapisan tutup : ${canonicalOuterName}_${bestPlanoOption.rawPlanoTutup} lbr plano_${chosenPlanoSize} cm_potong jadi ${cutLuarTutup.p.toFixed(1)} x ${cutLuarTutup.l.toFixed(1)} cm (offset ${offMachine.mesinCetak} - 1 plano muat ${bestPlanoOption.planoFitTutup} pcs)`
              : 'Lapisan tutup : Tidak menggunakan lapisan luar tutup',
          });
        }
      }
    });
  }

  // STEP 6 & 7: Bandingkan TOTAL biaya produksi dan pilih otomatis kombinasi yang paling murah
  let minIdx = 0;
  for (let i = 1; i < printComparisons.length; i++) {
    if (printComparisons[i].totalCost < printComparisons[minIdx].totalCost) {
      minIdx = i;
    }
  }
  if (printComparisons[minIdx]) {
    printComparisons[minIdx].isRecommended = true;
  }

  // Opsi terpilih: default adalah rekomendasi termurah (minIdx).
  // Namun jika user memilih opsi lain secara manual (input.selectedPrintIndex), gunakan pilihan user!
  const userIdx = input.selectedPrintIndex;
  const effectiveIdx =
    userIdx !== undefined && userIdx >= 0 && userIdx < printComparisons.length
      ? userIdx
      : minIdx;

  const chosenPrint = printComparisons[effectiveIdx] || printComparisons[minIdx] || printComparisons[0];
  const isChosenDigital = chosenPrint.label.toLowerCase().includes('digital');

  const systemDecision: SystemDecisionSummary = {
    bahan: canonicalOuterName,
    format: chosenPrint.formatUkuran,
    metode: chosenPrint.metode,
    layout: chosenPrint.layoutInfo,
    kebutuhan: chosenPrint.kebutuhanLembar,
    biaya: chosenPrint.totalCost,
  };

  // Innerbox Calculation (by material name)
  const innerboxLines: string[] = [];
  let innerboxCost = 0;
  input.innerboxNames.forEach((ibName, idx) => {
    const ibCandidates = databases.innerboxItems.filter(
      (i) => normalizeMaterialKey(i.namaBahan) === normalizeMaterialKey(ibName)
    );
    const ibPick = pickCheapestMaterialVariant(ibCandidates, P, L, safeQty);
    if (ibPick) {
      innerboxCost += ibPick.cost;
      innerboxLines.push(
        `Innerbox ${idx + 1} : ${ibPick.item.namaBahan}_${ibPick.sheets} lbr_${ibPick.item.ukuranPlano} cm_potong jadi ${P.toFixed(1)} x ${L.toFixed(1)} cm (1 lembar muat ${ibPick.fit} pcs)`
      );
    }
  });

  // Logo Calculation (from Data Proses / Logo: Std vs Custom)
  const logoLines: string[] = [];
  const logoCostItems: LogoBreakdownItem[] = [];
  let logoCost = 0;
  (input.logos || []).forEach((selectedLogo, idx) => {
    const logoRef = (databases.logoItems || []).find(
      (item) =>
        item.id === selectedLogo.logoId ||
        normalizeMaterialKey(item.jenisLogo) === normalizeMaterialKey(selectedLogo.logoId)
    );
    if (!logoRef) return;

    const hargaLogo = parseRupiahNumber(logoRef.harga);
    const biayaMinLogo = parseRupiahNumber(logoRef.biayaMin);

    if (selectedLogo.variant === 'std') {
      const itemCost = biayaMinLogo + 50000;
      logoCost += itemCost;
      const detailLine = `Logo ${idx + 1} : ${logoRef.jenisLogo} Std (Harga Minimal Rp ${biayaMinLogo.toLocaleString('id-ID')} + Rp 50.000)`;
      logoLines.push(detailLine);
      logoCostItems.push({
        label: `Logo ${logoRef.jenisLogo} Std (Harga Min + Rp 50.000)`,
        detailLine,
        cost: itemCost,
      });
    } else {
      const effP =
        selectedLogo.customP && selectedLogo.customP > 0 ? selectedLogo.customP : P;
      const effL =
        selectedLogo.customL && selectedLogo.customL > 0 ? selectedLogo.customL : L;
      const itemCost = evaluateLogoFormula(logoRef.rumusLogo, effP, effL, hargaLogo);
      logoCost += itemCost;
      const detailLine = `Logo ${idx + 1} : ${logoRef.jenisLogo} Custom_${effP} x ${effL} cm_Rumus ${logoRef.rumusLogo}`;
      logoLines.push(detailLine);
      logoCostItems.push({
        label: `Logo ${logoRef.jenisLogo} Custom (${effP} x ${effL} cm — ${logoRef.rumusLogo})`,
        detailLine,
        cost: itemCost,
      });
    }
  });

  // Finishing Cost (Jasa Rakit Dinamis dari finishingItems)
  // Patokan:
  // - 15 x 15 x 3 cm (675 cm³): Harga terendah (minPrice), di bawah ini tetap terhitung minPrice
  // - 40 x 30 x 10 cm (12.000 cm³): Harga tertinggi (maxPrice), di atas ini mentok di maxPrice
  const finishingRef =
    databases.finishingItems.find(
      (f) => f.modelBox.toLowerCase() === (model?.modelBox || '').toLowerCase()
    ) || databases.finishingItems[0];

  const minFin = finishingRef?.minPrice ?? 3500;
  const maxFin = finishingRef?.maxPrice ?? 12000;
  const volume = P * L * T;
  const MIN_VOL = 15 * 15 * 3; // 675 cm³ -> Biaya Terendah
  const MAX_VOL = 40 * 30 * 10; // 12.000 cm³ -> Biaya Tertinggi (mentok)

  let finishingRatePerPcs: number;
  if (volume <= MIN_VOL) {
    finishingRatePerPcs = minFin;
  } else if (volume >= MAX_VOL) {
    finishingRatePerPcs = maxFin;
  } else {
    const volRatio = (volume - MIN_VOL) / (MAX_VOL - MIN_VOL);
    finishingRatePerPcs = Math.round(minFin + volRatio * (maxFin - minFin));
  }

  // Pastikan tarif tidak melebihi batas maksimal yang ditentukan
  finishingRatePerPcs = Math.min(maxFin, Math.max(minFin, finishingRatePerPcs));
  const finishingCost = finishingRatePerPcs * safeQty;

  // Ongkos Pond / Druk (Aktif jika Qty >= 100 pcs)
  const ongkosPondCost = isPondActive ? 100000 : 0;

  // STEP 8: Gunakan hasil pilihan otomatis tersebut untuk rincian biaya dan harga modal per pcs
  const cetakCost = chosenPrint.cetakCost;
  const laminasiCost = chosenPrint.laminasiCost;
  const lapisanLuarPaperCost = chosenPrint.paperCost;

  const totalBiayaProduksi =
    boardCost +
    lapisanDalamCost +
    lapisanLuarPaperCost +
    cetakCost +
    laminasiCost +
    finishingCost +
    ongkosPondCost +
    pisauPondCost +
    pisauInnerboxCost +
    innerboxCost +
    logoCost;

  const hargaModalPerPcs = Math.round(totalBiayaProduksi / safeQty);
  const marginInfo = resolveMarginAndPengali(safeQty);
  const hargaJualPerPcs = Math.round(hargaModalPerPcs * marginInfo.pengali);
  const totalHargaJual = hargaJualPerPcs * safeQty;

  return {
    modelName: model?.modelBox || 'Box Custom',
    p: P,
    l: L,
    t: T,
    tt: Tt,
    qty: safeQty,
    isPondActive,
    pondAnalysis,
    systemDecision,
    boardBodyLine,
    boardTutupLine,
    lapisanDalamBodyLine,
    lapisanDalamTutupLine,
    lapisanLuarBodyLine: chosenPrint.bodySheetLine,
    lapisanLuarTutupLine: chosenPrint.tutupSheetLine,
    innerboxLines,
    logoLines,
    boardLabel,
    boardCost,
    lapisanDalamCost,
    lapisanLuarPaperCost,
    lapisanLuarPaperNote: isChosenDigital
      ? 'Lapisan Luar (Include biaya print AP)'
      : `Lapisan Luar (${canonicalOuterName})`,
    cetakLabel: `Cetak (${chosenPrint.label})`,
    cetakCost,
    isLaminasiActive,
    laminasiLabel: chosenPrint.laminasiLabel,
    laminasiCost,
    finishingRatePerPcs,
    finishingCost,
    ongkosPondCost,
    pisauPondCost,
    isPisauInnerboxActive,
    pisauInnerboxCost,
    innerboxCost,
    logoCost,
    logoCostItems,
    totalBiayaProduksi,
    hargaModalPerPcs,
    marginPercent: marginInfo.marginPercent,
    marginTierLabel: marginInfo.tierLabel,
    pengaliHargaJual: marginInfo.pengali,
    hargaJualPerPcs,
    totalHargaJual,
    outerPaperName: canonicalOuterName,
    printComparisons,
    selectedPrintIndex: effectiveIdx,
    minPrintIndex: minIdx,
  };
}
