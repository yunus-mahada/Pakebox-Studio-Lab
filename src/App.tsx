import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Award,
  BookOpen,
  Box,
  Calculator,
  Check,
  ChevronDown,
  ChevronRight,
  Construction,
  Cpu,
  Database,
  FileText,
  FolderKanban,
  Layers,
  Lightbulb,
  MapPin,
  Menu,
  Package,
  Pencil,
  Plus,
  Printer,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tag,
  Trash2,
  Truck,
  Wrench,
  X,
} from 'lucide-react';
import {
  DEFAULT_INSTRUCTION,
  FinishingCostItem,
  INITIAL_FINISHING_DATA,
  formatRupiah,
} from './data/finishingData';
import {
  INITIAL_ONGKIR_DATA,
  MASTER_CARTON,
  ShippingRateItem,
  calculateCartonPacking,
  calculateMaxOngkir,
  estimateShippingCost,
} from './data/ongkirData';
import {
  INITIAL_FORMULA_DATA,
  ModelFormulaItem,
} from './data/formulaData';
import {
  INITIAL_LOGIKA_HARGA_DATA,
  INITIAL_LOGIKA_MESIN_DATA,
  INITIAL_LOGIKA_MODEL_DATA,
  INITIAL_LOGIKA_ONGKIR_DATA,
  INITIAL_LOGIKA_PROSES_DATA,
  LogicRuleItem,
  LogicTabKey,
  MARGIN_MULTIPLIER_TABLE,
  MARGIN_QTY_TIERS,
} from './data/logicData';
import {
  INITIAL_BAHAN_DASAR_DATA,
  INITIAL_INNERBOX_DATA,
  INITIAL_KERTAS_PREMIUM_DATA,
  INITIAL_KERTAS_STD_DATA,
  MaterialItem,
  MaterialTabKey,
} from './data/materialData';
import {
  DigitalProcessItem,
  INITIAL_DIGITAL_DATA,
  INITIAL_LAMINASI_DATA,
  INITIAL_LOGO_DATA,
  INITIAL_OFFSET_DATA,
  LaminasiProcessItem,
  LogoProcessItem,
  OffsetProcessItem,
} from './data/processData';
import { OfflineIndicator, PWAInstallButton } from './components/PWAInstallButton';
import {
  BoxCalculationResult,
  LogoVariantType,
  analyzePisauPond,
  calculateBoxEstimation,
  evaluateLogoFormula,
  getUniqueMaterialNames,
  parseRupiahNumber,
} from './utils/boxCalculator';

type MenuKey =
  | 'kalkulator-box'
  | 'paperbag'
  | 'softbox'
  | 'hitung-ongkir'
  | 'data-bahan'
  | 'data-proses'
  | 'biaya-finishing'
  | 'rumus-model'
  | 'modal-ongkir'
  | 'ketentuan-logika'
  | 'pengaturan';

type ProcessTabKey = 'digital' | 'offset' | 'laminasi' | 'logo';

interface MenuItem {
  id: MenuKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  inKalkulatorGroup?: boolean;
  inModalKalkulatorGroup?: boolean;
}

const KALKULATOR_CHILDREN: MenuItem[] = [
  { id: 'kalkulator-box', label: 'Hardbox', icon: Box, inKalkulatorGroup: true },
  { id: 'paperbag', label: 'Paperbag', icon: ShoppingBag, inKalkulatorGroup: true },
  { id: 'softbox', label: 'Softbox', icon: Package, inKalkulatorGroup: true },
  { id: 'hitung-ongkir', label: 'H.Ongkir Box', icon: Truck, inKalkulatorGroup: true },
];

const MODAL_KALKULATOR_CHILDREN: MenuItem[] = [
  { id: 'data-bahan', label: 'Data Bahan', icon: Database, inModalKalkulatorGroup: true },
  { id: 'data-proses', label: 'Data Proses', icon: Printer, inModalKalkulatorGroup: true },
  { id: 'biaya-finishing', label: 'Biaya Finishing', icon: Wrench, inModalKalkulatorGroup: true },
  { id: 'rumus-model', label: 'Rumus Model', icon: BookOpen, inModalKalkulatorGroup: true },
  { id: 'modal-ongkir', label: 'Modal Ongkir', icon: Truck, inModalKalkulatorGroup: true },
];

const ALL_MENU_ITEMS: MenuItem[] = [
  ...KALKULATOR_CHILDREN,
  ...MODAL_KALKULATOR_CHILDREN,
  { id: 'ketentuan-logika', label: 'Ketentuan Logika', icon: Lightbulb },
  { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
];

const PROCESS_TABS: {
  id: ProcessTabKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'digital', label: 'Digital', icon: Printer },
  { id: 'offset', label: 'Offset', icon: Layers },
  { id: 'laminasi', label: 'Laminasi', icon: ShieldCheck },
  { id: 'logo', label: 'Logo', icon: Award },
];

const MATERIAL_TABS: {
  id: MaterialTabKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'bahan-dasar', label: 'Bahan Dasar', icon: Box },
  { id: 'kertas-std', label: 'Kertas Std', icon: FileText },
  { id: 'kertas-premium', label: 'Kertas Premium', icon: Sparkles },
  { id: 'innerbox', label: 'Innerbox', icon: Layers },
];

const LOGIC_TABS: {
  id: LogicTabKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'logika-model', label: 'Logika Model', icon: Box },
  { id: 'logika-mesin', label: 'Logika Mesin', icon: Cpu },
  { id: 'logika-proses', label: 'Logika Proses', icon: ShieldCheck },
  { id: 'logika-harga', label: 'Logika Harga', icon: Tag },
  { id: 'logika-ongkir', label: 'Logika Ongkir', icon: Truck },
];

const STORAGE_KEY_FINISHING = 'pakebox_studio_finishing_v3';
const STORAGE_KEY_FORMULA = 'pakebox_studio_formula_v1';
const STORAGE_KEY_DIGITAL = 'pakebox_studio_process_digital_v2';
const STORAGE_KEY_OFFSET = 'pakebox_studio_process_offset_v3';
const STORAGE_KEY_LAMINASI = 'pakebox_studio_process_laminasi_v3';
const STORAGE_KEY_LOGO = 'pakebox_studio_process_logo_v2';
const STORAGE_KEY_BAHAN_DASAR = 'pakebox_studio_material_dasar_v2';
const STORAGE_KEY_KERTAS_STD = 'pakebox_studio_material_std_v4';
const STORAGE_KEY_KERTAS_PREMIUM = 'pakebox_studio_material_premium_v3';
const STORAGE_KEY_INNERBOX = 'pakebox_studio_material_innerbox_v2';
const STORAGE_KEY_LOGIKA_MODEL = 'pakebox_studio_logic_model_v2';
const STORAGE_KEY_LOGIKA_MESIN = 'pakebox_studio_logic_mesin_v4';
const STORAGE_KEY_LOGIKA_PROSES = 'pakebox_studio_logic_proses_v2';
const STORAGE_KEY_LOGIKA_HARGA = 'pakebox_studio_logic_harga_v2';
const STORAGE_KEY_LOGIKA_ONGKIR = 'pakebox_studio_logic_ongkir_v1';
const STORAGE_KEY_ONGKIR = 'pakebox_studio_ongkir_v1';

export default function App() {
  const [activeMenu, setActiveMenu] = useState<MenuKey>('kalkulator-box');
  const [isKalkulatorOpen, setIsKalkulatorOpen] = useState<boolean>(true);
  const [isModalKalkulatorOpen, setIsModalKalkulatorOpen] = useState<boolean>(true);
  const [activeMaterialTab, setActiveMaterialTab] = useState<MaterialTabKey>('kertas-std');
  const [activeProcessTab, setActiveProcessTab] = useState<ProcessTabKey>('logo');
  const [activeLogicTab, setActiveLogicTab] = useState<LogicTabKey>('logika-mesin');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // State: Ketentuan Logika (Logika Model, Logika Mesin, Logika Harga)
  const [logikaModelItems, setLogikaModelItems] = useState<LogicRuleItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOGIKA_MODEL);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map((item: LogicRuleItem) => item.id));
          const missing = INITIAL_LOGIKA_MODEL_DATA.filter((item) => !existingIds.has(item.id));
          if (missing.length > 0) {
            const merged = [...parsed, ...missing];
            localStorage.setItem(STORAGE_KEY_LOGIKA_MODEL, JSON.stringify(merged));
            return merged;
          }
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_LOGIKA_MODEL_DATA;
  });

  const [logikaMesinItems, setLogikaMesinItems] = useState<LogicRuleItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOGIKA_MESIN);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map((item: LogicRuleItem) => item.id));
          const missing = INITIAL_LOGIKA_MESIN_DATA.filter((item) => !existingIds.has(item.id));
          if (missing.length > 0) {
            const merged = [...parsed, ...missing];
            localStorage.setItem(STORAGE_KEY_LOGIKA_MESIN, JSON.stringify(merged));
            return merged;
          }
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_LOGIKA_MESIN_DATA;
  });

  const [logikaProsesItems, setLogikaProsesItems] = useState<LogicRuleItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOGIKA_PROSES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map((item: LogicRuleItem) => item.id));
          const missing = INITIAL_LOGIKA_PROSES_DATA.filter((item) => !existingIds.has(item.id));
          if (missing.length > 0) {
            const merged = [...parsed, ...missing];
            localStorage.setItem(STORAGE_KEY_LOGIKA_PROSES, JSON.stringify(merged));
            return merged;
          }
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_LOGIKA_PROSES_DATA;
  });

  const [logikaHargaItems, setLogikaHargaItems] = useState<LogicRuleItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOGIKA_HARGA);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return INITIAL_LOGIKA_HARGA_DATA;
  });

  const [logikaOngkirItems, setLogikaOngkirItems] = useState<LogicRuleItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOGIKA_ONGKIR);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map((item: LogicRuleItem) => item.id));
          const missing = INITIAL_LOGIKA_ONGKIR_DATA.filter((item) => !existingIds.has(item.id));
          if (missing.length > 0) {
            const merged = [...parsed, ...missing];
            localStorage.setItem(STORAGE_KEY_LOGIKA_ONGKIR, JSON.stringify(merged));
            return merged;
          }
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_LOGIKA_ONGKIR_DATA;
  });

  const [isLogicModalOpen, setIsLogicModalOpen] = useState(false);
  const [editingLogicId, setEditingLogicId] = useState<string | null>(null);
  const [lNamaAturan, setLNamaAturan] = useState('');
  const [lKondisiTrigger, setLKondisiTrigger] = useState('');
  const [lRumusTindakan, setLRumusTindakan] = useState('');
  const [lKeterangan, setLKeterangan] = useState('');
  const [lAksi, setLAksi] = useState('');
  const [logicFormError, setLogicFormError] = useState('');
  const [deleteLogicConfirmId, setDeleteLogicConfirmId] = useState<string | null>(null);

  // State: Data Bahan (Bahan Dasar, Kertas Std, Kertas Premium)
  const [bahanDasarItems, setBahanDasarItems] = useState<MaterialItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BAHAN_DASAR);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return INITIAL_BAHAN_DASAR_DATA;
  });

  const [kertasStdItems, setKertasStdItems] = useState<MaterialItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_KERTAS_STD);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return INITIAL_KERTAS_STD_DATA;
  });

  const [kertasPremiumItems, setKertasPremiumItems] = useState<MaterialItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_KERTAS_PREMIUM);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return INITIAL_KERTAS_PREMIUM_DATA;
  });

  const [innerboxItems, setInnerboxItems] = useState<MaterialItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_INNERBOX);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return INITIAL_INNERBOX_DATA;
  });

  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);
  const [mNamaBahan, setMNamaBahan] = useState('');
  const [mUkuranPlano, setMUkuranPlano] = useState('');
  const [mHargaLembar, setMHargaLembar] = useState('');
  const [materialFormError, setMaterialFormError] = useState('');
  const [deleteMaterialConfirmId, setDeleteMaterialConfirmId] = useState<string | null>(null);

  // State: Data Proses - Digital
  const [digitalItems, setDigitalItems] = useState<DigitalProcessItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DIGITAL);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return INITIAL_DIGITAL_DATA;
  });

  // State: Data Proses - Offset
  const [offsetItems, setOffsetItems] = useState<OffsetProcessItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_OFFSET);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return INITIAL_OFFSET_DATA;
  });

  // State: Data Proses - Laminasi
  const [laminasiItems, setLaminasiItems] = useState<LaminasiProcessItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LAMINASI);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return INITIAL_LAMINASI_DATA;
  });

  // State: Data Proses - Logo
  const [logoItems, setLogoItems] = useState<LogoProcessItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOGO);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return INITIAL_LOGO_DATA;
  });

  // Modal State for Data Proses (Digital, Offset, Laminasi, Logo)
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [editingProcessId, setEditingProcessId] = useState<string | null>(null);
  const [pField1, setPField1] = useState('');
  const [pField2, setPField2] = useState('');
  const [pField3, setPField3] = useState('');
  const [pField4, setPField4] = useState('');
  const [pField5, setPField5] = useState('');
  const [pLaminasiType, setPLaminasiType] = useState<'Digital' | 'Offset'>('Digital');
  const [processFormError, setProcessFormError] = useState('');
  const [deleteProcessConfirmId, setDeleteProcessConfirmId] = useState<string | null>(null);

  // State: Biaya Finishing
  const [finishingItems, setFinishingItems] = useState<FinishingCostItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FINISHING);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback to initial data
    }
    return INITIAL_FINISHING_DATA;
  });

  const [finishingSearch, setFinishingSearch] = useState('');
  const [isFinishingModalOpen, setIsFinishingModalOpen] = useState(false);
  const [editingFinishing, setEditingFinishing] = useState<FinishingCostItem | null>(null);
  const [formModelBox, setFormModelBox] = useState('');
  const [formMinPrice, setFormMinPrice] = useState('');
  const [formMaxPrice, setFormMaxPrice] = useState('');
  const [formInstructions, setFormInstructions] = useState('');
  const [finishingFormError, setFinishingFormError] = useState('');
  const [deleteFinishingConfirmId, setDeleteFinishingConfirmId] = useState<string | null>(null);

  // State: Rumus Model
  const [formulaItems, setFormulaItems] = useState<ModelFormulaItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FORMULA);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback to initial data
    }
    return INITIAL_FORMULA_DATA;
  });

  const [formulaSearch, setFormulaSearch] = useState('');
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState(false);
  const [editingFormula, setEditingFormula] = useState<ModelFormulaItem | null>(null);
  const [fModelBox, setFModelBox] = useState('');
  const [fBoardBody, setFBoardBody] = useState('');
  const [fBoardTutup, setFBoardTutup] = useState('');
  const [fLapisanDalamBody, setFLapisanDalamBody] = useState('');
  const [fLapisanDalamTutup, setFLapisanDalamTutup] = useState('');
  const [fLapisanLuarBody, setFLapisanLuarBody] = useState('');
  const [fLapisanLuarTutup, setFLapisanLuarTutup] = useState('');
  const [fPisauBody, setFPisauBody] = useState('');
  const [fPisauTutup, setFPisauTutup] = useState('');
  const [formulaFormError, setFormulaFormError] = useState('');
  const [deleteFormulaConfirmId, setDeleteFormulaConfirmId] = useState<string | null>(null);

  // State: Modal Ongkir
  const [ongkirItems, setOngkirItems] = useState<ShippingRateItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ONGKIR);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map((item: ShippingRateItem) => item.id));
          const missing = INITIAL_ONGKIR_DATA.filter((item) => !existingIds.has(item.id));
          const combined = missing.length > 0 ? [...parsed, ...missing] : parsed;
          if (missing.length > 0) {
            localStorage.setItem(STORAGE_KEY_ONGKIR, JSON.stringify(combined));
          }
          return combined.map((it: ShippingRateItem) => ({
            ...it,
            maximumHarga: it.maximumHarga ?? calculateMaxOngkir(it.hargaPerKg, it.minimumHarga),
          }));
        }
      }
    } catch {
      // Fallback to initial data
    }
    return INITIAL_ONGKIR_DATA;
  });

  const [ongkirSearch, setOngkirSearch] = useState('');
  const [isOngkirModalOpen, setIsOngkirModalOpen] = useState(false);
  const [editingOngkir, setEditingOngkir] = useState<ShippingRateItem | null>(null);
  const [formService, setFormService] = useState('');
  const [formKotaAsal, setFormKotaAsal] = useState('');
  const [formKotaTujuan, setFormKotaTujuan] = useState('');
  const [formEstimasiTiba, setFormEstimasiTiba] = useState('');
  const [formHargaPerKg, setFormHargaPerKg] = useState('');
  const [formMinimumHarga, setFormMinimumHarga] = useState('');
  const [ongkirFormError, setOngkirFormError] = useState('');
  const [deleteOngkirConfirmId, setDeleteOngkirConfirmId] = useState<string | null>(null);

  // State: Kalkulator H.Ongkir Box (Default Nol dan Pilih Kota)
  const [calcOngkirOrigin, setCalcOngkirOrigin] = useState<string>('');
  const [calcOngkirDestination, setCalcOngkirDestination] = useState<string>('');
  const [calcOngkirP, setCalcOngkirP] = useState<string>('0');
  const [calcOngkirL, setCalcOngkirL] = useState<string>('0');
  const [calcOngkirT, setCalcOngkirT] = useState<string>('0');
  const [calcOngkirQty, setCalcOngkirQty] = useState<string>('0');
  const [selectedShippingServiceId, setSelectedShippingServiceId] = useState<string | null>(null);

  // State: Kalkulator Box (Card Kiri Input - User hanya memilih Nama Bahan)
  const [calcModelId, setCalcModelId] = useState<string>(() => INITIAL_FORMULA_DATA[0]?.id || '');
  const [calcP, setCalcP] = useState<string>('0');
  const [calcL, setCalcL] = useState<string>('0');
  const [calcT, setCalcT] = useState<string>('0');
  const [calcBahanBodyName, setCalcBahanBodyName] = useState<string>(
    () => getUniqueMaterialNames(INITIAL_BAHAN_DASAR_DATA)[0] || ''
  );
  const [calcBahanTutupName, setCalcBahanTutupName] = useState<string>(
    () => getUniqueMaterialNames(INITIAL_BAHAN_DASAR_DATA)[0] || ''
  );
  const [calcLBodyDalamName, setCalcLBodyDalamName] = useState<string>(
    () => getUniqueMaterialNames(INITIAL_KERTAS_STD_DATA)[0] || ''
  );
  const [calcLBodyLuarName, setCalcLBodyLuarName] = useState<string>(
    () =>
      getUniqueMaterialNames(INITIAL_KERTAS_STD_DATA)[1] ||
      getUniqueMaterialNames(INITIAL_KERTAS_STD_DATA)[0] ||
      ''
  );
  const [calcLTutupDalamName, setCalcLTutupDalamName] = useState<string>(
    () => getUniqueMaterialNames(INITIAL_KERTAS_STD_DATA)[0] || ''
  );
  const [calcLTutupLuarName, setCalcLTutupLuarName] = useState<string>(
    () =>
      getUniqueMaterialNames(INITIAL_KERTAS_STD_DATA)[1] ||
      getUniqueMaterialNames(INITIAL_KERTAS_STD_DATA)[0] ||
      ''
  );
  // Default kosong untuk Innerbox; ketika klik tambah, baru muncul pilihan nama bahan dari data innerbox
  const [calcInnerboxList, setCalcInnerboxList] = useState<string[]>([]);
  // Default kosong untuk Logo; ketika klik tambah logo, muncul pilihan logo dari Data Proses / Logo beserta opsi Std / Custom
  const [calcLogoList, setCalcLogoList] = useState<
    {
      logoId: string;
      variant: LogoVariantType;
      customP: string;
      customL: string;
    }[]
  >([]);
  const [calcQty, setCalcQty] = useState<string>('0');
  const [calcError, setCalcError] = useState<string>('');
  const [calcResult, setCalcResult] = useState<BoxCalculationResult | null>(null);
  const [selectedPrintIndex, setSelectedPrintIndex] = useState<number | undefined>(undefined);

  const uniqueBahanDasarNames = useMemo(
    () => getUniqueMaterialNames(bahanDasarItems),
    [bahanDasarItems]
  );
  const uniqueKertasStdNames = useMemo(
    () => getUniqueMaterialNames(kertasStdItems),
    [kertasStdItems]
  );
  const uniqueKertasPremiumNames = useMemo(
    () => getUniqueMaterialNames(kertasPremiumItems),
    [kertasPremiumItems]
  );
  const uniqueInnerboxNames = useMemo(
    () => getUniqueMaterialNames(innerboxItems),
    [innerboxItems]
  );

  const handleCalcNumberChange = (
    rawVal: string,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    if (rawVal === '') {
      setter('');
      return;
    }
    const cleaned = rawVal.replace(/[^0-9.,]/g, '');
    if (
      cleaned.length > 1 &&
      cleaned.startsWith('0') &&
      cleaned[1] !== '.' &&
      cleaned[1] !== ','
    ) {
      setter(cleaned.replace(/^0+/, '') || '0');
      return;
    }
    setter(cleaned);
  };

  const handleAddCalcInnerbox = () => {
    const defaultName = uniqueInnerboxNames[0] || '';
    setCalcInnerboxList((prev) => [...prev, defaultName]);
  };

  const handleUpdateCalcInnerbox = (index: number, value: string) => {
    setCalcInnerboxList((prev) => prev.map((it, idx) => (idx === index ? value : it)));
  };

  const handleRemoveCalcInnerbox = (index: number) => {
    setCalcInnerboxList((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleAddCalcLogo = () => {
    const defaultLogoId = logoItems[0]?.id || '';
    setCalcLogoList((prev) => [
      ...prev,
      {
        logoId: defaultLogoId,
        variant: 'std',
        customP: '0',
        customL: '0',
      },
    ]);
  };

  const handleUpdateCalcLogoId = (index: number, logoId: string) => {
    setCalcLogoList((prev) =>
      prev.map((it, idx) => (idx === index ? { ...it, logoId } : it))
    );
  };

  const handleUpdateCalcLogoVariant = (index: number, variant: LogoVariantType) => {
    setCalcLogoList((prev) =>
      prev.map((it, idx) => (idx === index ? { ...it, variant } : it))
    );
  };

  const handleUpdateCalcLogoDimension = (
    index: number,
    field: 'customP' | 'customL',
    rawVal: string
  ) => {
    const cleaned = rawVal === '' ? '' : rawVal.replace(/[^0-9.,]/g, '');
    const normalized =
      cleaned.length > 1 &&
      cleaned.startsWith('0') &&
      cleaned[1] !== '.' &&
      cleaned[1] !== ','
        ? cleaned.replace(/^0+/, '') || '0'
        : cleaned;
    setCalcLogoList((prev) =>
      prev.map((it, idx) => (idx === index ? { ...it, [field]: normalized } : it))
    );
  };

  const handleRemoveCalcLogo = (index: number) => {
    setCalcLogoList((prev) => prev.filter((_, idx) => idx !== index));
  };

  const livePondAnalysis = useMemo(() => {
    const pVal = parseFloat((calcP || '0').replace(',', '.')) || 0;
    const lVal = parseFloat((calcL || '0').replace(',', '.')) || 0;
    const tVal = parseFloat((calcT || '0').replace(',', '.')) || 0;
    const qtyVal = parseInt((calcQty || '0').replace(/[^0-9]/g, ''), 10) || 0;
    const hasInnerbox = calcInnerboxList.filter(Boolean).length > 0;
    return analyzePisauPond(
      {
        modelId: calcModelId,
        p: pVal,
        l: lVal,
        t: tVal,
        qty: qtyVal,
        hasInnerbox,
      },
      {
        formulaItems,
        logikaModelItems,
        logikaProsesItems,
      }
    );
  }, [
    calcModelId,
    calcP,
    calcL,
    calcT,
    calcQty,
    calcInnerboxList,
    formulaItems,
    logikaModelItems,
    logikaProsesItems,
  ]);

  const handleResetCalculatorInputs = () => {
    setCalcModelId(formulaItems[0]?.id || '');
    setCalcP('0');
    setCalcL('0');
    setCalcT('0');
    setCalcBahanBodyName(uniqueBahanDasarNames[0] || '');
    setCalcBahanTutupName(uniqueBahanDasarNames[0] || '');
    setCalcLBodyDalamName(uniqueKertasStdNames[0] || '');
    setCalcLBodyLuarName(uniqueKertasStdNames[1] || uniqueKertasStdNames[0] || '');
    setCalcLTutupDalamName(uniqueKertasStdNames[0] || '');
    setCalcLTutupLuarName(uniqueKertasStdNames[1] || uniqueKertasStdNames[0] || '');
    setCalcInnerboxList([]);
    setCalcLogoList([]);
    setCalcQty('0');
    setCalcError('');
    setSelectedPrintIndex(undefined);
    setCalcResult(null);
  };

  const executeBoxCalculation = (overridePrintIndex?: number) => {
    const pVal = parseFloat((calcP || '0').replace(',', '.'));
    const lVal = parseFloat((calcL || '0').replace(',', '.'));
    const tVal = parseFloat((calcT || '0').replace(',', '.'));
    const qtyVal = parseInt((calcQty || '0').replace(/[^0-9]/g, ''), 10);

    if (!pVal || pVal <= 0 || !lVal || lVal <= 0 || !tVal || tVal <= 0) {
      setCalcError('Masukkan ukuran Panjang (P), Lebar (L), dan Tinggi (T) lebih dari 0 cm.');
      return;
    }
    if (!qtyVal || qtyVal <= 0) {
      setCalcError('Masukkan jumlah Qty pesanan lebih dari 0 pcs.');
      return;
    }

    setCalcError('');
    const res = calculateBoxEstimation(
      {
        modelId: calcModelId,
        p: pVal,
        l: lVal,
        t: tVal,
        qty: qtyVal,
        bahanBodyName: calcBahanBodyName,
        bahanTutupName: calcBahanTutupName,
        lBodyDalamName: calcLBodyDalamName,
        lBodyLuarName: calcLBodyLuarName,
        lTutupDalamName: calcLTutupDalamName,
        lTutupLuarName: calcLTutupLuarName,
        innerboxNames: calcInnerboxList.filter(Boolean),
        logos: calcLogoList
          .filter((item) => Boolean(item.logoId))
          .map((item) => ({
            logoId: item.logoId,
            variant: item.variant,
            customP: parseFloat((item.customP || '0').replace(',', '.')) || 0,
            customL: parseFloat((item.customL || '0').replace(',', '.')) || 0,
          })),
        selectedPrintIndex: overridePrintIndex,
      },
      {
        formulaItems,
        bahanDasarItems,
        kertasStdItems,
        kertasPremiumItems,
        innerboxItems,
        digitalItems,
        offsetItems,
        laminasiItems,
        logoItems,
        finishingItems,
        logikaModelItems,
        logikaMesinItems,
        logikaProsesItems,
      }
    );
    setCalcResult(res);
  };

  const handleHitungHarga = () => {
    setSelectedPrintIndex(undefined);
    executeBoxCalculation(undefined);
  };

  const handleSelectPrintOption = (idx: number | undefined) => {
    setSelectedPrintIndex(idx);
    executeBoxCalculation(idx);
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LOGIKA_MODEL, JSON.stringify(logikaModelItems));
    } catch {
      // Ignore
    }
  }, [logikaModelItems]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LOGIKA_MESIN, JSON.stringify(logikaMesinItems));
    } catch {
      // Ignore
    }
  }, [logikaMesinItems]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LOGIKA_PROSES, JSON.stringify(logikaProsesItems));
    } catch {
      // Ignore
    }
  }, [logikaProsesItems]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LOGIKA_HARGA, JSON.stringify(logikaHargaItems));
    } catch {
      // Ignore
    }
  }, [logikaHargaItems]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BAHAN_DASAR, JSON.stringify(bahanDasarItems));
    } catch {
      // Ignore
    }
  }, [bahanDasarItems]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_KERTAS_STD, JSON.stringify(kertasStdItems));
    } catch {
      // Ignore
    }
  }, [kertasStdItems]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_KERTAS_PREMIUM, JSON.stringify(kertasPremiumItems));
    } catch {
      // Ignore
    }
  }, [kertasPremiumItems]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_INNERBOX, JSON.stringify(innerboxItems));
    } catch {
      // Ignore
    }
  }, [innerboxItems]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DIGITAL, JSON.stringify(digitalItems));
    } catch {
      // Ignore
    }
  }, [digitalItems]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_OFFSET, JSON.stringify(offsetItems));
    } catch {
      // Ignore
    }
  }, [offsetItems]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LAMINASI, JSON.stringify(laminasiItems));
    } catch {
      // Ignore
    }
  }, [laminasiItems]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LOGO, JSON.stringify(logoItems));
    } catch {
      // Ignore
    }
  }, [logoItems]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FINISHING, JSON.stringify(finishingItems));
    } catch {
      // Ignore
    }
  }, [finishingItems]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FORMULA, JSON.stringify(formulaItems));
    } catch {
      // Ignore
    }
  }, [formulaItems]);

  const filteredFinishingItems = useMemo(() => {
    const q = finishingSearch.trim().toLowerCase();
    if (!q) return finishingItems;
    return finishingItems.filter(
      (item) =>
        item.modelBox.toLowerCase().includes(q) ||
        item.specialInstructions.toLowerCase().includes(q)
    );
  }, [finishingItems, finishingSearch]);

  const filteredFormulaItems = useMemo(() => {
    const q = formulaSearch.trim().toLowerCase();
    if (!q) return formulaItems;
    return formulaItems.filter(
      (item) =>
        item.modelBox.toLowerCase().includes(q) ||
        item.boardBody.toLowerCase().includes(q) ||
        item.boardTutup.toLowerCase().includes(q) ||
        item.pisauBody.toLowerCase().includes(q) ||
        item.pisauTutup.toLowerCase().includes(q)
    );
  }, [formulaItems, formulaSearch]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ONGKIR, JSON.stringify(ongkirItems));
    } catch {
      // Ignore
    }
  }, [ongkirItems]);

  const filteredOngkirItems = useMemo(() => {
    const q = ongkirSearch.trim().toLowerCase();
    if (!q) return ongkirItems;
    return ongkirItems.filter(
      (item) =>
        item.service.toLowerCase().includes(q) ||
        item.kotaAsal.toLowerCase().includes(q) ||
        item.kotaTujuan.toLowerCase().includes(q) ||
        item.estimasiTiba.toLowerCase().includes(q)
    );
  }, [ongkirItems, ongkirSearch]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LOGIKA_ONGKIR, JSON.stringify(logikaOngkirItems));
    } catch {
      // Ignore
    }
  }, [logikaOngkirItems]);

  // Reset input Kalkulator H.Ongkir Box kembali ke default saat berpindah menu
  useEffect(() => {
    setCalcOngkirOrigin('');
    setCalcOngkirDestination('');
    setCalcOngkirP('0');
    setCalcOngkirL('0');
    setCalcOngkirT('0');
    setCalcOngkirQty('0');
    setSelectedShippingServiceId(null);
  }, [activeMenu]);

  // Dropdown list kota asal & tujuan dari modal ongkir
  const availableOrigins = useMemo(() => {
    const list: string[] = [];
    ongkirItems.forEach((it) => {
      const trimmed = it.kotaAsal.trim();
      if (trimmed && !list.includes(trimmed)) {
        list.push(trimmed);
      }
    });
    return list;
  }, [ongkirItems]);

  const availableDestinations = useMemo(() => {
    const list: string[] = [];
    ongkirItems
      .filter(
        (it) =>
          !calcOngkirOrigin ||
          it.kotaAsal.trim().toLowerCase() === calcOngkirOrigin.trim().toLowerCase()
      )
      .forEach((it) => {
        const trimmed = it.kotaTujuan.trim();
        if (trimmed && !list.includes(trimmed)) {
          list.push(trimmed);
        }
      });
    return list;
  }, [ongkirItems, calcOngkirOrigin]);

  // Perhitungan packing muatan kardus master 55x55x40 cm
  const packingResult = useMemo(() => {
    const p = parseFloat(calcOngkirP) || 0;
    const l = parseFloat(calcOngkirL) || 0;
    const t = parseFloat(calcOngkirT) || 0;
    const qty = parseInt(calcOngkirQty) || 0;
    return calculateCartonPacking(p, l, t, qty);
  }, [calcOngkirP, calcOngkirL, calcOngkirT, calcOngkirQty]);

  // Daftar layanan ekspedisi pada rute yang dipilih beserta kalkulasi biaya
  const matchingShippingServices = useMemo(() => {
    const origin = calcOngkirOrigin.trim().toLowerCase();
    const dest = calcOngkirDestination.trim().toLowerCase();

    if (!origin || !dest) {
      return [];
    }

    const matches = ongkirItems.filter(
      (it) =>
        it.kotaAsal.trim().toLowerCase() === origin &&
        it.kotaTujuan.trim().toLowerCase() === dest
    );

    const withCosts = matches.map((service) => {
      const { biayaPerKoli, totalOngkir } = estimateShippingCost(
        service,
        packingResult.totalKoli
      );
      return {
        service,
        biayaPerKoli,
        totalOngkir,
      };
    });

    // Urutkan dari termurah ke termahal
    withCosts.sort((a, b) => a.totalOngkir - b.totalOngkir);

    return withCosts;
  }, [ongkirItems, calcOngkirOrigin, calcOngkirDestination, packingResult.totalKoli]);

  // Service aktif (default otomatis service termurah)
  const activeSelectedServiceOption = useMemo(() => {
    if (matchingShippingServices.length === 0) return null;
    if (selectedShippingServiceId) {
      const found = matchingShippingServices.find(
        (opt) => opt.service.id === selectedShippingServiceId
      );
      if (found) return found;
    }
    return matchingShippingServices[0];
  }, [matchingShippingServices, selectedShippingServiceId]);

  const handleSyncFromBoxCalc = () => {
    if (calcP && calcP !== '0') setCalcOngkirP(calcP);
    if (calcL && calcL !== '0') setCalcOngkirL(calcL);
    if (calcT && calcT !== '0') setCalcOngkirT(calcT);
    if (calcQty && calcQty !== '0') setCalcOngkirQty(calcQty);
  };

  // Handlers: Ketentuan Logika (Logika Model, Logika Mesin, Logika Harga)
  const openAddLogicModal = () => {
    setEditingLogicId(null);
    setLNamaAturan('');
    setLKondisiTrigger('');
    setLRumusTindakan('');
    setLKeterangan('');
    setLAksi('');
    setLogicFormError('');
    setIsLogicModalOpen(true);
  };

  const openEditLogicModal = (item: LogicRuleItem) => {
    setEditingLogicId(item.id);
    setLNamaAturan(item.namaAturan);
    setLKondisiTrigger(item.kondisiTrigger);
    setLRumusTindakan(item.rumusTindakan);
    setLKeterangan(item.keterangan);
    setLAksi(item.aksi || '');
    setLogicFormError('');
    setIsLogicModalOpen(true);
  };

  const handleSaveLogicItem = (e: React.FormEvent) => {
    e.preventDefault();
    const nama = lNamaAturan.trim();
    const kondisi = lKondisiTrigger.trim();
    const rumus = lRumusTindakan.trim();
    const ket = lKeterangan.trim();
    const aksiVal = lAksi.trim();

    if (!nama) {
      setLogicFormError('Nama aturan logika wajib diisi.');
      return;
    }

    const updateList = (prev: LogicRuleItem[], prefix: string): LogicRuleItem[] => {
      if (editingLogicId) {
        return prev.map((it) =>
          it.id === editingLogicId
            ? {
                ...it,
                namaAturan: nama,
                kondisiTrigger: kondisi,
                rumusTindakan: rumus,
                keterangan: ket,
                aksi: aksiVal,
              }
            : it
        );
      }
      return [
        ...prev,
        {
          id: `${prefix}-${Date.now()}`,
          namaAturan: nama,
          kondisiTrigger: kondisi,
          rumusTindakan: rumus,
          keterangan: ket,
          aksi: aksiVal,
        },
      ];
    };

    if (activeLogicTab === 'logika-model') {
      setLogikaModelItems((prev) => updateList(prev, 'lm'));
    } else if (activeLogicTab === 'logika-mesin') {
      setLogikaMesinItems((prev) => updateList(prev, 'lme'));
    } else if (activeLogicTab === 'logika-proses') {
      setLogikaProsesItems((prev) => updateList(prev, 'lp'));
    } else if (activeLogicTab === 'logika-harga') {
      setLogikaHargaItems((prev) => updateList(prev, 'lh'));
    } else if (activeLogicTab === 'logika-ongkir') {
      setLogikaOngkirItems((prev) => updateList(prev, 'lo'));
    }

    setIsLogicModalOpen(false);
  };

  const handleDeleteLogicItem = (id: string) => {
    if (activeLogicTab === 'logika-model') {
      setLogikaModelItems((prev) => prev.filter((it) => it.id !== id));
    } else if (activeLogicTab === 'logika-mesin') {
      setLogikaMesinItems((prev) => prev.filter((it) => it.id !== id));
    } else if (activeLogicTab === 'logika-proses') {
      setLogikaProsesItems((prev) => prev.filter((it) => it.id !== id));
    } else if (activeLogicTab === 'logika-harga') {
      setLogikaHargaItems((prev) => prev.filter((it) => it.id !== id));
    } else if (activeLogicTab === 'logika-ongkir') {
      setLogikaOngkirItems((prev) => prev.filter((it) => it.id !== id));
    }
    setDeleteLogicConfirmId(null);
  };

  // Handlers: Data Bahan (Bahan Dasar, Kertas Std, Kertas Premium)
  const openAddMaterialModal = () => {
    setEditingMaterialId(null);
    setMNamaBahan('');
    setMUkuranPlano('');
    setMHargaLembar('');
    setMaterialFormError('');
    setIsMaterialModalOpen(true);
  };

  const openEditMaterialModal = (item: MaterialItem) => {
    setEditingMaterialId(item.id);
    setMNamaBahan(item.namaBahan);
    setMUkuranPlano(item.ukuranPlano);
    setMHargaLembar(item.hargaLembar);
    setMaterialFormError('');
    setIsMaterialModalOpen(true);
  };

  const handleSaveMaterialItem = (e: React.FormEvent) => {
    e.preventDefault();
    const nama = mNamaBahan.trim();
    const ukuran = mUkuranPlano.trim();
    const harga = mHargaLembar.trim();

    if (!nama) {
      setMaterialFormError('Nama bahan wajib diisi.');
      return;
    }

    const updateList = (prev: MaterialItem[], prefix: string): MaterialItem[] => {
      if (editingMaterialId) {
        return prev.map((it) =>
          it.id === editingMaterialId
            ? { ...it, namaBahan: nama, ukuranPlano: ukuran, hargaLembar: harga }
            : it
        );
      }
      return [
        ...prev,
        {
          id: `${prefix}-${Date.now()}`,
          namaBahan: nama,
          ukuranPlano: ukuran,
          hargaLembar: harga,
        },
      ];
    };

    if (activeMaterialTab === 'bahan-dasar') {
      setBahanDasarItems((prev) => updateList(prev, 'bd'));
    } else if (activeMaterialTab === 'kertas-std') {
      setKertasStdItems((prev) => updateList(prev, 'ks'));
    } else if (activeMaterialTab === 'kertas-premium') {
      setKertasPremiumItems((prev) => updateList(prev, 'kp'));
    } else if (activeMaterialTab === 'innerbox') {
      setInnerboxItems((prev) => updateList(prev, 'ib'));
    }

    setIsMaterialModalOpen(false);
  };

  const handleDeleteMaterialItem = (id: string) => {
    if (activeMaterialTab === 'bahan-dasar') {
      setBahanDasarItems((prev) => prev.filter((it) => it.id !== id));
    } else if (activeMaterialTab === 'kertas-std') {
      setKertasStdItems((prev) => prev.filter((it) => it.id !== id));
    } else if (activeMaterialTab === 'kertas-premium') {
      setKertasPremiumItems((prev) => prev.filter((it) => it.id !== id));
    } else if (activeMaterialTab === 'innerbox') {
      setInnerboxItems((prev) => prev.filter((it) => it.id !== id));
    }
    setDeleteMaterialConfirmId(null);
  };

  // Handlers: Data Proses (Digital, Offset, Laminasi, Logo)
  const openAddProcessModal = () => {
    setEditingProcessId(null);
    setPField1('');
    setPField2('');
    setPField3('');
    setPField4('');
    setPField5('');
    setPLaminasiType('Digital');
    setProcessFormError('');
    setIsProcessModalOpen(true);
  };

  const openEditDigitalModal = (item: DigitalProcessItem) => {
    setEditingProcessId(item.id);
    setPField1(item.namaMesin);
    setPField2(item.ukuranArea);
    setPField3(item.hargaCetak);
    setPField4(item.keterangan);
    setProcessFormError('');
    setIsProcessModalOpen(true);
  };

  const openEditOffsetModal = (item: OffsetProcessItem) => {
    setEditingProcessId(item.id);
    setPField1(item.mesinCetak);
    setPField2(item.ukuranAreaCetak);
    setPField3(item.biayaCetak);
    setPField4(item.lebihDruk);
    setProcessFormError('');
    setIsProcessModalOpen(true);
  };

  const openEditLaminasiModal = (item: LaminasiProcessItem) => {
    setEditingProcessId(item.id);
    setPField1(item.jenisLaminasi);
    setPLaminasiType(item.type);
    setPField2(item.maxUkuran);
    setPField3(item.harga);
    setPField4(item.biayaMinimum);
    setPField5(item.rumusMinimum);
    setProcessFormError('');
    setIsProcessModalOpen(true);
  };

  const openEditLogoModal = (item: LogoProcessItem) => {
    setEditingProcessId(item.id);
    setPField1(item.jenisLogo);
    setPField2(item.harga);
    setPField3(item.biayaMin);
    setPField4(item.rumusLogo);
    setPField5(item.keterangan);
    setProcessFormError('');
    setIsProcessModalOpen(true);
  };

  const handleSaveProcessItem = (e: React.FormEvent) => {
    e.preventDefault();
    const f1 = pField1.trim();
    const f2 = pField2.trim();
    const f3 = pField3.trim();
    const f4 = pField4.trim();
    const f5 = pField5.trim();

    if (!f1) {
      setProcessFormError('Kolom nama/jenis utama wajib diisi.');
      return;
    }

    if (activeProcessTab === 'digital') {
      if (editingProcessId) {
        setDigitalItems((prev) =>
          prev.map((it) =>
            it.id === editingProcessId
              ? { ...it, namaMesin: f1, ukuranArea: f2, hargaCetak: f3, keterangan: f4 }
              : it
          )
        );
      } else {
        setDigitalItems((prev) => [
          ...prev,
          { id: 'dig-' + Date.now(), namaMesin: f1, ukuranArea: f2, hargaCetak: f3, keterangan: f4 },
        ]);
      }
    } else if (activeProcessTab === 'offset') {
      if (editingProcessId) {
        setOffsetItems((prev) =>
          prev.map((it) =>
            it.id === editingProcessId
              ? { ...it, mesinCetak: f1, ukuranAreaCetak: f2, biayaCetak: f3, lebihDruk: f4 }
              : it
          )
        );
      } else {
        setOffsetItems((prev) => [
          ...prev,
          { id: 'off-' + Date.now(), mesinCetak: f1, ukuranAreaCetak: f2, biayaCetak: f3, lebihDruk: f4 },
        ]);
      }
    } else if (activeProcessTab === 'laminasi') {
      if (editingProcessId) {
        setLaminasiItems((prev) =>
          prev.map((it) =>
            it.id === editingProcessId
              ? {
                  ...it,
                  jenisLaminasi: f1,
                  type: pLaminasiType,
                  maxUkuran: f2,
                  harga: f3,
                  biayaMinimum: f4,
                  rumusMinimum: f5 || 'Tidak ada rumus.',
                }
              : it
          )
        );
      } else {
        setLaminasiItems((prev) => [
          ...prev,
          {
            id: 'lam-' + Date.now(),
            jenisLaminasi: f1,
            type: pLaminasiType,
            maxUkuran: f2,
            harga: f3,
            biayaMinimum: f4,
            rumusMinimum: f5 || 'Tidak ada rumus.',
          },
        ]);
      }
    } else if (activeProcessTab === 'logo') {
      if (editingProcessId) {
        setLogoItems((prev) =>
          prev.map((it) =>
            it.id === editingProcessId
              ? {
                  ...it,
                  jenisLogo: f1,
                  harga: f2,
                  biayaMin: f3,
                  rumusLogo: f4,
                  keterangan: f5,
                }
              : it
          )
        );
      } else {
        setLogoItems((prev) => [
          ...prev,
          {
            id: 'log-' + Date.now(),
            jenisLogo: f1,
            harga: f2,
            biayaMin: f3,
            rumusLogo: f4,
            keterangan: f5,
          },
        ]);
      }
    }

    setIsProcessModalOpen(false);
  };

  const handleDeleteProcessItem = (id: string) => {
    if (activeProcessTab === 'digital') {
      setDigitalItems((prev) => prev.filter((it) => it.id !== id));
    } else if (activeProcessTab === 'offset') {
      setOffsetItems((prev) => prev.filter((it) => it.id !== id));
    } else if (activeProcessTab === 'laminasi') {
      setLaminasiItems((prev) => prev.filter((it) => it.id !== id));
    } else if (activeProcessTab === 'logo') {
      setLogoItems((prev) => prev.filter((it) => it.id !== id));
    }
    setDeleteProcessConfirmId(null);
  };

  // Handlers: Biaya Finishing
  const openAddFinishingModal = () => {
    setEditingFinishing(null);
    setFormModelBox('');
    setFormMinPrice('5000');
    setFormMaxPrice('12000');
    setFormInstructions(DEFAULT_INSTRUCTION);
    setFinishingFormError('');
    setIsFinishingModalOpen(true);
  };

  const openEditFinishingModal = (item: FinishingCostItem) => {
    setEditingFinishing(item);
    setFormModelBox(item.modelBox);
    setFormMinPrice(String(item.minPrice));
    setFormMaxPrice(String(item.maxPrice));
    setFormInstructions(item.specialInstructions);
    setFinishingFormError('');
    setIsFinishingModalOpen(true);
  };

  const handleSaveFinishing = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedModel = formModelBox.trim();
    const minVal = Number(formMinPrice);
    const maxVal = Number(formMaxPrice);
    const trimmedInstr = formInstructions.trim() || DEFAULT_INSTRUCTION;

    if (!trimmedModel) {
      setFinishingFormError('Nama Model Box wajib diisi.');
      return;
    }
    if (Number.isNaN(minVal) || minVal < 0) {
      setFinishingFormError('Harga minimum tidak valid.');
      return;
    }
    if (Number.isNaN(maxVal) || maxVal < minVal) {
      setFinishingFormError('Harga maksimum harus lebih besar atau sama dengan harga minimum.');
      return;
    }

    if (editingFinishing) {
      setFinishingItems((prev) =>
        prev.map((it) =>
          it.id === editingFinishing.id
            ? {
                ...it,
                modelBox: trimmedModel,
                minPrice: minVal,
                maxPrice: maxVal,
                specialInstructions: trimmedInstr,
              }
            : it
        )
      );
    } else {
      const newItem: FinishingCostItem = {
        id: 'fin-' + Date.now(),
        modelBox: trimmedModel,
        minPrice: minVal,
        maxPrice: maxVal,
        specialInstructions: trimmedInstr,
      };
      setFinishingItems((prev) => [...prev, newItem]);
    }

    setIsFinishingModalOpen(false);
  };

  const handleDeleteFinishing = (id: string) => {
    setFinishingItems((prev) => prev.filter((item) => item.id !== id));
    setDeleteFinishingConfirmId(null);
  };

  // Handlers: Rumus Model
  const openAddFormulaModal = () => {
    setEditingFormula(null);
    setFModelBox('');
    setFBoardBody('P + (2 x T) | L + (2 x T)');
    setFBoardTutup('');
    setFLapisanDalamBody('P + (2 x T) | L + (2 x T)');
    setFLapisanDalamTutup('');
    setFLapisanLuarBody('Total P. Board body + 4cm | L. Board body + 4cm');
    setFLapisanLuarTutup('Total P. Board Tutup + 4cm | L. Board Tutup + 4cm');
    setFPisauBody('((P x 4) + (L + 4) + (T + 8)) x 450');
    setFPisauTutup('');
    setFormulaFormError('');
    setIsFormulaModalOpen(true);
  };

  const openEditFormulaModal = (item: ModelFormulaItem) => {
    setEditingFormula(item);
    setFModelBox(item.modelBox);
    setFBoardBody(item.boardBody);
    setFBoardTutup(item.boardTutup);
    setFLapisanDalamBody(item.lapisanDalamBody);
    setFLapisanDalamTutup(item.lapisanDalamTutup);
    setFLapisanLuarBody(item.lapisanLuarBody);
    setFLapisanLuarTutup(item.lapisanLuarTutup);
    setFPisauBody(item.pisauBody);
    setFPisauTutup(item.pisauTutup);
    setFormulaFormError('');
    setIsFormulaModalOpen(true);
  };

  const handleSaveFormula = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedModel = fModelBox.trim();
    if (!trimmedModel) {
      setFormulaFormError('Nama Model Box wajib diisi.');
      return;
    }

    const payload: Omit<ModelFormulaItem, 'id'> = {
      modelBox: trimmedModel,
      boardBody: fBoardBody.trim(),
      boardTutup: fBoardTutup.trim(),
      lapisanDalamBody: fLapisanDalamBody.trim(),
      lapisanDalamTutup: fLapisanDalamTutup.trim(),
      lapisanLuarBody: fLapisanLuarBody.trim(),
      lapisanLuarTutup: fLapisanLuarTutup.trim(),
      pisauBody: fPisauBody.trim(),
      pisauTutup: fPisauTutup.trim(),
    };

    if (editingFormula) {
      setFormulaItems((prev) =>
        prev.map((it) =>
          it.id === editingFormula.id ? { ...it, ...payload } : it
        )
      );
    } else {
      const newItem: ModelFormulaItem = {
        id: 'rumus-' + Date.now(),
        ...payload,
      };
      setFormulaItems((prev) => [...prev, newItem]);
    }

    setIsFormulaModalOpen(false);
  };

  const handleDeleteFormula = (id: string) => {
    setFormulaItems((prev) => prev.filter((item) => item.id !== id));
    setDeleteFormulaConfirmId(null);
  };

  // Handlers: Modal Ongkir
  const openAddOngkirModal = () => {
    setEditingOngkir(null);
    setFormService('');
    setFormKotaAsal('');
    setFormKotaTujuan('');
    setFormEstimasiTiba('');
    setFormHargaPerKg('');
    setFormMinimumHarga('');
    setOngkirFormError('');
    setIsOngkirModalOpen(true);
  };

  const openEditOngkirModal = (item: ShippingRateItem) => {
    setEditingOngkir(item);
    setFormService(item.service);
    setFormKotaAsal(item.kotaAsal);
    setFormKotaTujuan(item.kotaTujuan);
    setFormEstimasiTiba(item.estimasiTiba);
    setFormHargaPerKg(String(item.hargaPerKg));
    setFormMinimumHarga(String(item.minimumHarga));
    setOngkirFormError('');
    setIsOngkirModalOpen(true);
  };

  const handleSaveOngkir = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedService = formService.trim();
    const trimmedAsal = formKotaAsal.trim();
    const trimmedTujuan = formKotaTujuan.trim();
    const trimmedEstimasi = formEstimasiTiba.trim();
    const hargaPerKgVal = Number(formHargaPerKg);
    const minHargaVal = Number(formMinimumHarga);

    if (!trimmedService) {
      setOngkirFormError('Nama Service Kurir wajib diisi.');
      return;
    }
    if (!trimmedAsal) {
      setOngkirFormError('Kota Asal wajib diisi.');
      return;
    }
    if (!trimmedTujuan) {
      setOngkirFormError('Kota Tujuan wajib diisi.');
      return;
    }
    if (!trimmedEstimasi) {
      setOngkirFormError('Estimasi Tiba wajib diisi.');
      return;
    }
    if (Number.isNaN(hargaPerKgVal) || hargaPerKgVal < 0) {
      setOngkirFormError('Harga Perkg harus berupa angka valid (>= 0).');
      return;
    }
    if (Number.isNaN(minHargaVal) || minHargaVal < 0) {
      setOngkirFormError('Minimum Harga harus berupa angka valid (>= 0).');
      return;
    }

    const maxHargaVal = calculateMaxOngkir(hargaPerKgVal, minHargaVal);

    if (editingOngkir) {
      setOngkirItems((prev) =>
        prev.map((it) =>
          it.id === editingOngkir.id
            ? {
                ...it,
                service: trimmedService,
                kotaAsal: trimmedAsal,
                kotaTujuan: trimmedTujuan,
                estimasiTiba: trimmedEstimasi,
                hargaPerKg: hargaPerKgVal,
                minimumHarga: minHargaVal,
                maximumHarga: maxHargaVal,
              }
            : it
        )
      );
    } else {
      const newItem: ShippingRateItem = {
        id: 'ongkir-' + Date.now(),
        service: trimmedService,
        kotaAsal: trimmedAsal,
        kotaTujuan: trimmedTujuan,
        estimasiTiba: trimmedEstimasi,
        hargaPerKg: hargaPerKgVal,
        minimumHarga: minHargaVal,
        maximumHarga: maxHargaVal,
      };
      setOngkirItems((prev) => [...prev, newItem]);
    }

    setIsOngkirModalOpen(false);
  };

  const handleDeleteOngkir = (id: string) => {
    setOngkirItems((prev) => prev.filter((item) => item.id !== id));
    setDeleteOngkirConfirmId(null);
  };

  const handleResetCurrentMenu = () => {
    if (activeMenu === 'data-bahan') {
      if (activeMaterialTab === 'bahan-dasar') setBahanDasarItems(INITIAL_BAHAN_DASAR_DATA);
      if (activeMaterialTab === 'kertas-std') setKertasStdItems(INITIAL_KERTAS_STD_DATA);
      if (activeMaterialTab === 'kertas-premium') setKertasPremiumItems(INITIAL_KERTAS_PREMIUM_DATA);
      if (activeMaterialTab === 'innerbox') setInnerboxItems(INITIAL_INNERBOX_DATA);
      setDeleteMaterialConfirmId(null);
    } else if (activeMenu === 'data-proses') {
      if (activeProcessTab === 'digital') setDigitalItems(INITIAL_DIGITAL_DATA);
      if (activeProcessTab === 'offset') setOffsetItems(INITIAL_OFFSET_DATA);
      if (activeProcessTab === 'laminasi') setLaminasiItems(INITIAL_LAMINASI_DATA);
      if (activeProcessTab === 'logo') setLogoItems(INITIAL_LOGO_DATA);
      setDeleteProcessConfirmId(null);
    } else if (activeMenu === 'biaya-finishing') {
      setFinishingItems(INITIAL_FINISHING_DATA);
      setFinishingSearch('');
      setDeleteFinishingConfirmId(null);
    } else if (activeMenu === 'rumus-model') {
      setFormulaItems(INITIAL_FORMULA_DATA);
      setFormulaSearch('');
      setDeleteFormulaConfirmId(null);
    } else if (activeMenu === 'modal-ongkir') {
      setOngkirItems(INITIAL_ONGKIR_DATA);
      setOngkirSearch('');
      setDeleteOngkirConfirmId(null);
    } else if (activeMenu === 'ketentuan-logika') {
      if (activeLogicTab === 'logika-model') setLogikaModelItems(INITIAL_LOGIKA_MODEL_DATA);
      if (activeLogicTab === 'logika-mesin') setLogikaMesinItems(INITIAL_LOGIKA_MESIN_DATA);
      if (activeLogicTab === 'logika-proses') setLogikaProsesItems(INITIAL_LOGIKA_PROSES_DATA);
      if (activeLogicTab === 'logika-harga') setLogikaHargaItems(INITIAL_LOGIKA_HARGA_DATA);
      if (activeLogicTab === 'logika-ongkir') setLogikaOngkirItems(INITIAL_LOGIKA_ONGKIR_DATA);
      setDeleteLogicConfirmId(null);
    }
  };

  const handleSelectMenu = (id: MenuKey) => {
    setActiveMenu(id);
    if (KALKULATOR_CHILDREN.some((child) => child.id === id)) {
      setIsKalkulatorOpen(true);
    }
    if (MODAL_KALKULATOR_CHILDREN.some((child) => child.id === id)) {
      setIsModalKalkulatorOpen(true);
    }
    setIsMobileSidebarOpen(false);
  };

  const currentMenuObj = ALL_MENU_ITEMS.find((m) => m.id === activeMenu)!;
  const currentMaterialTabObj = MATERIAL_TABS.find((t) => t.id === activeMaterialTab)!;
  const currentProcessTabObj = PROCESS_TABS.find((t) => t.id === activeProcessTab)!;
  const currentLogicTabObj = LOGIC_TABS.find((t) => t.id === activeLogicTab)!;
  const isChildOfKalkulator = KALKULATOR_CHILDREN.some(
    (child) => child.id === activeMenu
  );
  const isChildOfModalKalkulator = MODAL_KALKULATOR_CHILDREN.some(
    (child) => child.id === activeMenu
  );

  // Dynamic labels for the Data Proses Add/Edit Modal
  const getProcessModalConfig = () => {
    if (activeProcessTab === 'digital') {
      return {
        title: editingProcessId ? 'Ubah Data Cetak Digital' : 'Tambah Data Cetak Digital',
        label1: 'Nama Mesin / Layanan Digital',
        placeholder1: 'Contoh: Digital A3+',
        label2: 'Area Cetak Maksimal',
        placeholder2: 'Contoh: 32 x 48',
        label3: 'Harga Cetak / Lembar',
        placeholder3: 'Contoh: Rp 2.000 / lembar',
        label4: 'Keterangan',
        placeholder4: 'Contoh: Sudah sama kertas',
      };
    }
    if (activeProcessTab === 'offset') {
      return {
        title: editingProcessId ? 'Ubah Data Cetak Offset' : 'Tambah Data Cetak Offset',
        label1: 'Mesin Cetak',
        placeholder1: 'Contoh: Mesin Offset Oliver 58 / GTO 52',
        label2: 'Ukuran Area Cetak',
        placeholder2: 'Contoh: 36 x 52 cm',
        label3: 'Biaya Cetak',
        placeholder3: 'Contoh: Rp 250.000 / min 1000 lbr',
        label4: 'Lebih Druk',
        placeholder4: 'Contoh: Rp 150 / lembar',
      };
    }
    if (activeProcessTab === 'laminasi') {
      return {
        title: editingProcessId ? 'Ubah Data Laminasi' : 'Tambah Data Laminasi',
        label1: 'Jenis Laminasi',
        placeholder1: 'Contoh: Laminasi Doff / Laminasi Glossy',
        label2: 'Max Ukuran',
        placeholder2: 'Contoh: 32 x 48',
        label3: 'Harga',
        placeholder3: 'Contoh: Rp 2.000 atau 0.19',
        label4: 'Biaya Minimum',
        placeholder4: 'Contoh: Rp 2.000 atau Rp 130.000',
        label5: 'Rumus Minimum',
        placeholder5: 'Contoh: Tidak ada rumus. atau =pxlxhargaxjumlah lembar',
      };
    }
    return {
      title: editingProcessId ? 'Ubah Data Proses Logo' : 'Tambah Data Proses Logo',
      label1: 'Jenis Logo',
      placeholder1: 'Contoh: Foil / Embos',
      label2: 'Harga',
      placeholder2: 'Contoh: Rp 550 atau Rp 1.000',
      label3: 'Biaya Min',
      placeholder3: 'Contoh: Rp 75.000 atau Rp 85.000',
      label4: 'Rumus Logo',
      placeholder4: 'Contoh: (P x L x Harga)+50000',
      label5: 'Keterangan',
      placeholder5: 'Contoh: Jika harga akhir dibawah 75 kena min, jika lebih sesuai hitungan.',
    };
  };

  const processModalConfig = getProcessModalConfig();

  return (
    <div className="min-h-screen bg-[#07140F] text-[#F4F1EA] flex">
      {/* Mobile Sidebar Backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar Navigation */}
      <aside
        aria-label="Sidebar Menu Utama PAKEBOX STUDIO"
        className={`fixed inset-y-0 left-0 z-50 flex w-52 shrink-0 flex-col border-r border-[#D4AF37]/20 bg-[#0A1B14] transition-transform duration-200 lg:static lg:translate-x-0 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header inside Sidebar */}
        <div className="flex items-center justify-between border-b border-[#D4AF37]/15 px-3.5 py-3">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              handleSelectMenu('data-proses');
            }}
            className="flex items-center gap-2.5 text-[#E5C158] hover:text-[#F3D77D] transition-colors whitespace-nowrap group"
          >
            <span className="animate-box-jump text-[#E5C158] group-hover:text-[#F3D77D] drop-shadow-[0_2px_8px_rgba(212,175,55,0.35)] transition-colors">
              <Box className="h-5 w-5 stroke-[2.2]" />
            </span>
            <span className="font-bold text-[15px] tracking-tight text-[#E5C158] group-hover:text-[#F3D77D] transition-colors">
              Pakebox Studio
            </span>
          </a>

          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="rounded-lg p-1 text-[#94A89B] hover:bg-[#122D22] hover:text-[#F4F1EA] lg:hidden cursor-pointer"
            aria-label="Tutup menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Menu List */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-2">
          {/* 1. Collapsible Group: Kalkulator (Hardbox, Paperbag, Softbox) */}
          <div>
            <button
              onClick={() => setIsKalkulatorOpen((prev) => !prev)}
              aria-expanded={isKalkulatorOpen}
              className={`flex w-full items-center justify-between gap-1.5 rounded-lg px-2.5 py-1.5 text-left text-xs font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer ${
                isChildOfKalkulator
                  ? 'border border-[#D4AF37]/35 bg-[#122D22] text-[#E5C158]'
                  : 'text-[#A9BEB2] hover:bg-[#122D22] hover:text-[#F3D77D]'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Calculator className="h-3.5 w-3.5 shrink-0 text-[#D4AF37]" />
                <span className="truncate">Kalkulator</span>
              </div>
              {isKalkulatorOpen ? (
                <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[#D4AF37]" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#94A89B]" />
              )}
            </button>

            {/* Submenu Items inside Kalkulator */}
            {isKalkulatorOpen && (
              <div className="mt-0.5 ml-2 space-y-0.5 border-l border-[#D4AF37]/25 pl-2">
                {KALKULATOR_CHILDREN.map((subMenu) => {
                  const Icon = subMenu.icon;
                  const isActive = activeMenu === subMenu.id;
                  return (
                    <button
                      key={subMenu.id}
                      onClick={() => handleSelectMenu(subMenu.id)}
                      className={`flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-[11px] font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer ${
                        isActive
                          ? 'bg-[#D4AF37] text-[#07140F] shadow-sm'
                          : 'text-[#A9BEB2] hover:bg-[#122D22] hover:text-[#F3D77D]'
                      }`}
                    >
                      <Icon
                        className={`h-3 w-3 shrink-0 ${
                          isActive ? 'text-[#07140F]' : 'text-[#D4AF37]'
                        }`}
                      />
                      <span className="truncate">{subMenu.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Collapsible Group: Modal Kalkulator */}
          <div className="pt-0.5">
            <button
              onClick={() => setIsModalKalkulatorOpen((prev) => !prev)}
              aria-expanded={isModalKalkulatorOpen}
              className={`flex w-full items-center justify-between gap-1.5 rounded-lg px-2.5 py-1.5 text-left text-xs font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer ${
                isChildOfModalKalkulator
                  ? 'border border-[#D4AF37]/35 bg-[#122D22] text-[#E5C158]'
                  : 'text-[#A9BEB2] hover:bg-[#122D22] hover:text-[#F3D77D]'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <FolderKanban className="h-3.5 w-3.5 shrink-0 text-[#D4AF37]" />
                <span className="truncate">Modal Kalkulator</span>
              </div>
              {isModalKalkulatorOpen ? (
                <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[#D4AF37]" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#94A89B]" />
              )}
            </button>

            {/* Submenu Items inside Modal Kalkulator */}
            {isModalKalkulatorOpen && (
              <div className="mt-0.5 ml-2 space-y-0.5 border-l border-[#D4AF37]/25 pl-2">
                {MODAL_KALKULATOR_CHILDREN.map((subMenu) => {
                  const Icon = subMenu.icon;
                  const isActive = activeMenu === subMenu.id;
                  return (
                    <button
                      key={subMenu.id}
                      onClick={() => handleSelectMenu(subMenu.id)}
                      className={`flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-[11px] font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer ${
                        isActive
                          ? 'bg-[#D4AF37] text-[#07140F] shadow-sm'
                          : 'text-[#A9BEB2] hover:bg-[#122D22] hover:text-[#F3D77D]'
                      }`}
                    >
                      <Icon
                        className={`h-3 w-3 shrink-0 ${
                          isActive ? 'text-[#07140F]' : 'text-[#D4AF37]'
                        }`}
                      />
                      <span className="truncate">{subMenu.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. Ketentuan Logika */}
          <button
            onClick={() => handleSelectMenu('ketentuan-logika')}
            className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer ${
              activeMenu === 'ketentuan-logika'
                ? 'bg-[#D4AF37] text-[#07140F] shadow-sm'
                : 'text-[#A9BEB2] hover:bg-[#122D22] hover:text-[#F3D77D]'
            }`}
          >
            <Lightbulb
              className={`h-3.5 w-3.5 shrink-0 ${
                activeMenu === 'ketentuan-logika'
                  ? 'text-[#07140F]'
                  : 'text-[#D4AF37]'
              }`}
            />
            <span className="truncate">Ketentuan Logika</span>
          </button>

          {/* Divider before Pengaturan */}
          <div className="my-1.5 border-t border-[#D4AF37]/15 pt-1.5">
            <button
              onClick={() => handleSelectMenu('pengaturan')}
              className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer ${
                activeMenu === 'pengaturan'
                  ? 'bg-[#D4AF37] text-[#07140F] shadow-sm'
                  : 'text-[#A9BEB2] hover:bg-[#122D22] hover:text-[#F3D77D]'
              }`}
            >
              <Settings
                className={`h-3.5 w-3.5 shrink-0 ${
                  activeMenu === 'pengaturan'
                    ? 'text-[#07140F]'
                    : 'text-[#D4AF37]'
                }`}
              />
              <span className="truncate">Pengaturan</span>
            </button>
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-[#D4AF37]/15 p-2 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-[#8FA599] px-1">
            <span>Mode Aplikasi</span>
            <span>Client PWA</span>
          </div>
          <div className="flex flex-col">
            <PWAInstallButton />
          </div>
        </div>
      </aside>

      {/* Right Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Bar Contract: Context Breadcrumb — Primary Actions */}
        <header className="border-b border-[#D4AF37]/20 bg-[#07140F]/90 backdrop-blur-md">
          <div className="flex items-center justify-between px-3 py-2 sm:px-5">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="rounded-lg border border-[#D4AF37]/25 bg-[#0C2017] p-1.5 text-[#E5C158] hover:bg-[#122D22] lg:hidden cursor-pointer"
                aria-label="Buka menu navigasi"
              >
                <Menu className="h-4 w-4" />
              </button>

              <div className="flex flex-wrap items-center gap-1.5 text-[11px] sm:text-xs text-[#94A89B]">
                <span>Pakebox Studio</span>
                {isChildOfKalkulator && (
                  <>
                    <span aria-hidden="true">/</span>
                    <span>Kalkulator</span>
                  </>
                )}
                {isChildOfModalKalkulator && (
                  <>
                    <span aria-hidden="true">/</span>
                    <span>Modal Kalkulator</span>
                  </>
                )}
                <span aria-hidden="true">/</span>
                <span className="font-semibold text-[#E5C158]">
                  {currentMenuObj.label}
                </span>
                {activeMenu === 'data-bahan' && (
                  <>
                    <span aria-hidden="true">/</span>
                    <span className="text-[#F4F1EA] font-medium">
                      {currentMaterialTabObj.label}
                    </span>
                  </>
                )}
                {activeMenu === 'data-proses' && (
                  <>
                    <span aria-hidden="true">/</span>
                    <span className="text-[#F4F1EA] font-medium">
                      {currentProcessTabObj.label}
                    </span>
                  </>
                )}
                {activeMenu === 'ketentuan-logika' && (
                  <>
                    <span aria-hidden="true">/</span>
                    <span className="text-[#F4F1EA] font-medium">
                      {currentLogicTabObj.label}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {(activeMenu === 'data-bahan' ||
                activeMenu === 'data-proses' ||
                activeMenu === 'biaya-finishing' ||
                activeMenu === 'rumus-model' ||
                activeMenu === 'ketentuan-logika') && (
                <button
                  onClick={handleResetCurrentMenu}
                  className="flex items-center gap-1.5 rounded-md border border-[#D4AF37]/25 bg-[#0C2017] px-2.5 py-1 text-[11px] font-medium text-[#B8C7BE] hover:border-[#D4AF37]/50 hover:text-[#F3D77D] transition-colors whitespace-nowrap cursor-pointer"
                  title="Kembalikan data referensi awal"
                >
                  <RotateCcw className="h-3 w-3 text-[#D4AF37]" />
                  <span>Reset Referensi</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Main Viewport */}
        <main className="flex-1 p-3 sm:p-4 lg:p-4 overflow-x-hidden">
          {activeMenu === 'kalkulator-box' ? (
            /* Kalkulator Box View: 2 Cards (Kiri: Penginputan Data, Kanan: Ringkasan Estimasi) */
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
              {/* CARD KIRI: Penginputan Data untuk Proses Hitung */}
              <section className="xl:col-span-7 rounded-xl border border-[#D4AF37]/25 bg-[#0C2017] p-3.5 sm:p-4 shadow-lg">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-[#D4AF37]/15">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Calculator className="h-4 w-4 text-[#D4AF37] shrink-0" />
                      <h1 className="text-sm sm:text-base font-bold text-[#E5C158] tracking-tight">
                        Penginputan Data Proses Hitung
                      </h1>
                    </div>
                    <p className="text-[11px] text-[#8FA599]">
                      Pilih model box, dimensi (P x L x T), bahan dasar, pelapis kertas, dan kuantitas
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleResetCalculatorInputs}
                    className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-md border border-[#D4AF37]/25 bg-[#081610] px-2.5 py-1 text-[11px] font-semibold text-[#B8C7BE] hover:border-[#D4AF37]/50 hover:text-[#F3D77D] transition-colors cursor-pointer shrink-0"
                  >
                    <RotateCcw className="h-3 w-3 text-[#D4AF37]" />
                    <span>Reset Input</span>
                  </button>
                </div>

                <div className="mt-3.5 space-y-3">
                  {/* 1. Model Box (Ambil dari Rumus Model) */}
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#E5C158] mb-1">
                      Model Box
                    </label>
                    <select
                      value={calcModelId}
                      onChange={(e) => setCalcModelId(e.target.value)}
                      className="w-full rounded-lg border border-[#D4AF37]/25 bg-[#081610] px-3 py-1.5 text-xs font-medium text-[#F4F1EA] focus:border-[#D4AF37] focus:outline-none transition-colors cursor-pointer"
                    >
                      <option value="">-- Pilih Model Box --</option>
                      {formulaItems.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.modelBox}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 2. Ukuran Box: P x L x T */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#E5C158]">
                        Ukuran Box : P x L x T (cm)
                      </label>
                      <span className="text-[10px] text-[#8FA599]">
                        Ketik langsung atau hapus angka 0
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {/* Panjang (P) */}
                      <div className="rounded-lg border border-[#D4AF37]/20 bg-[#081610] p-2 focus-within:border-[#D4AF37] transition-colors">
                        <label className="block text-[10px] font-semibold text-[#94A89B] mb-0.5">
                          Panjang (P)
                        </label>
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={calcP}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => handleCalcNumberChange(e.target.value, setCalcP)}
                            placeholder="0"
                            className="w-full bg-transparent font-mono-tabular text-sm sm:text-base font-bold text-[#F4F1EA] placeholder-[#5E7468] focus:outline-none"
                          />
                          <span className="text-[10px] font-medium text-[#8FA599]">cm</span>
                        </div>
                      </div>

                      {/* Lebar (L) */}
                      <div className="rounded-lg border border-[#D4AF37]/20 bg-[#081610] p-2 focus-within:border-[#D4AF37] transition-colors">
                        <label className="block text-[10px] font-semibold text-[#94A89B] mb-0.5">
                          Lebar (L)
                        </label>
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={calcL}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => handleCalcNumberChange(e.target.value, setCalcL)}
                            placeholder="0"
                            className="w-full bg-transparent font-mono-tabular text-sm sm:text-base font-bold text-[#F4F1EA] placeholder-[#5E7468] focus:outline-none"
                          />
                          <span className="text-[10px] font-medium text-[#8FA599]">cm</span>
                        </div>
                      </div>

                      {/* Tinggi (T) */}
                      <div className="rounded-lg border border-[#D4AF37]/20 bg-[#081610] p-2 focus-within:border-[#D4AF37] transition-colors">
                        <label className="block text-[10px] font-semibold text-[#94A89B] mb-0.5">
                          Tinggi (T)
                        </label>
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={calcT}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => handleCalcNumberChange(e.target.value, setCalcT)}
                            placeholder="0"
                            className="w-full bg-transparent font-mono-tabular text-sm sm:text-base font-bold text-[#F4F1EA] placeholder-[#5E7468] focus:outline-none"
                          />
                          <span className="text-[10px] font-medium text-[#8FA599]">cm</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. Bahan Body & Bahan Tutup (Hanya Nama Bahan) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#E5C158] mb-1">
                        Bahan Body <span className="text-[10px] font-normal text-[#8FA599] normal-case">(Bahan Dasar)</span>
                      </label>
                      <select
                        value={calcBahanBodyName}
                        onChange={(e) => setCalcBahanBodyName(e.target.value)}
                        className="w-full rounded-lg border border-[#D4AF37]/25 bg-[#081610] px-2.5 py-1.5 text-xs text-[#F4F1EA] focus:border-[#D4AF37] focus:outline-none transition-colors cursor-pointer"
                      >
                        <option value="">-- Pilih Bahan Body --</option>
                        {uniqueBahanDasarNames.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#E5C158] mb-1">
                        Bahan Tutup <span className="text-[10px] font-normal text-[#8FA599] normal-case">(Bahan Dasar)</span>
                      </label>
                      <select
                        value={calcBahanTutupName}
                        onChange={(e) => setCalcBahanTutupName(e.target.value)}
                        className="w-full rounded-lg border border-[#D4AF37]/25 bg-[#081610] px-2.5 py-1.5 text-xs text-[#F4F1EA] focus:border-[#D4AF37] focus:outline-none transition-colors cursor-pointer"
                      >
                        <option value="">-- Pilih Bahan Tutup / Tidak Pakai --</option>
                        {uniqueBahanDasarNames.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 4. L. Body Dalam & L. Body Luar (Hanya Nama Kertas Std & Premium) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#E5C158] mb-1">
                        L. Body Dalam <span className="text-[10px] font-normal text-[#8FA599] normal-case">(Std / Premium)</span>
                      </label>
                      <select
                        value={calcLBodyDalamName}
                        onChange={(e) => setCalcLBodyDalamName(e.target.value)}
                        className="w-full rounded-lg border border-[#D4AF37]/25 bg-[#081610] px-2.5 py-1.5 text-xs text-[#F4F1EA] focus:border-[#D4AF37] focus:outline-none transition-colors cursor-pointer"
                      >
                        <option value="">-- Pilih L. Body Dalam --</option>
                        <optgroup label="Kertas Std">
                          {uniqueKertasStdNames.map((name) => (
                            <option key={name} value={name}>
                              {name}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Kertas Premium">
                          {uniqueKertasPremiumNames.map((name) => (
                            <option key={name} value={name}>
                              {name}
                            </option>
                          ))}
                        </optgroup>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#E5C158] mb-1">
                        L. Body Luar <span className="text-[10px] font-normal text-[#8FA599] normal-case">(Std / Premium)</span>
                      </label>
                      <select
                        value={calcLBodyLuarName}
                        onChange={(e) => setCalcLBodyLuarName(e.target.value)}
                        className="w-full rounded-lg border border-[#D4AF37]/25 bg-[#081610] px-2.5 py-1.5 text-xs text-[#F4F1EA] focus:border-[#D4AF37] focus:outline-none transition-colors cursor-pointer"
                      >
                        <option value="">-- Pilih L. Body Luar --</option>
                        <optgroup label="Kertas Std">
                          {uniqueKertasStdNames.map((name) => (
                            <option key={name} value={name}>
                              {name}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Kertas Premium">
                          {uniqueKertasPremiumNames.map((name) => (
                            <option key={name} value={name}>
                              {name}
                            </option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                  </div>

                  {/* 5. L. Tutup Dalam & L. Tutup Luar (Hanya Nama Kertas Std & Premium) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#E5C158] mb-1">
                        L. Tutup Dalam <span className="text-[10px] font-normal text-[#8FA599] normal-case">(Std / Premium)</span>
                      </label>
                      <select
                        value={calcLTutupDalamName}
                        onChange={(e) => setCalcLTutupDalamName(e.target.value)}
                        className="w-full rounded-lg border border-[#D4AF37]/25 bg-[#081610] px-2.5 py-1.5 text-xs text-[#F4F1EA] focus:border-[#D4AF37] focus:outline-none transition-colors cursor-pointer"
                      >
                        <option value="">-- Pilih L. Tutup Dalam / Tidak Pakai --</option>
                        <optgroup label="Kertas Std">
                          {uniqueKertasStdNames.map((name) => (
                            <option key={name} value={name}>
                              {name}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Kertas Premium">
                          {uniqueKertasPremiumNames.map((name) => (
                            <option key={name} value={name}>
                              {name}
                            </option>
                          ))}
                        </optgroup>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#E5C158] mb-1">
                        L. Tutup Luar <span className="text-[10px] font-normal text-[#8FA599] normal-case">(Std / Premium)</span>
                      </label>
                      <select
                        value={calcLTutupLuarName}
                        onChange={(e) => setCalcLTutupLuarName(e.target.value)}
                        className="w-full rounded-lg border border-[#D4AF37]/25 bg-[#081610] px-2.5 py-1.5 text-xs text-[#F4F1EA] focus:border-[#D4AF37] focus:outline-none transition-colors cursor-pointer"
                      >
                        <option value="">-- Pilih L. Tutup Luar / Tidak Pakai --</option>
                        <optgroup label="Kertas Std">
                          {uniqueKertasStdNames.map((name) => (
                            <option key={name} value={name}>
                              {name}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Kertas Premium">
                          {uniqueKertasPremiumNames.map((name) => (
                            <option key={name} value={name}>
                              {name}
                            </option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                  </div>

                  {/* 6. Innerbox (Default Kosong, Klik Tambah untuk Pilih Nama Bahan dari Data Innerbox) */}
                  <div className="rounded-lg border border-[#D4AF37]/20 bg-[#081610]/70 p-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#E5C158]">
                          Innerbox
                        </label>
                        <p className="text-[10px] text-[#8FA599]">
                          {calcInnerboxList.length === 0
                            ? 'Default kosong (Tanpa Innerbox). Klik tombol tambah jika menggunakan innerbox.'
                            : `${calcInnerboxList.length} komponen innerbox dipilih.`}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddCalcInnerbox}
                        className="inline-flex items-center gap-1 rounded-md bg-[#D4AF37] px-2.5 py-1 text-[11px] font-semibold text-[#07140F] hover:bg-[#E5C158] transition-colors cursor-pointer shrink-0 shadow-xs"
                      >
                        <Plus className="h-3 w-3 stroke-[2.5]" />
                        <span>Tambah Inner</span>
                      </button>
                    </div>

                    {calcInnerboxList.length > 0 && (
                      <div className="mt-2 space-y-1.5 border-t border-[#D4AF37]/15 pt-2">
                        {calcInnerboxList.map((selectedInnerName, idx) => (
                          <div key={idx} className="flex items-center gap-1.5">
                            <select
                              value={selectedInnerName}
                              onChange={(e) => handleUpdateCalcInnerbox(idx, e.target.value)}
                              className="flex-1 rounded-md border border-[#D4AF37]/25 bg-[#0C2017] px-2.5 py-1.5 text-xs text-[#F4F1EA] focus:border-[#D4AF37] focus:outline-none transition-colors cursor-pointer"
                            >
                              <option value="">-- Pilih Bahan Innerbox --</option>
                              {uniqueInnerboxNames.map((name) => (
                                <option key={name} value={name}>
                                  {name}
                                </option>
                              ))}
                            </select>

                            <button
                              type="button"
                              onClick={() => handleRemoveCalcInnerbox(idx)}
                              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#F43F5E]/25 bg-[#2A1216] text-[#F43F5E] hover:bg-[#3F1920] hover:border-[#F43F5E]/50 transition-colors cursor-pointer"
                              title="Hapus Innerbox"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 6B. Tambah Logo (Ambil dari Data Proses / Logo: Pilihan Std vs Custom) */}
                  <div className="rounded-lg border border-[#D4AF37]/20 bg-[#081610]/70 p-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#E5C158]">
                          Logo
                        </label>
                        <p className="text-[10px] text-[#8FA599]">
                          {calcLogoList.length === 0
                            ? 'Default kosong (Tanpa Logo). Klik tombol Tambah Logo jika menggunakan logo.'
                            : `${calcLogoList.length} proses logo dipilih.`}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddCalcLogo}
                        className="inline-flex items-center gap-1 rounded-md bg-[#D4AF37] px-2.5 py-1 text-[11px] font-semibold text-[#07140F] hover:bg-[#E5C158] transition-colors cursor-pointer shrink-0 shadow-xs"
                      >
                        <Plus className="h-3 w-3 stroke-[2.5]" />
                        <span>Tambah Logo</span>
                      </button>
                    </div>

                    {calcLogoList.length > 0 && (
                      <div className="mt-2 space-y-2 border-t border-[#D4AF37]/15 pt-2">
                        {calcLogoList.map((logoEntry, idx) => {
                          const selectedLogoObj = logoItems.find(
                            (l) => l.id === logoEntry.logoId
                          );
                          const namaJenisLogo = selectedLogoObj?.jenisLogo || 'Logo';
                          const biayaMinVal = parseRupiahNumber(selectedLogoObj?.biayaMin);
                          const hargaLogoVal = parseRupiahNumber(selectedLogoObj?.harga);
                          const stdPricePreview = biayaMinVal + 50000;

                          const boxPVal = parseFloat((calcP || '0').replace(',', '.')) || 0;
                          const boxLVal = parseFloat((calcL || '0').replace(',', '.')) || 0;
                          const effCustomP =
                            parseFloat((logoEntry.customP || '0').replace(',', '.')) || boxPVal;
                          const effCustomL =
                            parseFloat((logoEntry.customL || '0').replace(',', '.')) || boxLVal;
                          const customPricePreview = selectedLogoObj
                            ? evaluateLogoFormula(
                                selectedLogoObj.rumusLogo,
                                effCustomP,
                                effCustomL,
                                hargaLogoVal
                              )
                            : 0;

                          return (
                            <div
                              key={idx}
                              className="rounded-lg border border-[#D4AF37]/20 bg-[#0C2017] p-2.5 space-y-2"
                            >
                              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                {/* Pilihan Jenis Logo dari Data Proses / Logo */}
                                <select
                                  value={logoEntry.logoId}
                                  onChange={(e) => handleUpdateCalcLogoId(idx, e.target.value)}
                                  className="flex-1 rounded-md border border-[#D4AF37]/25 bg-[#081610] px-2.5 py-1.5 text-xs font-medium text-[#F4F1EA] focus:border-[#D4AF37] focus:outline-none transition-colors cursor-pointer"
                                >
                                  <option value="">-- Pilih Jenis Logo --</option>
                                  {logoItems.map((logo) => (
                                    <option key={logo.id} value={logo.id}>
                                      {logo.jenisLogo}
                                    </option>
                                  ))}
                                </select>

                                {/* Ketika dipilih Foil / Embos / Logo lain, muncul pilihan Std atau Custom */}
                                {selectedLogoObj && (
                                  <select
                                    value={logoEntry.variant}
                                    onChange={(e) =>
                                      handleUpdateCalcLogoVariant(
                                        idx,
                                        e.target.value as LogoVariantType
                                      )
                                    }
                                    className="flex-1 rounded-md border border-[#D4AF37]/35 bg-[#081610] px-2.5 py-1.5 text-xs font-semibold text-[#E5C158] focus:border-[#D4AF37] focus:outline-none transition-colors cursor-pointer"
                                  >
                                    <option value="std">{namaJenisLogo} Std</option>
                                    <option value="custom">{namaJenisLogo} Custom</option>
                                  </select>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleRemoveCalcLogo(idx)}
                                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center self-end sm:self-auto rounded-md border border-[#F43F5E]/25 bg-[#2A1216] text-[#F43F5E] hover:bg-[#3F1920] hover:border-[#F43F5E]/50 transition-colors cursor-pointer"
                                  title="Hapus Logo"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>

                              {/* Tombol Cepat & Info Rumus untuk Std vs Custom */}
                              {selectedLogoObj && (
                                <div className="space-y-1.5 pt-1 border-t border-[#D4AF37]/15">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateCalcLogoVariant(idx, 'std')}
                                      className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                                        logoEntry.variant === 'std'
                                          ? 'bg-[#D4AF37] text-[#07140F]'
                                          : 'border border-[#D4AF37]/25 bg-[#081610] text-[#A9BEB2] hover:text-[#F3D77D]'
                                      }`}
                                    >
                                      {namaJenisLogo} Std
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateCalcLogoVariant(idx, 'custom')}
                                      className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                                        logoEntry.variant === 'custom'
                                          ? 'bg-[#D4AF37] text-[#07140F]'
                                          : 'border border-[#D4AF37]/25 bg-[#081610] text-[#A9BEB2] hover:text-[#F3D77D]'
                                      }`}
                                    >
                                      {namaJenisLogo} Custom
                                    </button>
                                  </div>

                                  {logoEntry.variant === 'std' ? (
                                    <div className="rounded-md border border-[#D4AF37]/15 bg-[#081610] px-2.5 py-1.5 text-[11px] text-[#B8C7BE] font-mono-tabular">
                                      <span className="font-semibold text-[#E5C158]">
                                        {namaJenisLogo} Std
                                      </span>{' '}
                                      : Min ({formatRupiah(biayaMinVal)}) + Rp 50.000 ={' '}
                                      <span className="font-bold text-[#F3D77D]">
                                        {formatRupiah(stdPricePreview)}
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="space-y-1.5">
                                      <div className="grid grid-cols-2 gap-2">
                                        <div className="rounded-md border border-[#D4AF37]/20 bg-[#081610] px-2.5 py-1.5">
                                          <label className="block text-[9px] font-semibold text-[#94A89B] mb-0.5">
                                            P Logo (cm)
                                          </label>
                                          <input
                                            type="text"
                                            inputMode="decimal"
                                            value={logoEntry.customP}
                                            onFocus={(e) => e.target.select()}
                                            onChange={(e) =>
                                              handleUpdateCalcLogoDimension(
                                                idx,
                                                'customP',
                                                e.target.value
                                              )
                                            }
                                            placeholder="0"
                                            className="w-full bg-transparent font-mono-tabular text-xs font-bold text-[#F4F1EA] focus:outline-none"
                                          />
                                        </div>
                                        <div className="rounded-md border border-[#D4AF37]/20 bg-[#081610] px-2.5 py-1.5">
                                          <label className="block text-[9px] font-semibold text-[#94A89B] mb-0.5">
                                            L Logo (cm)
                                          </label>
                                          <input
                                            type="text"
                                            inputMode="decimal"
                                            value={logoEntry.customL}
                                            onFocus={(e) => e.target.select()}
                                            onChange={(e) =>
                                              handleUpdateCalcLogoDimension(
                                                idx,
                                                'customL',
                                                e.target.value
                                              )
                                            }
                                            placeholder="0"
                                            className="w-full bg-transparent font-mono-tabular text-xs font-bold text-[#F4F1EA] focus:outline-none"
                                          />
                                        </div>
                                      </div>

                                      <div className="rounded-md border border-[#D4AF37]/15 bg-[#081610] px-2.5 py-1.5 text-[11px] text-[#B8C7BE] font-mono-tabular">
                                        <span className="font-semibold text-[#E5C158]">
                                          {namaJenisLogo} Custom
                                        </span>{' '}
                                        : {selectedLogoObj.rumusLogo}{' '}
                                        {effCustomP > 0 && effCustomL > 0 && (
                                          <>
                                            → ({effCustomP}x{effCustomL}x{formatRupiah(hargaLogoVal)})+50k ={' '}
                                            <span className="font-bold text-[#F3D77D]">
                                              {formatRupiah(customPricePreview)}
                                            </span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* 7. Qty (Input Angka Manual) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#E5C158]">
                        Qty (Jumlah Pesanan Box)
                      </label>
                      <span className="text-[10px] text-[#8FA599]">
                        Input angka manual (pcs)
                      </span>
                    </div>

                    <div className="flex items-center rounded-lg border border-[#D4AF37]/25 bg-[#081610] px-3 py-1.5 focus-within:border-[#D4AF37] transition-colors">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={calcQty}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => handleCalcNumberChange(e.target.value, setCalcQty)}
                        placeholder="0"
                        className="w-full bg-transparent font-mono-tabular text-sm sm:text-base font-bold text-[#F4F1EA] placeholder-[#5E7468] focus:outline-none"
                      />
                      <span className="ml-2 text-[11px] font-semibold uppercase tracking-wider text-[#D4AF37]">
                        Pcs
                      </span>
                    </div>
                  </div>

                  {calcError && (
                    <div className="rounded-lg border border-[#F43F5E]/40 bg-[#2A1216] px-3 py-2 text-[11px] text-[#FDA4AF]">
                      {calcError}
                    </div>
                  )}

                  {/* Informasi Analisis Pisau Pond (+1 cm) & Biaya Pisau (Sebelum Tombol Hitung Harga) */}
                  <div className="rounded-lg border border-[#D4AF37]/35 bg-[#161B20]/90 px-3 py-2 space-y-1 shadow-inner">
                    <div className="flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5 text-[#E5C158] shrink-0" />
                      <h4 className="text-xs font-bold text-[#E5C158]">
                        Analisis Pisau Pond (+1 cm) &amp; Biaya Pisau:
                      </h4>
                    </div>

                    <div className="pl-5 space-y-0.5 font-mono-tabular text-[11px] leading-relaxed">
                      <div>
                        <span className="font-semibold text-[#E5C158]">
                          - Board Body ({livePondAnalysis.rawBodyP.toFixed(1)} x{' '}
                          {livePondAnalysis.rawBodyL.toFixed(1)} cm):
                        </span>{' '}
                        {livePondAnalysis.isActive ? (
                          <span className="font-semibold text-emerald-400">
                            AKTIF! +1cm ({livePondAnalysis.finalBodyP.toFixed(1)} x{' '}
                            {livePondAnalysis.finalBodyL.toFixed(1)} cm | Pisau:{' '}
                            {formatRupiah(livePondAnalysis.pisauBodyCost)})
                          </span>
                        ) : (
                          <span className="font-semibold text-[#94A89B]">
                            TIDAK AKTIF (Tetap {livePondAnalysis.rawBodyP.toFixed(1)} x{' '}
                            {livePondAnalysis.rawBodyL.toFixed(1)} cm)
                          </span>
                        )}
                      </div>

                      <div>
                        <span className="font-semibold text-[#E5C158]">
                          - Board Tutup ({livePondAnalysis.rawTutupP.toFixed(1)} x{' '}
                          {livePondAnalysis.rawTutupL.toFixed(1)} cm):
                        </span>{' '}
                        {livePondAnalysis.isActive ? (
                          <span className="font-semibold text-emerald-400">
                            AKTIF! +1cm ({livePondAnalysis.finalTutupP.toFixed(1)} x{' '}
                            {livePondAnalysis.finalTutupL.toFixed(1)} cm | Pisau:{' '}
                            {formatRupiah(livePondAnalysis.pisauTutupCost)})
                          </span>
                        ) : (
                          <span className="font-semibold text-[#94A89B]">
                            TIDAK AKTIF (Tetap {livePondAnalysis.rawTutupP.toFixed(1)} x{' '}
                            {livePondAnalysis.rawTutupL.toFixed(1)} cm)
                          </span>
                        )}
                      </div>

                      <div>
                        <span className="font-semibold text-[#E5C158]">
                          - Pisau Innerbox ({(parseFloat((calcP || '0').replace(',', '.')) || 0).toFixed(1)} x{' '}
                          {(parseFloat((calcL || '0').replace(',', '.')) || 0).toFixed(1)} cm):
                        </span>{' '}
                        {livePondAnalysis.isInnerboxActive ? (
                          <span className="font-semibold text-emerald-400">
                            AKTIF! (Memilih Tambah Inner | Pisau:{' '}
                            {formatRupiah(livePondAnalysis.pisauInnerboxCost)})
                          </span>
                        ) : (
                          <span className="font-semibold text-[#94A89B]">
                            TIDAK AKTIF (Tidak memilih Tambah Inner)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 8. Tombol Klik Hitung Harga */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleHitungHarga}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#D4AF37] px-4 py-2.5 text-xs sm:text-sm font-bold text-[#07140F] hover:bg-[#E5C158] transition-all duration-150 cursor-pointer shadow-md"
                    >
                      <Calculator className="h-4 w-4 stroke-[2.5]" />
                      <span>Hitung Harga</span>
                    </button>
                  </div>
                </div>
              </section>

              {/* CARD KANAN: Ringkasan Estimasi */}
              <section className="xl:col-span-5 rounded-xl border border-[#D4AF37]/25 bg-[#0C2017] p-3.5 sm:p-4 shadow-lg flex flex-col min-h-[480px]">
                <div className="pb-3 border-b border-[#D4AF37]/15">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#D4AF37] shrink-0" />
                    <h2 className="text-sm sm:text-base font-bold text-[#E5C158] tracking-tight">
                      Ringkasan Estimasi
                    </h2>
                  </div>
                  <p className="text-[11px] text-[#8FA599] mt-0.5">
                    Hasil kalkulasi ukuran potong bersih, perbandingan mesin cetak, dan HPP modal
                  </p>
                </div>

                {!calcResult ? (
                  <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#D4AF37]/35 bg-[#122D22] text-[#D4AF37] shadow-inner mb-3">
                      <Calculator className="h-6 w-6" />
                    </div>

                    <h3 className="font-display text-base sm:text-lg font-bold tracking-wide text-[#E5C158] uppercase">
                      SIAP HITUNG HARGA
                    </h3>

                    <p className="mt-1 max-w-sm text-[11px] text-[#8FA599] leading-relaxed">
                      Masukkan ukuran <strong>P x L x T</strong> serta <strong>Qty</strong> pada card sebelah kiri, lalu klik tombol{' '}
                      <strong className="text-[#E5C158]">Hitung Harga</strong>.
                    </p>
                  </div>
                ) : (
                  <div className="mt-3.5 space-y-3 text-xs">
                    {/* 0. Keputusan Sistem Otomatis (Bahan, Format, Metode, Layout, Kebutuhan, Biaya) */}
                    <div className="rounded-lg border border-[#D4AF37]/35 bg-[#122D22]/80 p-3 space-y-1.5">
                      <h3 className="font-bold text-[#E5C158] text-xs border-b border-[#D4AF37]/20 pb-1.5">
                        Keputusan Sistem Otomatis (Kombinasi Termurah):
                      </h3>
                      <div className="grid grid-cols-1 gap-1 font-mono-tabular text-[11px] leading-relaxed text-[#F4F1EA]">
                        <div>
                          <span className="text-[#94A89B]">Bahan:</span>{' '}
                          <span className="font-semibold text-[#E5C158]">
                            {calcResult.systemDecision.bahan}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#94A89B]">Format:</span>{' '}
                          <span className="font-semibold text-[#F4F1EA]">
                            {calcResult.systemDecision.format}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#94A89B]">Metode:</span>{' '}
                          <span className="font-semibold text-emerald-400">
                            {calcResult.systemDecision.metode}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#94A89B]">Layout:</span>{' '}
                          <span className="font-semibold text-[#F4F1EA]">
                            {calcResult.systemDecision.layout}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#94A89B]">Kebutuhan:</span>{' '}
                          <span className="font-semibold text-[#F4F1EA]">
                            {calcResult.systemDecision.kebutuhan}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#94A89B]">
                            {calcResult.isLaminasiActive
                              ? 'Biaya Cetak + Kertas + Laminasi:'
                              : 'Biaya Cetak + Kertas:'}
                          </span>{' '}
                          <span className="font-bold text-[#E5C158]">
                            {formatRupiah(calcResult.systemDecision.biaya)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 1. Material & Ukuran Potong Bersih */}
                    <div className="rounded-lg border border-[#D4AF37]/20 bg-[#081610] p-3 space-y-2.5">
                      <h3 className="font-bold text-[#E5C158] text-xs border-b border-[#D4AF37]/15 pb-1.5">
                        Material &amp; Ukuran Potong Bersih:
                      </h3>

                      <div className="space-y-0.5">
                        <div className="font-semibold text-[11px] text-[#F3D77D]">Karton / Board</div>
                        <p className="font-mono-tabular text-[11px] leading-relaxed text-[#E2ECE6]">
                          {calcResult.boardBodyLine}
                        </p>
                        <p className="font-mono-tabular text-[11px] leading-relaxed text-[#E2ECE6]">
                          {calcResult.boardTutupLine}
                        </p>
                      </div>

                      <div className="space-y-0.5">
                        <div className="font-semibold text-[11px] text-[#F3D77D]">Lapisan Dalam</div>
                        <p className="font-mono-tabular text-[11px] leading-relaxed text-[#E2ECE6]">
                          {calcResult.lapisanDalamBodyLine}
                        </p>
                        <p className="font-mono-tabular text-[11px] leading-relaxed text-[#E2ECE6]">
                          {calcResult.lapisanDalamTutupLine}
                        </p>
                      </div>

                      <div className="space-y-0.5">
                        <div className="font-semibold text-[11px] text-[#F3D77D]">Lapisan Luar</div>
                        <p className="font-mono-tabular text-[11px] leading-relaxed text-[#E2ECE6]">
                          {calcResult.lapisanLuarBodyLine}
                        </p>
                        <p className="font-mono-tabular text-[11px] leading-relaxed text-[#E2ECE6]">
                          {calcResult.lapisanLuarTutupLine}
                        </p>
                      </div>

                      {calcResult.innerboxLines.length > 0 && (
                        <div className="space-y-0.5">
                          <div className="font-semibold text-[11px] text-[#F3D77D]">Innerbox</div>
                          {calcResult.innerboxLines.map((line, idx) => (
                            <p
                              key={idx}
                              className="font-mono-tabular text-[11px] leading-relaxed text-[#E2ECE6]"
                            >
                              {line}
                            </p>
                          ))}
                        </div>
                      )}

                      {calcResult.logoLines.length > 0 && (
                        <div className="space-y-0.5">
                          <div className="font-semibold text-[11px] text-[#F3D77D]">Logo</div>
                          {calcResult.logoLines.map((line, idx) => (
                            <p
                              key={idx}
                              className="font-mono-tabular text-[11px] leading-relaxed text-[#E2ECE6]"
                            >
                              {line}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 2. Estimasi Rincian Biaya */}
                    <div className="rounded-lg border border-[#D4AF37]/20 bg-[#081610] p-3 space-y-2">
                      <h3 className="font-bold text-[#E5C158] text-xs border-b border-[#D4AF37]/15 pb-1.5">
                        Estimasi Rincian Biaya:
                      </h3>

                      <ul className="space-y-1 font-mono-tabular text-[11px] leading-relaxed text-[#F4F1EA]">
                        <li>
                          - <span className="font-semibold text-[#E5C158]">{formatRupiah(calcResult.boardCost)}</span> : {calcResult.boardLabel}
                        </li>
                        <li>
                          - <span className="font-semibold text-[#E5C158]">{formatRupiah(calcResult.lapisanDalamCost)}</span> : Lapisan Dalam
                        </li>
                        {calcResult.outerPaperName.toLowerCase().startsWith('ap') ? (
                          <>
                            <li>
                              - <span className="font-semibold text-[#E5C158]">{formatRupiah(calcResult.lapisanLuarPaperCost)}</span> : {calcResult.lapisanLuarPaperNote}
                            </li>
                            <li>
                              - <span className="font-semibold text-[#E5C158]">{formatRupiah(calcResult.cetakCost)}</span> : {calcResult.cetakLabel}
                            </li>
                          </>
                        ) : (
                          <li>
                            - <span className="font-semibold text-[#E5C158]">{formatRupiah(calcResult.lapisanLuarPaperCost + calcResult.cetakCost)}</span> : Lapisan Luar ({calcResult.outerPaperName})
                          </li>
                        )}
                        {calcResult.isLaminasiActive && (
                          <li>
                            - <span className="font-semibold text-[#E5C158]">{formatRupiah(calcResult.laminasiCost)}</span> : {calcResult.laminasiLabel}
                          </li>
                        )}
                        <li>
                          - <span className="font-semibold text-[#E5C158]">{formatRupiah(calcResult.finishingCost)}</span> : Finishing (Jasa Rakit Dinamis @{formatRupiah(calcResult.finishingRatePerPcs)}/pcs)
                        </li>
                        {calcResult.isPondActive && (
                          <>
                            <li>
                              - <span className="font-semibold text-[#E5C158]">{formatRupiah(calcResult.ongkosPondCost)}</span> : Ongkos Pond / Druk
                            </li>
                            <li>
                              - <span className="font-semibold text-[#E5C158]">{formatRupiah(calcResult.pisauPondCost)}</span> : Biaya Pembuatan Pisau Pond Cetakan
                            </li>
                          </>
                        )}
                        {calcResult.innerboxCost > 0 && (
                          <li>
                            - <span className="font-semibold text-[#E5C158]">{formatRupiah(calcResult.innerboxCost)}</span> : Innerbox
                          </li>
                        )}
                        {calcResult.isPisauInnerboxActive && calcResult.pisauInnerboxCost > 0 && (
                          <li>
                            - <span className="font-semibold text-[#E5C158]">{formatRupiah(calcResult.pisauInnerboxCost)}</span> : Biaya Pisau Innerbox
                          </li>
                        )}
                        {calcResult.logoCostItems.map((logoItem, idx) => (
                          <li key={idx}>
                            - <span className="font-semibold text-[#E5C158]">{formatRupiah(logoItem.cost)}</span> : {logoItem.label}
                          </li>
                        ))}
                      </ul>

                      <div className="pt-2 border-t border-[#D4AF37]/20 flex items-center justify-between font-mono-tabular text-xs font-bold text-[#E5C158]">
                        <span>Total Biaya Produksi:</span>
                        <span>{formatRupiah(calcResult.totalBiayaProduksi)}</span>
                      </div>
                    </div>

                    {/* 3. Perbandingan Biaya Cetak (Interaktif: User bisa memilih mesin) */}
                    <div className="rounded-lg border border-[#D4AF37]/20 bg-[#081610] p-3 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-[#D4AF37]/15 pb-1.5">
                        <div>
                          <h3 className="font-bold text-[#E5C158] text-xs">
                            Perbandingan Biaya Cetak {calcResult.outerPaperName}{' '}
                            {calcResult.isLaminasiActive
                              ? '(Termasuk Kertas, Cetak & Laminasi):'
                              : '(Termasuk Kertas & Cetak):'}
                          </h3>
                          <p className="text-[10px] text-[#A9BEB2]">
                            Klik salah satu mesin di bawah untuk memilih opsi cetak. Total HPP & harga jual otomatis disesuaikan.
                          </p>
                        </div>
                        {calcResult.selectedPrintIndex !== calcResult.minPrintIndex && (
                          <button
                            type="button"
                            onClick={() => handleSelectPrintOption(undefined)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/70 border border-emerald-500/40 rounded-md transition-all cursor-pointer shadow-xs"
                            title="Kembali ke rekomendasi mesin termurah oleh sistem"
                          >
                            <span>↺ Reset ke Opsi Termurah</span>
                          </button>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        {calcResult.printComparisons.map((opt, idx) => {
                          const isSelected = calcResult.selectedPrintIndex === idx;
                          const isLowest = idx === calcResult.minPrintIndex;

                          return (
                            <div
                              key={idx}
                              onClick={() => handleSelectPrintOption(idx)}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  handleSelectPrintOption(idx);
                                }
                              }}
                              className={`group relative rounded-lg p-2 border transition-all cursor-pointer select-none text-left ${
                                isSelected
                                  ? 'bg-[#153427] border-[#D4AF37] ring-1 ring-[#D4AF37]/40 shadow-xs'
                                  : 'bg-[#0B1D15]/80 hover:bg-[#10281E] border-[#D4AF37]/20 hover:border-[#D4AF37]/50'
                              }`}
                            >
                              <div className="flex flex-wrap items-start justify-between gap-1.5">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className={`inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border text-[9px] ${
                                        isSelected
                                          ? 'border-[#D4AF37] bg-[#D4AF37] text-[#07140F] font-bold'
                                          : 'border-[#94A89B]/50 text-transparent'
                                      }`}
                                    >
                                      ✓
                                    </span>
                                    <span className="font-semibold text-xs text-[#F4F1EA]">
                                      {opt.label}
                                    </span>
                                    <span className="text-[10px] text-[#A9BEB2]">
                                      {opt.detail}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-[#94A89B] pl-5">
                                    {opt.formatUkuran}
                                  </div>
                                </div>

                                <div className="text-right">
                                  <div className="font-mono-tabular text-xs sm:text-sm font-bold text-[#E5C158]">
                                    {formatRupiah(opt.totalCost)}
                                  </div>
                                  <div className="flex flex-wrap items-center justify-end gap-1 pt-0.5">
                                    {isLowest && (
                                      <span className="inline-flex items-center gap-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 px-1.5 py-0.2 text-[9px] font-semibold text-emerald-400">
                                        ⭐ Rekomendasi
                                      </span>
                                    )}
                                    {isSelected && (
                                      <span className="inline-flex items-center gap-0.5 rounded bg-[#D4AF37]/20 border border-[#D4AF37]/50 px-1.5 py-0.2 text-[9px] font-semibold text-[#F3D77D]">
                                        ✓ Aktif
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 4. Modal Box & Estimasi Harga Jual (Logika Harga) */}
                    <div className="rounded-lg border border-[#D4AF37]/40 bg-[#122D22] p-3 space-y-2">
                      <div className="space-y-0.5">
                        <h3 className="font-bold text-[#E5C158] text-xs">Modal Box</h3>
                        <p className="text-[11px] text-[#B8C7BE]">
                          Harga Modal = Total modal dibagi qty ({formatRupiah(calcResult.totalBiayaProduksi)} ÷ {calcResult.qty} pcs)
                        </p>
                        <div className="pt-0.5 font-mono-tabular text-base sm:text-lg font-bold text-[#F3D77D]">
                          {formatRupiah(calcResult.hargaModalPerPcs)}{' '}
                          <span className="text-[11px] font-normal text-[#94A89B]">/ pcs</span>
                        </div>
                      </div>

                      <div className="border-t border-[#D4AF37]/25 pt-2 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-[#E5C158]">
                            Harga Jual (Logika Margin):
                          </span>
                          <span className="rounded border border-[#D4AF37]/30 bg-[#081610] px-1.5 py-0.2 font-mono-tabular text-[10px] text-[#F3D77D]">
                            {calcResult.marginTierLabel}
                          </span>
                        </div>
                        <p className="font-mono-tabular text-[11px] text-[#B8C7BE]">
                          Margin <strong className="text-[#F4F1EA]">{calcResult.marginPercent}%</strong> ➔ Pengali{' '}
                          <strong className="text-[#E5C158]">{calcResult.pengaliHargaJual.toFixed(2)}</strong> ({formatRupiah(calcResult.hargaModalPerPcs)} x {calcResult.pengaliHargaJual.toFixed(2)})
                        </p>
                        <div className="pt-0.5 flex items-baseline justify-between">
                          <div className="font-mono-tabular text-base sm:text-lg font-bold text-emerald-400">
                            {formatRupiah(calcResult.hargaJualPerPcs)}{' '}
                            <span className="text-[11px] font-normal text-[#94A89B]">/ pcs</span>
                          </div>
                          <div className="font-mono-tabular text-[11px] text-[#94A89B]">
                            Total Jual: <strong className="text-[#F4F1EA]">{formatRupiah(calcResult.totalHargaJual)}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>
          ) : activeMenu === 'data-bahan' ? (
            /* Data Bahan View with Bahan Dasar, Kertas Std, and Kertas Premium Tabs */
            <div className="space-y-4">
              {/* Top Tab Selector: Bahan Dasar, Kertas Std, Kertas Premium */}
              <div className="inline-flex flex-wrap items-center gap-1.5 rounded-xl border border-[#D4AF37]/25 bg-[#0B1D15] p-1.5 shadow-md">
                {MATERIAL_TABS.map((tab) => {
                  const TabIcon = tab.icon;
                  const isTabActive = activeMaterialTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveMaterialTab(tab.id);
                        setDeleteMaterialConfirmId(null);
                      }}
                      className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer ${
                        isTabActive
                          ? 'bg-[#D4AF37] text-[#07140F] shadow-sm'
                          : 'text-[#A9BEB2] hover:bg-[#122D22] hover:text-[#F3D77D]'
                      }`}
                    >
                      <TabIcon
                        className={`h-3.5 w-3.5 shrink-0 ${
                          isTabActive ? 'text-[#07140F]' : 'text-[#D4AF37]'
                        }`}
                      />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {(() => {
                const currentList =
                  activeMaterialTab === 'bahan-dasar'
                    ? bahanDasarItems
                    : activeMaterialTab === 'kertas-std'
                    ? kertasStdItems
                    : activeMaterialTab === 'kertas-premium'
                    ? kertasPremiumItems
                    : innerboxItems;

                const TabIcon = currentMaterialTabObj.icon;
                const subtitleText =
                  activeMaterialTab === 'bahan-dasar'
                    ? 'Database harga dan ukuran bahan dasar (Yellow Board, Grey Board, Duplex, dll)'
                    : activeMaterialTab === 'kertas-std'
                    ? 'Database harga dan ukuran kertas standar (Art Paper, Art Carton, Ivory, HVS, dll)'
                    : activeMaterialTab === 'kertas-premium'
                    ? 'Database harga dan ukuran kertas premium / fancy paper (Jasmine, Linen, Concorde, RCP, dll)'
                    : 'Database harga dan ukuran bahan pelapis / isian dalam box (Busa Ati, Eva Foam, Bludru, Satin, dll)';

                return (
                  <section className="rounded-xl border border-[#D4AF37]/25 bg-[#0C2017] p-3.5 sm:p-5 shadow-lg">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3.5 sm:pb-4 border-b border-[#D4AF37]/15">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <TabIcon className="h-4 w-4 text-[#D4AF37] shrink-0" />
                          <h1 className="text-sm sm:text-base font-bold text-[#E5C158] tracking-tight">
                            Tabel Data Bahan — {currentMaterialTabObj.label}
                          </h1>
                        </div>
                        <p className="text-[11px] sm:text-xs text-[#8FA599]">
                          {subtitleText}
                        </p>
                      </div>

                      <button
                        onClick={openAddMaterialModal}
                        className="flex items-center justify-center gap-1.5 rounded-lg bg-[#D4AF37] px-3 py-1.5 text-xs font-semibold text-[#07140F] hover:bg-[#E5C158] transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
                      >
                        <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                        <span>Tambah {currentMaterialTabObj.label}</span>
                      </button>
                    </div>

                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="border-b border-[#D4AF37]/15 bg-[#081610] text-[11px] font-semibold text-[#94A89B]">
                            <th className="py-2.5 pl-3 pr-3 rounded-tl-lg w-[38%]">
                              Nama {currentMaterialTabObj.label}
                            </th>
                            <th className="py-2.5 px-3 text-center w-[26%]">
                              Ukuran
                            </th>
                            <th className="py-2.5 px-3 text-center w-[24%]">
                              Harga
                            </th>
                            <th className="py-2.5 pl-3 pr-3 text-right rounded-tr-lg w-[12%]">
                              Aksi
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#D4AF37]/15 text-xs">
                          {currentList.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="p-0">
                                <div className="flex min-h-[220px] flex-col items-center justify-center px-4 py-8 text-center">
                                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#D4AF37]/35 bg-[#122D22] text-[#D4AF37] shadow-inner mb-3">
                                    <Construction className="h-5 w-5" />
                                  </div>
                                  <h2 className="font-display text-base sm:text-lg font-bold tracking-wide text-[#E5C158] uppercase">
                                    MAINTENANCE
                                  </h2>
                                  <p className="mt-1 text-xs font-medium text-[#F4F1EA]">
                                    Halaman Tabel{' '}
                                    <span className="text-[#E5C158]">
                                      {currentMaterialTabObj.label}
                                    </span>{' '}
                                    sedang dalam proses maintenance
                                  </p>
                                  <p className="mt-0.5 max-w-md text-[11px] text-[#8FA599] leading-relaxed">
                                    Data {currentMaterialTabObj.label.toLowerCase()} saat ini masih dikosongkan sementara. Anda juga dapat menekan tombol{' '}
                                    <strong>+ Tambah {currentMaterialTabObj.label}</strong> di kanan atas.
                                  </p>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            currentList.map((item) => (
                              <tr
                                key={item.id}
                                className="group hover:bg-[#10291E]/70 transition-colors"
                              >
                                <td className="py-2.5 pl-3 pr-3 align-middle">
                                  <button
                                    onClick={() => openEditMaterialModal(item)}
                                    className="text-left font-semibold text-[#E5C158] hover:text-[#F5D77F] hover:underline transition-colors cursor-pointer text-xs"
                                  >
                                    {item.namaBahan}
                                  </button>
                                </td>

                                <td className="py-2 px-3 align-middle">
                                  <div
                                    onClick={() => openEditMaterialModal(item)}
                                    className="rounded-md border border-[#D4AF37]/15 bg-[#081610] px-3 py-1.5 text-center font-mono-tabular text-xs font-semibold text-[#F4F1EA] hover:border-[#D4AF37]/45 transition-colors cursor-pointer whitespace-nowrap"
                                  >
                                    {item.ukuranPlano}
                                  </div>
                                </td>

                                <td className="py-2 px-3 align-middle">
                                  <div
                                    onClick={() => openEditMaterialModal(item)}
                                    className="rounded-md border border-[#D4AF37]/15 bg-[#081610] px-3 py-1.5 text-center font-mono-tabular text-xs font-semibold text-[#F4F1EA] hover:border-[#D4AF37]/45 transition-colors cursor-pointer whitespace-nowrap"
                                  >
                                    {item.hargaLembar}
                                  </div>
                                </td>

                                <td className="py-2.5 pl-3 pr-3 align-middle text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() => openEditMaterialModal(item)}
                                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#D4AF37]/20 bg-[#081610] text-[#D4AF37] hover:bg-[#163528] hover:border-[#D4AF37]/50 transition-colors cursor-pointer"
                                      title={`Ubah ${item.namaBahan}`}
                                    >
                                      <Pencil className="h-3 w-3" />
                                    </button>

                                    {deleteMaterialConfirmId === item.id ? (
                                      <button
                                        onClick={() => handleDeleteMaterialItem(item.id)}
                                        className="inline-flex items-center justify-center rounded-md bg-[#E11D48] px-2 py-1 text-[11px] font-semibold text-white hover:bg-[#BE123C] transition-colors cursor-pointer whitespace-nowrap"
                                      >
                                        Hapus?
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => setDeleteMaterialConfirmId(item.id)}
                                        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#F43F5E]/25 bg-[#2A1216] text-[#F43F5E] hover:bg-[#3F1920] hover:border-[#F43F5E]/50 transition-colors cursor-pointer"
                                        title={`Hapus ${item.namaBahan}`}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>
                );
              })()}
            </div>
          ) : activeMenu === 'data-proses' ? (
            /* Data Proses View with Digital, Offset, Laminasi, and Logo Tabs */
            <div className="space-y-4">
              {/* Top Tab Selector: Digital, Offset, Laminasi, Logo */}
              <div className="inline-flex flex-wrap items-center gap-1.5 rounded-xl border border-[#D4AF37]/25 bg-[#0B1D15] p-1.5 shadow-md">
                {PROCESS_TABS.map((tab) => {
                  const TabIcon = tab.icon;
                  const isTabActive = activeProcessTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveProcessTab(tab.id);
                        setDeleteProcessConfirmId(null);
                      }}
                      className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer ${
                        isTabActive
                          ? 'bg-[#D4AF37] text-[#07140F] shadow-sm'
                          : 'text-[#A9BEB2] hover:bg-[#122D22] hover:text-[#F3D77D]'
                      }`}
                    >
                      <TabIcon
                        className={`h-3.5 w-3.5 shrink-0 ${
                          isTabActive ? 'text-[#07140F]' : 'text-[#D4AF37]'
                        }`}
                      />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* 1. TAB DIGITAL */}
              {activeProcessTab === 'digital' && (
                <section className="rounded-xl border border-[#D4AF37]/25 bg-[#0C2017] p-3.5 sm:p-5 shadow-lg">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3.5 sm:pb-4 border-b border-[#D4AF37]/15">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Printer className="h-4 w-4 text-[#D4AF37] shrink-0" />
                        <h1 className="text-sm sm:text-base font-bold text-[#E5C158] tracking-tight">
                          Tabel Data Proses — Digital
                        </h1>
                      </div>
                      <p className="text-[11px] sm:text-xs text-[#8FA599]">
                        Database spesifikasi mesin, ukuran kertas, dan tarif proses cetak digital
                      </p>
                    </div>

                    <button
                      onClick={openAddProcessModal}
                      className="flex items-center justify-center gap-1.5 rounded-lg bg-[#D4AF37] px-3 py-1.5 text-xs font-semibold text-[#07140F] hover:bg-[#E5C158] transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
                    >
                      <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                      <span>Tambah Digital</span>
                    </button>
                  </div>

                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b border-[#D4AF37]/15 bg-[#081610] text-[11px] font-semibold text-[#94A89B]">
                          <th className="py-2.5 pl-3 pr-3 rounded-tl-lg w-[26%]">
                            Nama Mesin / Layanan Digital
                          </th>
                          <th className="py-2.5 px-3 text-center w-[20%]">
                            Area Cetak Maksimal
                          </th>
                          <th className="py-2.5 px-3 text-center w-[24%]">
                            Harga Cetak
                          </th>
                          <th className="py-2.5 px-3 w-[20%]">Keterangan</th>
                          <th className="py-2.5 pl-3 pr-3 text-right rounded-tr-lg w-[10%]">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#D4AF37]/15 text-xs">
                        {digitalItems.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-0">
                              <div className="flex min-h-[200px] flex-col items-center justify-center px-4 py-8 text-center">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#D4AF37]/35 bg-[#122D22] text-[#D4AF37] shadow-inner mb-3">
                                  <Construction className="h-5 w-5" />
                                </div>
                                <h2 className="font-display text-base sm:text-lg font-bold tracking-wide text-[#E5C158] uppercase">
                                  MAINTENANCE
                                </h2>
                                <p className="mt-1 text-xs font-medium text-[#F4F1EA]">
                                  Belum ada data cetak digital
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          digitalItems.map((item) => (
                            <tr
                              key={item.id}
                              className="group hover:bg-[#10291E]/70 transition-colors"
                            >
                              <td className="py-2.5 pl-3 pr-3 align-middle">
                                <button
                                  onClick={() => openEditDigitalModal(item)}
                                  className="text-left font-semibold text-[#E5C158] hover:text-[#F5D77F] hover:underline transition-colors cursor-pointer text-xs"
                                  title="Klik untuk ubah data"
                                >
                                  {item.namaMesin}
                                </button>
                              </td>

                              <td className="py-2 px-3 align-middle">
                                <div
                                  onClick={() => openEditDigitalModal(item)}
                                  className="rounded-md border border-[#D4AF37]/15 bg-[#081610] px-3 py-1.5 text-center font-mono-tabular text-xs font-semibold text-[#F4F1EA] hover:border-[#D4AF37]/45 transition-colors cursor-pointer whitespace-nowrap"
                                >
                                  {item.ukuranArea}
                                </div>
                              </td>

                              <td className="py-2 px-3 align-middle">
                                <div
                                  onClick={() => openEditDigitalModal(item)}
                                  className="rounded-md border border-[#D4AF37]/15 bg-[#081610] px-3 py-1.5 text-center font-mono-tabular text-xs font-semibold text-[#F4F1EA] hover:border-[#D4AF37]/45 transition-colors cursor-pointer whitespace-nowrap"
                                >
                                  {item.hargaCetak}
                                </div>
                              </td>

                              <td className="py-2 px-3 align-middle text-[11px] sm:text-xs leading-relaxed text-[#A7BBB0]">
                                {item.keterangan}
                              </td>

                              <td className="py-2.5 pl-3 pr-3 align-middle text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => openEditDigitalModal(item)}
                                    className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#D4AF37]/20 bg-[#081610] text-[#D4AF37] hover:bg-[#163528] hover:border-[#D4AF37]/50 transition-colors cursor-pointer"
                                    title={`Ubah ${item.namaMesin}`}
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </button>

                                  {deleteProcessConfirmId === item.id ? (
                                    <button
                                      onClick={() => handleDeleteProcessItem(item.id)}
                                      className="inline-flex items-center justify-center rounded-md bg-[#E11D48] px-2 py-1 text-[11px] font-semibold text-white hover:bg-[#BE123C] transition-colors cursor-pointer whitespace-nowrap"
                                    >
                                      Hapus?
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => setDeleteProcessConfirmId(item.id)}
                                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#F43F5E]/25 bg-[#2A1216] text-[#F43F5E] hover:bg-[#3F1920] hover:border-[#F43F5E]/50 transition-colors cursor-pointer"
                                      title={`Hapus ${item.namaMesin}`}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* 2. TAB OFFSET (Revised Columns: Mesin Cetak, Ukuran Area Cetak, Biaya Cetak, Lebih Druk) */}
              {activeProcessTab === 'offset' && (
                <section className="rounded-xl border border-[#D4AF37]/25 bg-[#0C2017] p-3.5 sm:p-5 shadow-lg">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3.5 sm:pb-4 border-b border-[#D4AF37]/15">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-[#D4AF37] shrink-0" />
                        <h1 className="text-sm sm:text-base font-bold text-[#E5C158] tracking-tight">
                          Tabel Data Proses — Offset
                        </h1>
                      </div>
                      <p className="text-[11px] sm:text-xs text-[#8FA599]">
                        Database spesifikasi mesin cetak offset, ukuran area cetak, biaya cetak, dan lebih druk
                      </p>
                    </div>

                    <button
                      onClick={openAddProcessModal}
                      className="flex items-center justify-center gap-1.5 rounded-lg bg-[#D4AF37] px-3 py-1.5 text-xs font-semibold text-[#07140F] hover:bg-[#E5C158] transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
                    >
                      <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                      <span>Tambah Offset</span>
                    </button>
                  </div>

                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b border-[#D4AF37]/15 bg-[#081610] text-[11px] font-semibold text-[#94A89B]">
                          <th className="py-2.5 pl-3 pr-3 rounded-tl-lg w-[18%]">
                            Mesin Cetak
                          </th>
                          <th className="py-2.5 px-3 text-center w-[16%]">
                            Ukuran Area Cetak
                          </th>
                          <th className="py-2.5 px-3 text-center w-[20%]">
                            Biaya Cetak
                          </th>
                          <th className="py-2.5 px-3 w-[36%]">
                            Lebih Druk
                          </th>
                          <th className="py-2.5 pl-3 pr-3 text-right rounded-tr-lg w-[10%]">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#D4AF37]/15 text-xs">
                        {offsetItems.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-0">
                              <div className="flex min-h-[200px] flex-col items-center justify-center px-4 py-8 text-center">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#D4AF37]/35 bg-[#122D22] text-[#D4AF37] shadow-inner mb-3">
                                  <Construction className="h-5 w-5" />
                                </div>
                                <h2 className="font-display text-base sm:text-lg font-bold tracking-wide text-[#E5C158] uppercase">
                                  MAINTENANCE
                                </h2>
                                <p className="mt-1 text-xs font-medium text-[#F4F1EA]">
                                  Halaman Tabel <span className="text-[#E5C158]">Offset</span> sedang dalam proses maintenance
                                </p>
                                <p className="mt-0.5 max-w-md text-[11px] text-[#8FA599] leading-relaxed">
                                  Data proses cetak offset saat ini masih dikosongkan sementara. Anda juga dapat menekan tombol <strong>+ Tambah Offset</strong> di kanan atas.
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          offsetItems.map((item) => (
                            <tr
                              key={item.id}
                              className="group hover:bg-[#10291E]/70 transition-colors"
                            >
                              <td className="py-2.5 pl-3 pr-3 align-middle">
                                <button
                                  onClick={() => openEditOffsetModal(item)}
                                  className="text-left font-semibold text-[#E5C158] hover:text-[#F5D77F] hover:underline transition-colors cursor-pointer text-xs"
                                >
                                  {item.mesinCetak}
                                </button>
                              </td>

                              <td className="py-2 px-3 align-middle">
                                <div
                                  onClick={() => openEditOffsetModal(item)}
                                  className="rounded-md border border-[#D4AF37]/15 bg-[#081610] px-3 py-1.5 text-center font-mono-tabular text-xs font-semibold text-[#F4F1EA] hover:border-[#D4AF37]/45 transition-colors cursor-pointer whitespace-nowrap"
                                >
                                  {item.ukuranAreaCetak}
                                </div>
                              </td>

                              <td className="py-2 px-3 align-middle">
                                <div
                                  onClick={() => openEditOffsetModal(item)}
                                  className="rounded-md border border-[#D4AF37]/15 bg-[#081610] px-3 py-1.5 text-center font-mono-tabular text-xs font-semibold text-[#F4F1EA] hover:border-[#D4AF37]/45 transition-colors cursor-pointer whitespace-nowrap"
                                >
                                  {item.biayaCetak}
                                </div>
                              </td>

                              <td className="py-2 px-3 align-middle">
                                <div
                                  onClick={() => openEditOffsetModal(item)}
                                  className="rounded-md border border-[#D4AF37]/15 bg-[#081610] px-3 py-1.5 text-left font-mono-tabular text-xs leading-relaxed text-[#E2ECE6] hover:border-[#D4AF37]/45 transition-colors cursor-pointer"
                                >
                                  {item.lebihDruk}
                                </div>
                              </td>

                              <td className="py-2.5 pl-3 pr-3 align-middle text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => openEditOffsetModal(item)}
                                    className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#D4AF37]/20 bg-[#081610] text-[#D4AF37] hover:bg-[#163528] hover:border-[#D4AF37]/50 transition-colors cursor-pointer"
                                    title={`Ubah ${item.mesinCetak}`}
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </button>

                                  {deleteProcessConfirmId === item.id ? (
                                    <button
                                      onClick={() => handleDeleteProcessItem(item.id)}
                                      className="inline-flex items-center justify-center rounded-md bg-[#E11D48] px-2 py-1 text-[11px] font-semibold text-white hover:bg-[#BE123C] transition-colors cursor-pointer whitespace-nowrap"
                                    >
                                      Hapus?
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => setDeleteProcessConfirmId(item.id)}
                                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#F43F5E]/25 bg-[#2A1216] text-[#F43F5E] hover:bg-[#3F1920] hover:border-[#F43F5E]/50 transition-colors cursor-pointer"
                                      title={`Hapus ${item.mesinCetak}`}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* 3. TAB LAMINASI */}
              {activeProcessTab === 'laminasi' && (
                <section className="rounded-xl border border-[#D4AF37]/25 bg-[#0C2017] p-3.5 sm:p-5 shadow-lg">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3.5 sm:pb-4 border-b border-[#D4AF37]/15">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-[#D4AF37] shrink-0" />
                        <h1 className="text-sm sm:text-base font-bold text-[#E5C158] tracking-tight">
                          Tabel Data Proses — Laminasi
                        </h1>
                      </div>
                      <p className="text-[11px] sm:text-xs text-[#8FA599]">
                        Database jenis laminasi, tipe (Digital / Offset), max ukuran, harga, biaya minimum, dan rumus minimum
                      </p>
                    </div>

                    <button
                      onClick={openAddProcessModal}
                      className="flex items-center justify-center gap-1.5 rounded-lg bg-[#D4AF37] px-3 py-1.5 text-xs font-semibold text-[#07140F] hover:bg-[#E5C158] transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
                    >
                      <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                      <span>Tambah Laminasi</span>
                    </button>
                  </div>

                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b border-[#D4AF37]/15 bg-[#081610] text-[11px] font-semibold text-[#94A89B]">
                          <th className="py-2.5 pl-3 pr-2.5 rounded-tl-lg w-[18%]">
                            Jenis Laminasi
                          </th>
                          <th className="py-2.5 px-2.5 text-center w-[12%]">
                            Type
                          </th>
                          <th className="py-2.5 px-2.5 text-center w-[14%]">
                            Max Ukuran
                          </th>
                          <th className="py-2.5 px-2.5 text-center w-[14%]">
                            Harga
                          </th>
                          <th className="py-2.5 px-2.5 text-center w-[16%]">
                            Biaya Minumum
                          </th>
                          <th className="py-2.5 px-2.5 w-[18%]">
                            Rumus Minimum
                          </th>
                          <th className="py-2.5 pl-2.5 pr-3 text-right rounded-tr-lg w-[8%]">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#D4AF37]/15 text-xs">
                        {laminasiItems.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-0">
                              <div className="flex min-h-[200px] flex-col items-center justify-center px-4 py-8 text-center">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#D4AF37]/35 bg-[#122D22] text-[#D4AF37] shadow-inner mb-3">
                                  <Construction className="h-5 w-5" />
                                </div>
                                <h2 className="font-display text-base sm:text-lg font-bold tracking-wide text-[#E5C158] uppercase">
                                  MAINTENANCE
                                </h2>
                                <p className="mt-1 text-xs font-medium text-[#F4F1EA]">
                                  Belum ada data laminasi
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          laminasiItems.map((item) => (
                            <tr
                              key={item.id}
                              className="group hover:bg-[#10291E]/70 transition-colors"
                            >
                              {/* Jenis Laminasi */}
                              <td className="py-2.5 pl-3 pr-2.5 align-middle">
                                <button
                                  onClick={() => openEditLaminasiModal(item)}
                                  className="text-left font-semibold text-[#E5C158] hover:text-[#F5D77F] hover:underline transition-colors cursor-pointer text-xs"
                                >
                                  {item.jenisLaminasi}
                                </button>
                              </td>

                              {/* Type (Digital / Offset) */}
                              <td className="py-2 px-2.5 align-middle text-center">
                                <button
                                  onClick={() => openEditLaminasiModal(item)}
                                  className="w-full rounded-md border border-[#D4AF37]/15 bg-[#081610] px-2 py-1 text-center text-xs font-semibold text-[#F3D77D] hover:border-[#D4AF37]/45 transition-colors cursor-pointer whitespace-nowrap"
                                >
                                  {item.type}
                                </button>
                              </td>

                              {/* Max Ukuran */}
                              <td className="py-2 px-2.5 align-middle">
                                <div
                                  onClick={() => openEditLaminasiModal(item)}
                                  className="rounded-md border border-[#D4AF37]/15 bg-[#081610] px-2.5 py-1 text-center font-mono-tabular text-xs font-semibold text-[#F4F1EA] hover:border-[#D4AF37]/45 transition-colors cursor-pointer whitespace-nowrap"
                                >
                                  {item.maxUkuran}
                                </div>
                              </td>

                              {/* Harga */}
                              <td className="py-2 px-2.5 align-middle">
                                <div
                                  onClick={() => openEditLaminasiModal(item)}
                                  className="rounded-md border border-[#D4AF37]/15 bg-[#081610] px-2.5 py-1 text-center font-mono-tabular text-xs font-semibold text-[#F4F1EA] hover:border-[#D4AF37]/45 transition-colors cursor-pointer whitespace-nowrap"
                                >
                                  {item.harga}
                                </div>
                              </td>

                              {/* Biaya Minimum */}
                              <td className="py-2 px-2.5 align-middle">
                                <div
                                  onClick={() => openEditLaminasiModal(item)}
                                  className="rounded-md border border-[#D4AF37]/15 bg-[#081610] px-2.5 py-1 text-center font-mono-tabular text-xs font-semibold text-[#F4F1EA] hover:border-[#D4AF37]/45 transition-colors cursor-pointer whitespace-nowrap"
                                >
                                  {item.biayaMinimum}
                                </div>
                              </td>

                              {/* Rumus Minimum */}
                              <td className="py-2 px-2.5 align-middle">
                                <div
                                  onClick={() => openEditLaminasiModal(item)}
                                  className="rounded-md border border-[#D4AF37]/15 bg-[#081610] px-2.5 py-1 text-left font-mono-tabular text-xs leading-relaxed text-[#E2ECE6] hover:border-[#D4AF37]/45 transition-colors cursor-pointer"
                                >
                                  {item.rumusMinimum}
                                </div>
                              </td>

                              {/* Aksi */}
                              <td className="py-2.5 pl-2.5 pr-3 align-middle text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => openEditLaminasiModal(item)}
                                    className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#D4AF37]/20 bg-[#081610] text-[#D4AF37] hover:bg-[#163528] hover:border-[#D4AF37]/50 transition-colors cursor-pointer"
                                    title={`Ubah ${item.jenisLaminasi}`}
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </button>

                                  {deleteProcessConfirmId === item.id ? (
                                    <button
                                      onClick={() => handleDeleteProcessItem(item.id)}
                                      className="inline-flex items-center justify-center rounded-md bg-[#E11D48] px-2 py-1 text-[11px] font-semibold text-white hover:bg-[#BE123C] transition-colors cursor-pointer whitespace-nowrap"
                                    >
                                      Hapus?
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => setDeleteProcessConfirmId(item.id)}
                                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#F43F5E]/25 bg-[#2A1216] text-[#F43F5E] hover:bg-[#3F1920] hover:border-[#F43F5E]/50 transition-colors cursor-pointer"
                                      title={`Hapus ${item.jenisLaminasi}`}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* 4. TAB LOGO */}
              {activeProcessTab === 'logo' && (
                <section className="rounded-xl border border-[#D4AF37]/25 bg-[#0C2017] p-3.5 sm:p-5 shadow-lg">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3.5 sm:pb-4 border-b border-[#D4AF37]/15">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-[#D4AF37] shrink-0" />
                        <h1 className="text-sm sm:text-base font-bold text-[#E5C158] tracking-tight">
                          Tabel Data Proses — Logo
                        </h1>
                      </div>
                      <p className="text-[11px] sm:text-xs text-[#8FA599]">
                        Database proses finishing logo (Hotprint / Poly Foil, Emboss, Deboss, Spot UV) dan biaya klise
                      </p>
                    </div>

                    <button
                      onClick={openAddProcessModal}
                      className="flex items-center justify-center gap-1.5 rounded-lg bg-[#D4AF37] px-3 py-1.5 text-xs font-semibold text-[#07140F] hover:bg-[#E5C158] transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
                    >
                      <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                      <span>Tambah Logo</span>
                    </button>
                  </div>

                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b border-[#D4AF37]/15 bg-[#081610] text-[11px] font-semibold text-[#94A89B]">
                          <th className="py-2.5 pl-3 pr-2.5 rounded-tl-lg w-[16%]">
                            Jenis Logo
                          </th>
                          <th className="py-2.5 px-2.5 text-center w-[14%]">
                            Harga
                          </th>
                          <th className="py-2.5 px-2.5 text-center w-[15%]">
                            Biaya Min
                          </th>
                          <th className="py-2.5 px-2.5 w-[22%]">
                            Rumus Logo
                          </th>
                          <th className="py-2.5 px-2.5 w-[25%]">
                            Keterangan
                          </th>
                          <th className="py-2.5 pl-2.5 pr-3 text-right rounded-tr-lg w-[8%]">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#D4AF37]/15 text-xs">
                        {logoItems.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-0">
                              <div className="flex min-h-[200px] flex-col items-center justify-center px-4 py-8 text-center">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#D4AF37]/35 bg-[#122D22] text-[#D4AF37] shadow-inner mb-3">
                                  <Construction className="h-5 w-5" />
                                </div>
                                <h2 className="font-display text-base sm:text-lg font-bold tracking-wide text-[#E5C158] uppercase">
                                  MAINTENANCE
                                </h2>
                                <p className="mt-1 text-xs font-medium text-[#F4F1EA]">
                                  Halaman Tabel <span className="text-[#E5C158]">Logo</span> sedang dalam proses maintenance
                                </p>
                                <p className="mt-0.5 max-w-md text-[11px] text-[#8FA599] leading-relaxed">
                                  Data proses logo saat ini masih dikosongkan sementara. Anda juga dapat menekan tombol <strong>+ Tambah Logo</strong> di kanan atas.
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          logoItems.map((item) => (
                            <tr
                              key={item.id}
                              className="group hover:bg-[#10291E]/70 transition-colors"
                            >
                              {/* Jenis Logo */}
                              <td className="py-2.5 pl-3 pr-2.5 align-middle">
                                <button
                                  onClick={() => openEditLogoModal(item)}
                                  className="text-left font-semibold text-[#E5C158] hover:text-[#F5D77F] hover:underline transition-colors cursor-pointer text-xs"
                                >
                                  {item.jenisLogo}
                                </button>
                              </td>

                              {/* Harga */}
                              <td className="py-2 px-2.5 align-middle">
                                <div
                                  onClick={() => openEditLogoModal(item)}
                                  className="rounded-md border border-[#D4AF37]/15 bg-[#081610] px-2.5 py-1 text-center font-mono-tabular text-xs font-semibold text-[#F4F1EA] hover:border-[#D4AF37]/45 transition-colors cursor-pointer whitespace-nowrap"
                                >
                                  {item.harga}
                                </div>
                              </td>

                              {/* Biaya Min */}
                              <td className="py-2 px-2.5 align-middle">
                                <div
                                  onClick={() => openEditLogoModal(item)}
                                  className="rounded-md border border-[#D4AF37]/15 bg-[#081610] px-2.5 py-1 text-center font-mono-tabular text-xs font-semibold text-[#F4F1EA] hover:border-[#D4AF37]/45 transition-colors cursor-pointer whitespace-nowrap"
                                >
                                  {item.biayaMin}
                                </div>
                              </td>

                              {/* Rumus Logo */}
                              <td className="py-2 px-2.5 align-middle">
                                <div
                                  onClick={() => openEditLogoModal(item)}
                                  className="rounded-md border border-[#D4AF37]/15 bg-[#081610] px-2.5 py-1 text-left font-mono-tabular text-xs leading-relaxed text-[#E2ECE6] hover:border-[#D4AF37]/45 transition-colors cursor-pointer"
                                >
                                  {item.rumusLogo}
                                </div>
                              </td>

                              {/* Keterangan */}
                              <td className="py-2 px-2.5 align-middle text-[11px] sm:text-xs leading-relaxed text-[#A7BBB0]">
                                {item.keterangan}
                              </td>

                              {/* Aksi */}
                              <td className="py-2.5 pl-2.5 pr-3 align-middle text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => openEditLogoModal(item)}
                                    className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#D4AF37]/20 bg-[#081610] text-[#D4AF37] hover:bg-[#163528] hover:border-[#D4AF37]/50 transition-colors cursor-pointer"
                                    title={`Ubah ${item.jenisLogo}`}
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </button>

                                  {deleteProcessConfirmId === item.id ? (
                                    <button
                                      onClick={() => handleDeleteProcessItem(item.id)}
                                      className="inline-flex items-center justify-center rounded-md bg-[#E11D48] px-2 py-1 text-[11px] font-semibold text-white hover:bg-[#BE123C] transition-colors cursor-pointer whitespace-nowrap"
                                    >
                                      Hapus?
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => setDeleteProcessConfirmId(item.id)}
                                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#F43F5E]/25 bg-[#2A1216] text-[#F43F5E] hover:bg-[#3F1920] hover:border-[#F43F5E]/50 transition-colors cursor-pointer"
                                      title={`Hapus ${item.jenisLogo}`}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
            </div>
          ) : activeMenu === 'biaya-finishing' ? (
            <section className="rounded-xl border border-[#D4AF37]/25 bg-[#0C2017] p-3.5 sm:p-5 shadow-lg">
              {/* Section Header */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3.5 sm:pb-4 border-b border-[#D4AF37]/15">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-[#D4AF37] shrink-0" />
                    <h1 className="text-sm sm:text-base font-bold text-[#E5C158] tracking-tight">
                      Database Biaya Finishing Jasa Rakit
                    </h1>
                  </div>
                  <p className="text-[11px] sm:text-xs text-[#8FA599]">
                    Ubah atau rancang range harga jasa rakit box manual
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8FA599]" />
                    <input
                      type="text"
                      value={finishingSearch}
                      onChange={(e) => setFinishingSearch(e.target.value)}
                      placeholder="Cari model box..."
                      className="w-full sm:w-44 rounded-lg border border-[#D4AF37]/25 bg-[#081610] pl-8 pr-2.5 py-1.5 text-xs text-[#F4F1EA] placeholder-[#6E8478] focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={openAddFinishingModal}
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-[#D4AF37] px-3 py-1.5 text-xs font-semibold text-[#07140F] hover:bg-[#E5C158] transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
                  >
                    <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                    <span>Tambah Biaya Finishing</span>
                  </button>
                </div>
              </div>

              {/* Reference Data Table */}
              <div className="mt-4 overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[#D4AF37]/15 bg-[#081610] text-[11px] font-semibold text-[#94A89B]">
                      <th className="py-2.5 pl-3 pr-3 rounded-tl-lg w-[26%]">
                        Model Box
                      </th>
                      <th className="py-2.5 px-3 text-center w-[24%]">
                        Harga Jasa (Min - Max)
                      </th>
                      <th className="py-2.5 px-3 w-[40%]">Instruksi Khusus</th>
                      <th className="py-2.5 pl-3 pr-3 text-right rounded-tr-lg w-[10%]">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D4AF37]/15 text-xs">
                    {filteredFinishingItems.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-8 text-center text-xs text-[#8FA599]"
                        >
                          Tidak ada data biaya finishing yang cocok dengan pencarian.
                        </td>
                      </tr>
                    ) : (
                      filteredFinishingItems.map((item) => (
                        <tr
                          key={item.id}
                          className="group hover:bg-[#10291E]/70 transition-colors"
                        >
                          <td className="py-2.5 pl-3 pr-3 align-middle">
                            <button
                              onClick={() => openEditFinishingModal(item)}
                              className="text-left font-semibold text-[#E5C158] hover:text-[#F5D77F] hover:underline transition-colors cursor-pointer text-xs"
                              title="Klik untuk ubah data"
                            >
                              {item.modelBox}
                            </button>
                          </td>

                          <td className="py-2 px-3 align-middle">
                            <button
                              onClick={() => openEditFinishingModal(item)}
                              className="w-full rounded-md border border-[#D4AF37]/15 bg-[#081610] px-3 py-1.5 text-center font-mono-tabular text-xs font-semibold text-[#F4F1EA] hover:border-[#D4AF37]/45 transition-colors cursor-pointer whitespace-nowrap"
                              title="Klik untuk ubah range harga"
                            >
                              {formatRupiah(item.minPrice)} -{' '}
                              {formatRupiah(item.maxPrice)}
                            </button>
                          </td>

                          <td className="py-2 px-3 align-middle text-[11px] sm:text-xs leading-relaxed text-[#A7BBB0]">
                            {item.specialInstructions}
                          </td>

                          <td className="py-2.5 pl-3 pr-3 align-middle text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditFinishingModal(item)}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#D4AF37]/20 bg-[#081610] text-[#D4AF37] hover:bg-[#163528] hover:border-[#D4AF37]/50 transition-colors cursor-pointer"
                                title={`Ubah ${item.modelBox}`}
                                aria-label={`Ubah ${item.modelBox}`}
                              >
                                <Pencil className="h-3 w-3" />
                              </button>

                              {deleteFinishingConfirmId === item.id ? (
                                <button
                                  onClick={() => handleDeleteFinishing(item.id)}
                                  className="inline-flex items-center justify-center rounded-md bg-[#E11D48] px-2 py-1 text-[11px] font-semibold text-white hover:bg-[#BE123C] transition-colors cursor-pointer whitespace-nowrap"
                                  title="Konfirmasi Hapus"
                                >
                                  Hapus?
                                </button>
                              ) : (
                                <button
                                  onClick={() => setDeleteFinishingConfirmId(item.id)}
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#F43F5E]/25 bg-[#2A1216] text-[#F43F5E] hover:bg-[#3F1920] hover:border-[#F43F5E]/50 transition-colors cursor-pointer"
                                  title={`Hapus ${item.modelBox}`}
                                  aria-label={`Hapus ${item.modelBox}`}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          ) : activeMenu === 'rumus-model' ? (
            /* Rumus Model View - Detailed Reference Table */
            <section className="rounded-xl border border-[#D4AF37]/25 bg-[#0C2017] p-3.5 sm:p-5 shadow-lg">
              {/* Section Header */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3.5 sm:pb-4 border-b border-[#D4AF37]/15">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-[#D4AF37] shrink-0" />
                    <h1 className="text-sm sm:text-base font-bold text-[#E5C158] tracking-tight">
                      Database Rumus Model Box
                    </h1>
                  </div>
                  <p className="text-[11px] sm:text-xs text-[#8FA599]">
                    Parameter perhitungan otomatis untuk Board, Lapisan Dalam, Lapisan Luar, dan Pisau Pond
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8FA599]" />
                    <input
                      type="text"
                      value={formulaSearch}
                      onChange={(e) => setFormulaSearch(e.target.value)}
                      placeholder="Cari model atau rumus..."
                      className="w-full sm:w-44 rounded-lg border border-[#D4AF37]/25 bg-[#081610] pl-8 pr-2.5 py-1.5 text-xs text-[#F4F1EA] placeholder-[#6E8478] focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={openAddFormulaModal}
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-[#D4AF37] px-3 py-1.5 text-xs font-semibold text-[#07140F] hover:bg-[#E5C158] transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
                  >
                    <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                    <span>Tambah Rumus Model</span>
                  </button>
                </div>
              </div>

              {/* Detailed Formula Table matching reference image */}
              <div className="mt-4 overflow-x-auto pb-1">
                <table className="w-full min-w-[1380px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[#D4AF37]/15 bg-[#081610] text-[11px] font-semibold text-[#94A89B]">
                      <th className="py-2.5 pl-3 pr-2.5 rounded-tl-lg w-[13%]">
                        Model Box
                      </th>
                      <th className="py-2.5 px-2 w-[10%]">Board Body</th>
                      <th className="py-2.5 px-2 w-[12%]">Board Tutup</th>
                      <th className="py-2.5 px-2 w-[10.5%]">
                        Lapisan Dalam Body
                      </th>
                      <th className="py-2.5 px-2 w-[10.5%]">
                        Lapisan Dalam Tutup
                      </th>
                      <th className="py-2.5 px-2 w-[10.5%]">
                        Lapisan Luar Body
                      </th>
                      <th className="py-2.5 px-2 w-[10.5%]">
                        Lapisan Luar Tutup
                      </th>
                      <th className="py-2.5 px-2 w-[9.5%]">Pisau Body</th>
                      <th className="py-2.5 px-2 w-[10%]">Pisau Tutup</th>
                      <th className="py-2.5 pl-2 pr-3 text-right rounded-tr-lg w-[3.5%]">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D4AF37]/15 text-xs">
                    {filteredFormulaItems.length === 0 ? (
                      <tr>
                        <td
                          colSpan={10}
                          className="py-8 text-center text-xs text-[#8FA599]"
                        >
                          Tidak ada data rumus model yang cocok dengan pencarian.
                        </td>
                      </tr>
                    ) : (
                      filteredFormulaItems.map((item) => (
                        <tr
                          key={item.id}
                          className="group hover:bg-[#10291E]/60 transition-colors"
                        >
                          {/* 1. Model Box */}
                          <td className="py-2.5 pl-3 pr-2.5 align-top">
                            <button
                              onClick={() => openEditFormulaModal(item)}
                              className="text-left text-xs font-bold text-[#E5C158] hover:text-[#F5D77F] hover:underline transition-colors cursor-pointer leading-snug"
                              title="Klik untuk ubah rumus model ini"
                            >
                              {item.modelBox}
                            </button>
                          </td>

                          {/* 2. Board Body */}
                          <td className="py-2 px-2 align-top">
                            <div
                              onClick={() => openEditFormulaModal(item)}
                              className="rounded-md border border-[#D4AF37]/15 bg-[#081610] p-2 font-mono-tabular text-[10.5px] leading-relaxed text-[#E2ECE6] hover:border-[#D4AF37]/45 transition-colors cursor-pointer"
                            >
                              {item.boardBody}
                            </div>
                          </td>

                          {/* 3. Board Tutup */}
                          <td className="py-2 px-2 align-top">
                            <div
                              onClick={() => openEditFormulaModal(item)}
                              className="rounded-md border border-[#D4AF37]/15 bg-[#081610] p-2 font-mono-tabular text-[10.5px] leading-relaxed text-[#E2ECE6] hover:border-[#D4AF37]/45 transition-colors cursor-pointer"
                            >
                              {item.boardTutup}
                            </div>
                          </td>

                          {/* 4. Lapisan Dalam Body */}
                          <td className="py-2 px-2 align-top">
                            <div
                              onClick={() => openEditFormulaModal(item)}
                              className="rounded-md border border-[#D4AF37]/15 bg-[#081610] p-2 font-mono-tabular text-[10.5px] leading-relaxed text-[#E2ECE6] hover:border-[#D4AF37]/45 transition-colors cursor-pointer"
                            >
                              {item.lapisanDalamBody}
                            </div>
                          </td>

                          {/* 5. Lapisan Dalam Tutup */}
                          <td className="py-2 px-2 align-top">
                            <div
                              onClick={() => openEditFormulaModal(item)}
                              className="rounded-md border border-[#D4AF37]/15 bg-[#081610] p-2 font-mono-tabular text-[10.5px] leading-relaxed text-[#E2ECE6] hover:border-[#D4AF37]/45 transition-colors cursor-pointer"
                            >
                              {item.lapisanDalamTutup}
                            </div>
                          </td>

                          {/* 6. Lapisan Luar Body */}
                          <td className="py-2 px-2 align-top">
                            <div
                              onClick={() => openEditFormulaModal(item)}
                              className="rounded-md border border-[#D4AF37]/15 bg-[#081610] p-2 font-mono-tabular text-[10.5px] leading-relaxed text-[#E2ECE6] hover:border-[#D4AF37]/45 transition-colors cursor-pointer"
                            >
                              {item.lapisanLuarBody}
                            </div>
                          </td>

                          {/* 7. Lapisan Luar Tutup */}
                          <td className="py-2 px-2 align-top">
                            <div
                              onClick={() => openEditFormulaModal(item)}
                              className="rounded-md border border-[#D4AF37]/15 bg-[#081610] p-2 font-mono-tabular text-[10.5px] leading-relaxed text-[#E2ECE6] hover:border-[#D4AF37]/45 transition-colors cursor-pointer"
                            >
                              {item.lapisanLuarTutup}
                            </div>
                          </td>

                          {/* 8. Pisau Body */}
                          <td className="py-2 px-2 align-top">
                            <div
                              onClick={() => openEditFormulaModal(item)}
                              className="rounded-md border border-[#D4AF37]/15 bg-[#081610] p-2 font-mono-tabular text-[10.5px] leading-relaxed text-[#E2ECE6] hover:border-[#D4AF37]/45 transition-colors cursor-pointer"
                            >
                              {item.pisauBody}
                            </div>
                          </td>

                          {/* 9. Pisau Tutup */}
                          <td className="py-2 px-2 align-top">
                            <div
                              onClick={() => openEditFormulaModal(item)}
                              className="rounded-md border border-[#D4AF37]/15 bg-[#081610] p-2 font-mono-tabular text-[10.5px] leading-relaxed text-[#E2ECE6] hover:border-[#D4AF37]/45 transition-colors cursor-pointer"
                            >
                              {item.pisauTutup}
                            </div>
                          </td>

                          {/* 10. Aksi */}
                          <td className="py-2 pl-2 pr-3 align-top text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {deleteFormulaConfirmId === item.id ? (
                                <button
                                  onClick={() => handleDeleteFormula(item.id)}
                                  className="inline-flex items-center justify-center rounded-md bg-[#E11D48] px-2 py-1 text-[11px] font-semibold text-white hover:bg-[#BE123C] transition-colors cursor-pointer whitespace-nowrap"
                                  title="Konfirmasi Hapus"
                                >
                                  Hapus?
                                </button>
                              ) : (
                                <button
                                  onClick={() => setDeleteFormulaConfirmId(item.id)}
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#F43F5E]/25 bg-[#2A1216] text-[#F43F5E] hover:bg-[#3F1920] hover:border-[#F43F5E]/50 transition-colors cursor-pointer"
                                  title={`Hapus ${item.modelBox}`}
                                  aria-label={`Hapus ${item.modelBox}`}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          ) : activeMenu === 'ketentuan-logika' ? (
            /* Ketentuan Logika View (Aturan Kedua setelah Modal Kalkulator) with Logika Model, Logika Mesin, Logika Harga Tabs */
            <div className="space-y-4">
              {/* Banner Penjelasan Hirarki Aturan Ke-2 */}
              <div className="rounded-xl border border-[#D4AF37]/30 bg-[#0B1D15] px-4 py-3 shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                <div className="flex items-start sm:items-center gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#D4AF37]/35 bg-[#122D22] font-mono-tabular text-xs font-bold text-[#E5C158]">
                    02
                  </div>
                  <div>
                    <h2 className="text-xs sm:text-sm font-bold text-[#E5C158]">
                      Aturan Tahap Kedua — Ketentuan Logika Kalkulator Box
                    </h2>
                    <p className="text-[11px] text-[#94A89B] mt-0.5 leading-relaxed">
                      Digunakan setelah membaca database <strong>Modal Kalkulator</strong> (Tahap 01) sebagai aturan logika penentu perhitungan <strong>Harga Modal (HPP)</strong> dan <strong>Harga Jual</strong> pada Kalkulator Box.
                    </p>
                  </div>
                </div>
              </div>

              {/* Top Tab Selector: Logika Model, Logika Mesin, Logika Harga */}
              <div className="inline-flex flex-wrap items-center gap-1.5 rounded-xl border border-[#D4AF37]/25 bg-[#0B1D15] p-1.5 shadow-md">
                {LOGIC_TABS.map((tab) => {
                  const TabIcon = tab.icon;
                  const isTabActive = activeLogicTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveLogicTab(tab.id);
                        setDeleteLogicConfirmId(null);
                      }}
                      className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer ${
                        isTabActive
                          ? 'bg-[#D4AF37] text-[#07140F] shadow-sm'
                          : 'text-[#A9BEB2] hover:bg-[#122D22] hover:text-[#F3D77D]'
                      }`}
                    >
                      <TabIcon
                        className={`h-3.5 w-3.5 shrink-0 ${
                          isTabActive ? 'text-[#07140F]' : 'text-[#D4AF37]'
                        }`}
                      />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {(() => {
                const currentList =
                  activeLogicTab === 'logika-model'
                    ? logikaModelItems
                    : activeLogicTab === 'logika-mesin'
                    ? logikaMesinItems
                    : activeLogicTab === 'logika-proses'
                    ? logikaProsesItems
                    : activeLogicTab === 'logika-harga'
                    ? logikaHargaItems
                    : logikaOngkirItems;

                const TabIcon = currentLogicTabObj.icon;
                const subtitleText =
                  activeLogicTab === 'logika-model'
                    ? 'Aturan kondisi dimensi model box, sambungan board/kertas, dan penyesuaian otomatis konstruksi box'
                    : activeLogicTab === 'logika-mesin'
                    ? 'Aturan logika seputar cetak, mesin Digital A3+, serta mesin Offset (Mesin 52 & Mesin 58)'
                    : activeLogicTab === 'logika-proses'
                    ? 'Aturan logika seputar proses produksi lanjutan seperti Laminasi (Digital vs Offset), Logo (Std vs Custom), dan Pisau Pond'
                    : activeLogicTab === 'logika-harga'
                    ? 'Aturan perhitungan HPP (Harga Modal), margin keuntungan, tier kuantitas, dan pembulatan Harga Jual'
                    : 'Aturan ukuran kardus master 55x55x40 cm, kalkulasi muatan koli, berat volumetrik, dan rekomendasi ongkir termurah';

                return (
                  <div className="space-y-4">
                    {activeLogicTab === 'logika-harga' && (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                        {/* Ketentuan 1: Tabel Persentase Margin (%) & Pengali */}
                        <div className="lg:col-span-6 rounded-xl border border-[#D4AF37]/25 bg-[#0C2017] p-3.5 sm:p-4 shadow-lg space-y-3">
                          <div className="border-b border-[#D4AF37]/15 pb-2.5">
                            <h2 className="text-sm sm:text-base font-bold text-[#E5C158]">
                              1. Tabel Persentase Margin (%) &amp; Pengali
                            </h2>
                            <p className="text-[11px] text-[#8FA599] mt-0.5">
                              Aturan pengali untuk mencari Harga Jual dari Harga Modal:{' '}
                              <span className="font-mono-tabular text-[#F3D77D] font-semibold">
                                Contoh: Modal x 1.82 = Ambil Margin 45%
                              </span>
                            </p>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left text-xs">
                              <thead>
                                <tr className="border-b border-[#D4AF37]/20 bg-[#081610] text-[11px] font-semibold text-[#94A89B]">
                                  <th className="py-2 px-3 rounded-tl-lg">Margin (%)</th>
                                  <th className="py-2 px-3">Pengali</th>
                                  <th className="py-2 px-3 rounded-tr-lg">Rumus Harga Jual</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#D4AF37]/15 font-mono-tabular text-xs">
                                {MARGIN_MULTIPLIER_TABLE.map((row) => {
                                  const isExample = row.marginPct === 45;
                                  return (
                                    <tr
                                      key={row.marginPct}
                                      className={
                                        isExample
                                          ? 'bg-[#D4AF37]/15 font-bold text-[#F3D77D]'
                                          : 'hover:bg-[#10291E]/60 text-[#F4F1EA]'
                                      }
                                    >
                                      <td className="py-2 px-3 font-semibold text-[#E5C158]">
                                        {row.marginLabel}
                                      </td>
                                      <td className="py-2 px-3 font-bold">
                                        {row.pengali.toFixed(2)}
                                      </td>
                                      <td className="py-2 px-3 text-[11px] text-[#B8C7BE]">
                                        {row.rumusHargaJual}
                                        {isExample && (
                                          <span className="ml-2 inline-block rounded bg-[#D4AF37] px-1.5 py-0.5 font-sans text-[9px] font-bold text-[#07140F]">
                                            Contoh 45%
                                          </span>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Ketentuan 2: Logika Margin Berdasarkan Qty */}
                        <div className="lg:col-span-6 rounded-xl border border-[#D4AF37]/25 bg-[#0C2017] p-3.5 sm:p-4 shadow-lg space-y-3">
                          <div className="border-b border-[#D4AF37]/15 pb-2.5">
                            <h2 className="text-sm sm:text-base font-bold text-[#E5C158]">
                              2. Ketentuan Logika Margin Berdasarkan Qty
                            </h2>
                            <p className="text-[11px] text-[#8FA599] mt-0.5">
                              Penentuan persentase margin otomatis dan interpolasi berdasarkan jumlah pesanan (Qty)
                            </p>
                          </div>

                          <ul className="space-y-2">
                            {MARGIN_QTY_TIERS.map((tier) => (
                              <li
                                key={tier.id}
                                className="rounded-lg border border-[#D4AF37]/20 bg-[#081610] px-3 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5"
                              >
                                <div className="space-y-0.5">
                                  <div className="font-mono-tabular text-xs font-bold text-[#F4F1EA]">
                                    • {tier.rentangQty} :{' '}
                                    <span className="text-[#E5C158]">{tier.ketentuanMargin}</span>
                                  </div>
                                  <p className="text-[10px] text-[#8FA599]">{tier.keterangan}</p>
                                </div>
                                <span className="self-start sm:self-auto shrink-0 rounded-md border border-[#D4AF37]/30 bg-[#122D22] px-2 py-0.5 font-mono-tabular text-[11px] font-semibold text-[#F3D77D]">
                                  Pengali: {tier.pengaliRange}
                                </span>
                              </li>
                            ))}
                          </ul>

                          <div className="rounded-lg border border-[#D4AF37]/30 bg-[#122D22]/70 p-2.5 text-[11px] text-[#B8C7BE] leading-relaxed">
                            <strong className="text-[#E5C158]">Cara Kerja:</strong> Sistem menentukan{' '}
                            <strong className="text-[#F4F1EA]">Margin (%)</strong> dari Qty pesanan (dengan interpolasi sesuai rentang di atas), lalu mengambil nilai{' '}
                            <strong className="text-[#F4F1EA]">Pengali</strong> untuk menghitung{' '}
                            <strong className="text-[#F3D77D]">Harga Jual = Harga Modal x Pengali</strong>.
                          </div>
                        </div>
                      </div>
                    )}

                    {activeLogicTab === 'logika-ongkir' && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                        <div className="rounded-xl border border-[#D4AF37]/30 bg-[#0C2017] p-4 shadow-md">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-[#8FA599] uppercase tracking-wider">
                              Kardus Master Workshop
                            </span>
                            <span className="rounded bg-[#D4AF37]/15 px-1.5 py-0.5 text-[10px] font-bold text-[#E5C158]">
                              Standar
                            </span>
                          </div>
                          <div className="mt-1.5 font-mono-tabular text-xl font-bold text-[#E5C158]">
                            55 x 55 x 40 cm
                          </div>
                          <div className="text-[11px] text-[#A7BBB0] mt-1">
                            Volume: 121.000 cm³ | Standar Koli
                          </div>
                        </div>

                        <div className="rounded-xl border border-[#D4AF37]/30 bg-[#0C2017] p-4 shadow-md">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-[#8FA599] uppercase tracking-wider">
                              Berat Volumetrik Kargo
                            </span>
                            <span className="rounded bg-[#D4AF37]/15 px-1.5 py-0.5 text-[10px] font-bold text-[#F3D77D]">
                              Kargo
                            </span>
                          </div>
                          <div className="mt-1.5 font-mono-tabular text-xl font-bold text-[#F3D77D]">
                            30.25 kg / koli
                          </div>
                          <div className="text-[11px] text-[#A7BBB0] mt-1">
                            Rumus: (55 x 55 x 40) ÷ 4.000
                          </div>
                        </div>

                        <div className="rounded-xl border border-[#D4AF37]/30 bg-[#0C2017] p-4 shadow-md">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-[#8FA599] uppercase tracking-wider">
                              Rumus Maximum Harga
                            </span>
                            <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">
                              Otomatis
                            </span>
                          </div>
                          <div className="mt-1.5 font-mono-tabular text-sm font-bold text-emerald-400">
                            ((25 - 10) x Harga/kg) + Min
                          </div>
                          <div className="text-[11px] text-[#8FA599] mt-1">
                            Terhubung ke Kalkulator Hitung Ongkir
                          </div>
                        </div>
                      </div>
                    )}

                    <section className="rounded-xl border border-[#D4AF37]/25 bg-[#0C2017] p-3.5 sm:p-5 shadow-lg">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3.5 sm:pb-4 border-b border-[#D4AF37]/15">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <TabIcon className="h-4 w-4 text-[#D4AF37] shrink-0" />
                            <h1 className="text-sm sm:text-base font-bold text-[#E5C158] tracking-tight">
                              Tabel Ketentuan Logika — {currentLogicTabObj.label}
                            </h1>
                          </div>
                          <p className="text-[11px] sm:text-xs text-[#8FA599]">
                            {subtitleText}
                          </p>
                        </div>

                        <button
                          onClick={openAddLogicModal}
                          className="flex items-center justify-center gap-1.5 rounded-lg bg-[#D4AF37] px-3 py-1.5 text-xs font-semibold text-[#07140F] hover:bg-[#E5C158] transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
                        >
                          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                          <span>Tambah {currentLogicTabObj.label}</span>
                        </button>
                      </div>

                      <div className="mt-4 overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                          <thead>
                            <tr className="border-b border-[#D4AF37]/15 bg-[#081610] text-[11px] font-semibold text-[#94A89B]">
                              <th className="py-2.5 pl-3 pr-3 rounded-tl-lg w-[22%]">
                                Nama Parameter / {currentLogicTabObj.label}
                              </th>
                              <th className="py-2.5 px-3 w-[22%]">
                                Kondisi / Syarat Trigger
                              </th>
                              <th className="py-2.5 px-3 w-[18%]">
                                Rumus / Keputusan Logika
                              </th>
                              <th className="py-2.5 px-3 w-[22%]">Keterangan</th>
                              <th className="py-2.5 pl-3 pr-3 rounded-tr-lg w-[16%]">
                                Aksi
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#D4AF37]/15 text-xs">
                            {currentList.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="p-0">
                                  <div className="flex min-h-[200px] flex-col items-center justify-center px-4 py-8 text-center">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#D4AF37]/35 bg-[#122D22] text-[#D4AF37] shadow-inner mb-3">
                                      <Construction className="h-5 w-5" />
                                    </div>
                                    <h2 className="font-display text-base sm:text-lg font-bold tracking-wide text-[#E5C158] uppercase">
                                      MAINTENANCE
                                    </h2>
                                    <p className="mt-1 text-xs font-medium text-[#F4F1EA]">
                                      Halaman Tabel{' '}
                                      <span className="text-[#E5C158]">
                                        {currentLogicTabObj.label}
                                      </span>{' '}
                                      sedang dalam proses maintenance
                                    </p>
                                    <p className="mt-0.5 max-w-md text-[11px] text-[#8FA599] leading-relaxed">
                                      Aturan {currentLogicTabObj.label.toLowerCase()} (Tahap 2 setelah Modal Kalkulator untuk perhitungan harga modal/jual) saat ini masih dikosongkan sementara. Anda juga dapat menekan tombol{' '}
                                      <strong>+ Tambah {currentLogicTabObj.label}</strong> di kanan atas.
                                    </p>
                                  </div>
                                </td>
                              </tr>
                            ) : (
                              currentList.map((item) => {
                                const dashIdx = item.namaAturan.indexOf('–');
                                return (
                                  <tr
                                    key={item.id}
                                    className="group hover:bg-[#10291E]/70 transition-colors"
                                  >
                                    <td className="py-2.5 pl-3 pr-3 align-top">
                                      <button
                                        onClick={() => openEditLogicModal(item)}
                                        className="text-left text-xs leading-relaxed text-[#F4F1EA] hover:text-[#F5D77F] transition-colors cursor-pointer"
                                      >
                                        {dashIdx !== -1 ? (
                                          <>
                                            <span>{item.namaAturan.slice(0, dashIdx + 1)} </span>
                                            <strong className="font-bold text-[#E5C158]">
                                              {item.namaAturan.slice(dashIdx + 1).trim()}
                                            </strong>
                                          </>
                                        ) : (
                                          <span className="font-semibold text-[#E5C158]">
                                            {item.namaAturan}
                                          </span>
                                        )}
                                      </button>
                                    </td>

                                    <td className="py-2 px-3 align-top">
                                      <div
                                        onClick={() => openEditLogicModal(item)}
                                        className="rounded-md border border-[#D4AF37]/15 bg-[#081610] px-2.5 py-1.5 text-left font-mono-tabular text-xs leading-relaxed text-[#F4F1EA] hover:border-[#D4AF37]/45 transition-colors cursor-pointer"
                                      >
                                        {item.kondisiTrigger}
                                      </div>
                                    </td>

                                    <td className="py-2 px-3 align-top">
                                      <div
                                        onClick={() => openEditLogicModal(item)}
                                        className="rounded-md border border-[#D4AF37]/15 bg-[#081610] px-2.5 py-1.5 text-left font-mono-tabular text-xs font-semibold leading-relaxed text-[#E5C158] hover:border-[#D4AF37]/45 transition-colors cursor-pointer whitespace-pre-line"
                                      >
                                        {item.rumusTindakan}
                                      </div>
                                    </td>

                                    <td className="py-2 px-3 align-top text-[11px] sm:text-xs leading-relaxed text-[#A7BBB0]">
                                      {item.keterangan}
                                    </td>

                                    <td className="py-2 pl-3 pr-3 align-top">
                                      <div className="flex items-center justify-between gap-1.5">
                                        <span
                                          onClick={() => openEditLogicModal(item)}
                                          className="font-mono-tabular text-xs font-semibold text-[#F4F1EA] cursor-pointer hover:text-[#E5C158]"
                                        >
                                          {item.aksi || '-'}
                                        </span>

                                        <div className="flex items-center gap-1 shrink-0">
                                          <button
                                            onClick={() => openEditLogicModal(item)}
                                            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#D4AF37]/20 bg-[#081610] text-[#D4AF37] hover:bg-[#163528] hover:border-[#D4AF37]/50 transition-colors cursor-pointer"
                                            title={`Ubah ${item.namaAturan}`}
                                          >
                                            <Pencil className="h-3 w-3" />
                                          </button>

                                          {deleteLogicConfirmId === item.id ? (
                                            <button
                                              onClick={() => handleDeleteLogicItem(item.id)}
                                              className="inline-flex items-center justify-center rounded-md bg-[#E11D48] px-2 py-1 text-[11px] font-semibold text-white hover:bg-[#BE123C] transition-colors cursor-pointer whitespace-nowrap"
                                            >
                                              Hapus?
                                            </button>
                                          ) : (
                                            <button
                                              onClick={() => setDeleteLogicConfirmId(item.id)}
                                              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#F43F5E]/25 bg-[#2A1216] text-[#F43F5E] hover:bg-[#3F1920] hover:border-[#F43F5E]/50 transition-colors cursor-pointer"
                                              title={`Hapus ${item.namaAturan}`}
                                            >
                                              <Trash2 className="h-3 w-3" />
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  </div>
                );
              })()}
            </div>
          ) : activeMenu === 'modal-ongkir' ? (
            /* Modal Ongkir View - Database Tarif Ekspedisi */
            <section className="rounded-xl border border-[#D4AF37]/25 bg-[#0C2017] p-3.5 sm:p-5 shadow-lg">
              {/* Section Header */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3.5 sm:pb-4 border-b border-[#D4AF37]/15">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-[#D4AF37] shrink-0" />
                    <h1 className="text-sm sm:text-base font-bold text-[#E5C158] tracking-tight">
                      Tabel Modal Ongkir
                    </h1>
                  </div>
                  <p className="text-[11px] sm:text-xs text-[#8FA599]">
                    Database tarif ekspedisi dan ongkos kirim (Service, Kota Asal, Kota Tujuan, Estimasi, Harga Perkg, Minimum Harga)
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8FA599]" />
                    <input
                      type="text"
                      value={ongkirSearch}
                      onChange={(e) => setOngkirSearch(e.target.value)}
                      placeholder="Cari service / kota..."
                      className="w-full sm:w-48 rounded-lg border border-[#D4AF37]/25 bg-[#081610] pl-8 pr-2.5 py-1.5 text-xs text-[#F4F1EA] placeholder-[#6E8478] focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={openAddOngkirModal}
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-[#D4AF37] px-3 py-1.5 text-xs font-semibold text-[#07140F] hover:bg-[#E5C158] transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
                  >
                    <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                    <span>Tambah Modal Ongkir</span>
                  </button>
                </div>
              </div>

              {/* Table Modal Ongkir */}
              <div className="mt-4 overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[#D4AF37]/15 bg-[#081610] text-[11px] font-semibold text-[#94A89B]">
                      <th className="py-2.5 pl-3 pr-3 rounded-tl-lg w-[18%]">
                        Service
                      </th>
                      <th className="py-2.5 px-3 w-[14%]">
                        Kota Asal
                      </th>
                      <th className="py-2.5 px-3 w-[14%]">
                        Kota Tujuan
                      </th>
                      <th className="py-2.5 px-3 text-center w-[12%]">
                        Estimasi Tiba
                      </th>
                      <th className="py-2.5 px-3 text-center w-[13%]">
                        Harga Perkg
                      </th>
                      <th className="py-2.5 px-3 text-center w-[13%]">
                        Minimum Harga
                      </th>
                      <th className="py-2.5 px-3 text-center w-[14%]">
                        Maximum Harga
                      </th>
                      <th className="py-2.5 pl-3 pr-3 text-right rounded-tr-lg w-[8%]">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D4AF37]/15 text-xs">
                    {filteredOngkirItems.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="py-12 text-center text-xs text-[#8FA599]"
                        >
                          <div className="flex flex-col items-center justify-center">
                            <Truck className="h-8 w-8 text-[#D4AF37]/40 mb-2" />
                            <p className="font-medium text-[#F4F1EA]">
                              Tidak ada data modal ongkir yang ditemukan.
                            </p>
                            <p className="text-[11px] text-[#8FA599] mt-0.5">
                              Silakan tambah data baru menggunakan tombol di kanan atas.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredOngkirItems.map((item) => (
                        <tr
                          key={item.id}
                          className="group hover:bg-[#10291E]/70 transition-colors"
                        >
                          {/* 1. Service */}
                          <td className="py-3 pl-3 pr-3 align-middle">
                            <button
                              onClick={() => openEditOngkirModal(item)}
                              className="text-left font-bold text-[#E5C158] hover:text-[#F5D77F] hover:underline transition-colors cursor-pointer text-xs"
                              title="Klik untuk ubah data ongkir"
                            >
                              {item.service}
                            </button>
                          </td>

                          {/* 2. Kota Asal */}
                          <td className="py-3 px-3 align-middle font-medium text-[#E2ECE6]">
                            {item.kotaAsal}
                          </td>

                          {/* 3. Kota Tujuan */}
                          <td className="py-3 px-3 align-middle font-medium text-[#E2ECE6]">
                            {item.kotaTujuan}
                          </td>

                          {/* 4. Estimasi Tiba */}
                          <td className="py-3 px-3 align-middle text-center">
                            <span className="inline-block rounded-md border border-[#D4AF37]/25 bg-[#081610] px-2.5 py-1 text-[11px] font-semibold text-[#F3D77D]">
                              {item.estimasiTiba}
                            </span>
                          </td>

                          {/* 5. Harga Perkg */}
                          <td className="py-3 px-3 align-middle text-center font-mono-tabular text-xs font-semibold text-[#F4F1EA]">
                            {formatRupiah(item.hargaPerKg)}
                            <span className="text-[10px] text-[#8FA599] font-normal ml-1">/ kg</span>
                          </td>

                          {/* 6. Minimum Harga */}
                          <td className="py-3 px-3 align-middle text-center font-mono-tabular text-xs font-semibold text-emerald-400">
                            {formatRupiah(item.minimumHarga)}
                          </td>

                          {/* 7. Maximum Harga (Otomatis: ((25-10) x Harga/kg) + Minimum Harga) */}
                          <td className="py-3 px-3 align-middle text-center font-mono-tabular text-xs font-semibold text-[#E5C158]">
                            {formatRupiah(
                              item.maximumHarga ??
                                calculateMaxOngkir(item.hargaPerKg, item.minimumHarga)
                            )}
                          </td>

                          {/* 8. Aksi */}
                          <td className="py-3 pl-3 pr-3 align-middle text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditOngkirModal(item)}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#D4AF37]/20 bg-[#081610] text-[#D4AF37] hover:bg-[#163528] hover:border-[#D4AF37]/50 transition-colors cursor-pointer"
                                title={`Ubah ${item.service}`}
                                aria-label={`Ubah ${item.service}`}
                              >
                                <Pencil className="h-3 w-3" />
                              </button>

                              {deleteOngkirConfirmId === item.id ? (
                                <button
                                  onClick={() => handleDeleteOngkir(item.id)}
                                  className="inline-flex items-center justify-center rounded-md bg-[#E11D48] px-2 py-1 text-[11px] font-semibold text-white hover:bg-[#BE123C] transition-colors cursor-pointer whitespace-nowrap"
                                  title="Konfirmasi Hapus"
                                >
                                  Hapus?
                                </button>
                              ) : (
                                <button
                                  onClick={() => setDeleteOngkirConfirmId(item.id)}
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#F43F5E]/25 bg-[#2A1216] text-[#F43F5E] hover:bg-[#3F1920] hover:border-[#F43F5E]/50 transition-colors cursor-pointer"
                                  title={`Hapus ${item.service}`}
                                  aria-label={`Hapus ${item.service}`}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          ) : activeMenu === 'hitung-ongkir' ? (
            /* Kalkulator Hitung Ongkir */
            <div className="space-y-4">
              {/* Header Banner */}
              <div className="rounded-xl border border-[#D4AF37]/30 bg-[#0C2017] p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#D4AF37]/35 bg-[#122D22] text-[#D4AF37]">
                      <Truck className="h-4 w-4" />
                    </div>
                    <h1 className="text-base sm:text-lg font-bold text-[#E5C158] tracking-tight">
                      Kalkulator H.Ongkir Box &amp; Koli
                    </h1>
                  </div>
                  <p className="text-xs text-[#8FA599] max-w-2xl">
                    Perhitungan otomatis kebutuhan koli menggunakan kardus master workshop (55 x 55 x 40 cm), estimasi volumetrik, serta perbandingan tarif ekspedisi termurah dari database Modal Ongkir.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSelectMenu('modal-ongkir')}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4AF37]/35 bg-[#122D22] px-3 py-1.5 text-xs font-semibold text-[#F3D77D] hover:bg-[#193B2D] transition-colors cursor-pointer"
                  >
                    <Truck className="h-3.5 w-3.5 text-[#D4AF37]" />
                    <span>Data Modal Ongkir</span>
                  </button>
                  <button
                    onClick={() => {
                      handleSelectMenu('ketentuan-logika');
                      setActiveLogicTab('logika-ongkir');
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4AF37]/25 bg-[#081610] px-3 py-1.5 text-xs font-semibold text-[#A7BBB0] hover:text-[#E5C158] hover:bg-[#122D22] transition-colors cursor-pointer"
                  >
                    <Lightbulb className="h-3.5 w-3.5 text-[#D4AF37]" />
                    <span>Logika Ongkir</span>
                  </button>
                </div>
              </div>

              {/* 2 Card Kiri - Kanan Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
                {/* KOLOM KIRI (Input Data & Card Tambahan Kardus Master) */}
                <div className="lg:col-span-5 space-y-4">
                  {/* CARD 1 KIRI: Penginputan Data (Gold Card Theme) */}
                  <section className="rounded-xl border-2 border-[#D4AF37]/50 bg-gradient-to-br from-[#1C1709] via-[#141208] to-[#0D1812] p-4 sm:p-5 shadow-[0_4px_24px_rgba(212,175,55,0.12)] space-y-4 relative overflow-hidden ring-1 ring-[#D4AF37]/20">
                    {/* Ambient gold glow */}
                    <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[#D4AF37]/10 blur-2xl" />

                    <div className="relative flex items-center justify-between border-b border-[#D4AF37]/25 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#B38F26] text-[#07140F] shadow-sm">
                          <Calculator className="h-4 w-4 stroke-[2.5]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-xs sm:text-sm font-extrabold text-[#F5DF88] uppercase tracking-wide">
                              Input Data Pengiriman
                            </h2>
                            <span className="rounded bg-[#D4AF37]/20 border border-[#D4AF37]/40 px-1.5 py-0.5 text-[9.5px] font-bold text-[#F3D77D] uppercase tracking-wider">
                              Proses Input
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleSyncFromBoxCalc}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4AF37]/45 bg-[#251E0E] hover:bg-[#342A13] px-2.5 py-1 text-[11px] font-semibold text-[#F3D77D] hover:text-[#FFF0B8] transition-all cursor-pointer shadow-xs"
                        title="Ambil P, L, T, dan Qty dari Kalkulator Hardbox"
                      >
                        <Box className="h-3.5 w-3.5 text-[#D4AF37]" />
                        <span>Salin dari Hardbox</span>
                      </button>
                    </div>

                    {/* Baris Pertama: Dropdown Kota Asal & Kota Tujuan */}
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="flex items-center gap-1.5 text-xs font-semibold text-[#EBDCB2] mb-1.5">
                            <MapPin className="h-3.5 w-3.5 text-[#D4AF37]" />
                            <span>Kota Asal</span>
                          </label>
                          <select
                            value={calcOngkirOrigin}
                            onChange={(e) => {
                              setCalcOngkirOrigin(e.target.value);
                              setSelectedShippingServiceId(null);
                            }}
                            className="w-full rounded-lg border border-[#D4AF37]/40 bg-[#0E0C06] px-3 py-2 text-xs text-[#F4F1EA] focus:border-[#F3D77D] focus:ring-1 focus:ring-[#D4AF37]/40 focus:outline-none cursor-pointer"
                          >
                            <option value="">-- Pilih Kota Asal --</option>
                            {availableOrigins.map((kota) => (
                              <option key={kota} value={kota}>
                                {kota}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="flex items-center gap-1.5 text-xs font-semibold text-[#EBDCB2] mb-1.5">
                            <MapPin className="h-3.5 w-3.5 text-[#F3D77D]" />
                            <span>Kota Tujuan</span>
                          </label>
                          <select
                            value={calcOngkirDestination}
                            onChange={(e) => {
                              setCalcOngkirDestination(e.target.value);
                              setSelectedShippingServiceId(null);
                            }}
                            className="w-full rounded-lg border border-[#D4AF37]/40 bg-[#0E0C06] px-3 py-2 text-xs text-[#F4F1EA] focus:border-[#F3D77D] focus:ring-1 focus:ring-[#D4AF37]/40 focus:outline-none cursor-pointer"
                          >
                            <option value="">-- Pilih Kota Tujuan --</option>
                            {availableDestinations.map((kota) => (
                              <option key={kota} value={kota}>
                                {kota}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {calcOngkirOrigin && calcOngkirDestination && matchingShippingServices.length === 0 && (
                        <div className="rounded-lg border border-[#F43F5E]/30 bg-[#2A1216] p-2.5 text-[11px] text-[#FDA4AF] flex items-center justify-between">
                          <span>Belum ada tarif untuk rute ini.</span>
                          <button
                            onClick={() => handleSelectMenu('modal-ongkir')}
                            className="underline font-semibold text-[#FDA4AF] hover:text-white cursor-pointer"
                          >
                            Tambah di Modal Ongkir
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Baris Kedua: Input Dimensi Box Satuan (P, L, T) dan Qty */}
                    <div className="space-y-3 pt-2 border-t border-[#D4AF37]/20">
                      <div>
                        <label className="block text-xs font-semibold text-[#EBDCB2] mb-1.5">
                          Ukuran Box Satuan (cm)
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <span className="block text-[10px] text-[#C5B896] mb-1">Panjang (P)</span>
                            <div className="relative">
                              <input
                                type="number"
                                min={0}
                                step="any"
                                value={calcOngkirP}
                                onChange={(e) => setCalcOngkirP(e.target.value)}
                                onFocus={(e) => {
                                  if (e.target.value === '0') e.target.select();
                                }}
                                placeholder="0"
                                className="w-full rounded-lg border border-[#D4AF37]/40 bg-[#0E0C06] px-2.5 py-1.5 font-mono-tabular text-xs font-bold text-[#F4F1EA] focus:border-[#F3D77D] focus:ring-1 focus:ring-[#D4AF37]/40 focus:outline-none text-center"
                              />
                              <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-[#8C7A52]">cm</span>
                            </div>
                          </div>

                          <div>
                            <span className="block text-[10px] text-[#C5B896] mb-1">Lebar (L)</span>
                            <div className="relative">
                              <input
                                type="number"
                                min={0}
                                step="any"
                                value={calcOngkirL}
                                onChange={(e) => setCalcOngkirL(e.target.value)}
                                onFocus={(e) => {
                                  if (e.target.value === '0') e.target.select();
                                }}
                                placeholder="0"
                                className="w-full rounded-lg border border-[#D4AF37]/40 bg-[#0E0C06] px-2.5 py-1.5 font-mono-tabular text-xs font-bold text-[#F4F1EA] focus:border-[#F3D77D] focus:ring-1 focus:ring-[#D4AF37]/40 focus:outline-none text-center"
                              />
                              <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-[#8C7A52]">cm</span>
                            </div>
                          </div>

                          <div>
                            <span className="block text-[10px] text-[#C5B896] mb-1">Tinggi (T)</span>
                            <div className="relative">
                              <input
                                type="number"
                                min={0}
                                step="any"
                                value={calcOngkirT}
                                onChange={(e) => setCalcOngkirT(e.target.value)}
                                onFocus={(e) => {
                                  if (e.target.value === '0') e.target.select();
                                }}
                                placeholder="0"
                                className="w-full rounded-lg border border-[#D4AF37]/40 bg-[#0E0C06] px-2.5 py-1.5 font-mono-tabular text-xs font-bold text-[#F4F1EA] focus:border-[#F3D77D] focus:ring-1 focus:ring-[#D4AF37]/40 focus:outline-none text-center"
                              />
                              <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-[#8C7A52]">cm</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#EBDCB2] mb-1.5">
                          Jumlah Box Pesanan (Qty)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min={0}
                            step={1}
                            value={calcOngkirQty}
                            onChange={(e) => setCalcOngkirQty(e.target.value)}
                            onFocus={(e) => {
                              if (e.target.value === '0') e.target.select();
                            }}
                            placeholder="0"
                            className="w-full rounded-lg border border-[#D4AF37]/40 bg-[#0E0C06] pl-3 pr-12 py-2 font-mono-tabular text-xs font-bold text-[#F4F1EA] focus:border-[#F3D77D] focus:ring-1 focus:ring-[#D4AF37]/40 focus:outline-none"
                          />
                          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[#C5B896]">
                            pcs
                          </span>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* CARD TAMBAHAN DI BAWAH CARD KIRI: Kardus yang Kita Punya (55 x 55 x 40) */}
                  <section className="rounded-xl border border-[#D4AF37]/35 bg-[#122D22]/80 p-4 sm:p-5 shadow-lg space-y-3 relative overflow-hidden">
                    <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
                      <Box className="w-36 h-36 text-[#D4AF37]" />
                    </div>

                    <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-[#D4AF37]" />
                        <h3 className="text-xs sm:text-sm font-bold text-[#E5C158] uppercase tracking-wide">
                          Kardus Master yang Kita Punya
                        </h3>
                      </div>
                      <span className="rounded bg-[#D4AF37]/15 border border-[#D4AF37]/30 px-2 py-0.5 text-[10px] font-bold text-[#F3D77D]">
                        Standar Workshop
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-baseline justify-between rounded-lg border border-[#D4AF37]/25 bg-[#081610] p-3">
                        <span className="text-xs text-[#B8C7BE] font-medium">Ukuran Kardus:</span>
                        <div className="font-mono-tabular text-base sm:text-lg font-bold text-[#E5C158]">
                          55 x 55 x 40 <span className="text-xs text-[#8FA599] font-normal">cm</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-lg border border-[#D4AF37]/15 bg-[#081610]/70 p-2.5 space-y-0.5">
                          <span className="text-[10px] text-[#8FA599] block">Volume Master:</span>
                          <span className="font-mono-tabular text-xs font-semibold text-[#F4F1EA]">
                            121.000 cm³
                          </span>
                        </div>

                        <div className="rounded-lg border border-[#D4AF37]/15 bg-[#081610]/70 p-2.5 space-y-0.5">
                          <span className="text-[10px] text-[#8FA599] block">Berat Volumetrik:</span>
                          <span className="font-mono-tabular text-xs font-semibold text-[#F4F1EA]">
                            30.25 kg / koli
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-[#8FA599] leading-relaxed pt-1">
                        Sistem membaca kardus master <strong className="text-[#F4F1EA]">55 x 55 x 40 cm</strong> ini untuk menghitung kapasitas muatan per koli dan menentukan total koli yang dibutuhkan secara otomatis.
                      </p>
                    </div>
                  </section>
                </div>

                {/* KOLOM KANAN (Rincian Biaya Ongkir, Jumlah Koli, & Rekomendasi Service) */}
                <div className="lg:col-span-7 space-y-4">
                  {/* CARD 1 KANAN: Rincian Biaya Ongkir & Jumlah Koli */}
                  <section className="rounded-xl border border-[#D4AF37]/30 bg-[#0C2017] p-4 sm:p-5 shadow-lg space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-[#D4AF37]/15 gap-2">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-[#D4AF37]" />
                        <h2 className="text-xs sm:text-sm font-bold text-[#E5C158] uppercase tracking-wide">
                          Rincian Biaya Ongkir &amp; Jumlah Koli
                        </h2>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-mono-tabular">
                        <span className="text-[#8FA599]">{calcOngkirOrigin || 'Pilih Asal'}</span>
                        <ArrowRight className="h-3 w-3 text-[#D4AF37]" />
                        <span className="text-[#E5C158] font-bold">{calcOngkirDestination || 'Pilih Tujuan'}</span>
                      </div>
                    </div>

                    {/* Stat Highlights: 3 Kolom */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Box 1: Jumlah Koli */}
                      <div className="rounded-xl border border-[#D4AF37]/30 bg-[#122D22] p-3.5 space-y-1">
                        <span className="text-[10px] font-semibold text-[#8FA599] uppercase tracking-wider block">
                          Jumlah Koli
                        </span>
                        <div className="font-mono-tabular text-2xl font-bold text-[#E5C158]">
                          {packingResult.totalKoli}{' '}
                          <span className="text-xs font-normal text-[#B8C7BE]">Koli</span>
                        </div>
                        <p className="text-[10.5px] text-[#A7BBB0]">
                          1 koli muat <strong className="text-[#F4F1EA]">{packingResult.pcsPerCarton}</strong> pcs
                        </p>
                      </div>

                      {/* Box 2: Estimasi Berat Total */}
                      <div className="rounded-xl border border-[#D4AF37]/30 bg-[#122D22] p-3.5 space-y-1">
                        <span className="text-[10px] font-semibold text-[#8FA599] uppercase tracking-wider block">
                          Total Berat Kargo
                        </span>
                        <div className="font-mono-tabular text-2xl font-bold text-[#F3D77D]">
                          {packingResult.totalWeightKg.toFixed(1)}{' '}
                          <span className="text-xs font-normal text-[#B8C7BE]">kg</span>
                        </div>
                        <p className="text-[10.5px] text-[#A7BBB0]">
                          ~{packingResult.weightPerKoliKg} kg per kardus
                        </p>
                      </div>

                      {/* Box 3: Total Biaya Ongkir */}
                      <div className="rounded-xl border border-emerald-500/35 bg-[#122D22] p-3.5 space-y-1">
                        <span className="text-[10px] font-semibold text-emerald-400/80 uppercase tracking-wider block">
                          Total Estimasi Ongkir
                        </span>
                        <div className="font-mono-tabular text-xl sm:text-2xl font-bold text-emerald-400">
                          {formatRupiah(activeSelectedServiceOption?.totalOngkir || 0)}
                        </div>
                        <p className="text-[10.5px] text-[#A7BBB0]">
                          {formatRupiah(activeSelectedServiceOption?.biayaPerKoli || 0)} / koli
                        </p>
                      </div>
                    </div>

                    {/* Breakdown Detail Perhitungan */}
                    <div className="rounded-lg border border-[#D4AF37]/15 bg-[#081610] p-3.5 space-y-2.5 text-xs">
                      <div className="text-[11px] font-bold text-[#E5C158] border-b border-[#D4AF37]/10 pb-1.5 flex items-center justify-between">
                        <span>Detail Parameter Kardus &amp; Susunan:</span>
                        <span className="font-mono-tabular text-[#8FA599]">
                          Qty: {calcOngkirQty} pcs
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-[#8FA599]">Volume 1 Pcs Box:</span>{' '}
                          <strong className="text-[#F4F1EA] font-mono-tabular">
                            {packingResult.boxVolumeCm3.toLocaleString('id-ID')} cm³
                          </strong>
                        </div>
                        <div>
                          <span className="text-[#8FA599]">Volume Kardus Master:</span>{' '}
                          <strong className="text-[#F4F1EA] font-mono-tabular">
                            {packingResult.masterVolumeCm3.toLocaleString('id-ID')} cm³
                          </strong>
                        </div>
                        <div>
                          <span className="text-[#8FA599]">Orientasi Muatan:</span>{' '}
                          <span className="text-[#F3D77D] font-mono-tabular">
                            {packingResult.arrangementLabel}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#8FA599]">Komposisi Koli:</span>{' '}
                          <span className="text-[#F4F1EA] font-mono-tabular">
                            {packingResult.fullCartons} koli penuh
                            {packingResult.lastCartonPcs !== packingResult.pcsPerCarton && packingResult.fullCartons > 0
                              ? ` + 1 koli isi ${packingResult.lastCartonPcs} pcs`
                              : ''}
                          </span>
                        </div>
                      </div>

                      {activeSelectedServiceOption && (
                        <div className="border-t border-[#D4AF37]/15 pt-2.5 text-[11px] space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[#8FA599]">Layanan Aktif:</span>
                            <strong className="text-[#E5C158]">
                              {activeSelectedServiceOption.service.service}
                            </strong>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[#8FA599]">Rumus Hitung Ongkir:</span>
                            <span className="font-mono-tabular text-[#B8C7BE]">
                              {packingResult.totalKoli} koli x {formatRupiah(activeSelectedServiceOption.biayaPerKoli)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* CARD 2 KANAN (Di Bawahnya): Rekomendasi Pilihan Service / Layanan */}
                  <section className="rounded-xl border border-[#D4AF37]/25 bg-[#0C2017] p-4 sm:p-5 shadow-lg space-y-3.5">
                    <div className="flex items-center justify-between border-b border-[#D4AF37]/15 pb-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-[#D4AF37]" />
                          <h3 className="text-xs sm:text-sm font-bold text-[#E5C158] uppercase tracking-wide">
                            Rekomendasi Pilihan Service / Ekspedisi
                          </h3>
                        </div>
                        <p className="text-[11px] text-[#8FA599]">
                          {calcOngkirOrigin && calcOngkirDestination
                            ? `Pilihan layanan yang tersedia untuk rute ${calcOngkirOrigin} ➔ ${calcOngkirDestination}`
                            : 'Silakan pilih Kota Asal & Kota Tujuan pada form input gold di sebelah kiri'}
                        </p>
                      </div>
                      <span className="rounded-full bg-[#122D22] border border-[#D4AF37]/30 px-2.5 py-0.5 font-mono-tabular text-[11px] text-[#F3D77D]">
                        {matchingShippingServices.length} Opsi
                      </span>
                    </div>

                    {matchingShippingServices.length === 0 ? (
                      <div className="rounded-xl border border-[#D4AF37]/20 bg-[#081610] p-6 text-center space-y-2">
                        <Truck className="h-7 w-7 text-[#D4AF37]/40 mx-auto" />
                        <div className="text-xs font-semibold text-[#F4F1EA]">
                          {!calcOngkirOrigin || !calcOngkirDestination
                            ? 'Silakan Tentukan Kota Asal & Kota Tujuan'
                            : 'Tidak ada service yang terdaftar untuk rute ini'}
                        </div>
                        <p className="text-[11px] text-[#8FA599] max-w-sm mx-auto">
                          {!calcOngkirOrigin || !calcOngkirDestination
                            ? 'Pilih rute pengiriman dan isi dimensi box satuan pada panel input gold di sebelah kiri.'
                            : 'Silakan tambahkan data tarif baru pada menu Modal Ongkir untuk rute ini.'}
                        </p>
                        {calcOngkirOrigin && calcOngkirDestination && (
                          <button
                            onClick={() => handleSelectMenu('modal-ongkir')}
                            className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-[#D4AF37] px-3.5 py-1.5 text-xs font-semibold text-[#07140F] hover:bg-[#E5C158] transition-colors cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                            <span>Tambah Tarif di Modal Ongkir</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {matchingShippingServices.map((opt, idx) => {
                          const isSelected =
                            activeSelectedServiceOption?.service.id === opt.service.id;
                          const isCheapest = idx === 0;

                          return (
                            <div
                              key={opt.service.id}
                              onClick={() => setSelectedShippingServiceId(opt.service.id)}
                              className={`rounded-xl border p-3.5 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                                isSelected
                                  ? 'border-[#D4AF37] bg-[#122D22] shadow-md ring-1 ring-[#D4AF37]/40'
                                  : 'border-[#D4AF37]/20 bg-[#081610] hover:border-[#D4AF37]/50 hover:bg-[#10291E]'
                              }`}
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-xs sm:text-sm text-[#F4F1EA]">
                                    {opt.service.service}
                                  </span>

                                  {isCheapest && (
                                    <span className="inline-flex items-center gap-1 rounded bg-[#D4AF37] px-2 py-0.5 text-[9.5px] font-bold text-[#07140F] uppercase tracking-wide">
                                      <Award className="h-3 w-3" />
                                      Rekomendasi Termurah
                                    </span>
                                  )}

                                  <span className="rounded border border-[#D4AF37]/25 bg-[#081610] px-2 py-0.5 text-[10px] text-[#A7BBB0]">
                                    {opt.service.estimasiTiba}
                                  </span>

                                  {opt.service.service.toLowerCase().includes('paxel big') && (
                                    <span className="rounded border border-amber-500/35 bg-amber-950/50 px-2 py-0.5 text-[9.5px] font-semibold text-amber-300">
                                      Maks {formatRupiah(opt.service.maximumHarga || 0)} / koli
                                    </span>
                                  )}
                                </div>

                                <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#8FA599]">
                                  <span>
                                    Tarif: <strong className="text-[#F4F1EA]">{formatRupiah(opt.service.hargaPerKg)}/kg</strong>
                                  </span>
                                  <span>•</span>
                                  <span>
                                    Min: <strong className="text-[#F4F1EA]">{formatRupiah(opt.service.minimumHarga)}</strong>
                                  </span>
                                  <span>•</span>
                                  <span>
                                    Max (Batas 25kg): <strong className="text-[#F3D77D]">{formatRupiah(opt.service.maximumHarga || 0)}</strong>
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#D4AF37]/10">
                                <div className="text-left sm:text-right">
                                  <div className="text-[10px] text-[#8FA599]">
                                    {formatRupiah(opt.biayaPerKoli)} x {packingResult.totalKoli} koli
                                  </div>
                                  <div className="font-mono-tabular text-sm sm:text-base font-bold text-emerald-400">
                                    {formatRupiah(opt.totalOngkir)}
                                  </div>
                                </div>

                                <div
                                  className={`flex h-6 w-6 items-center justify-center rounded-full border transition-colors ${
                                    isSelected
                                      ? 'border-[#D4AF37] bg-[#D4AF37] text-[#07140F]'
                                      : 'border-[#D4AF37]/40 bg-transparent text-transparent'
                                  }`}
                                >
                                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </section>
                </div>
              </div>
            </div>
          ) : (
            /* Centered Maintenance State for all other menus */
            <section className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-[#D4AF37]/25 bg-[#0C2017] p-6 text-center shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#D4AF37]/35 bg-[#122D22] text-[#D4AF37] shadow-inner mb-4">
                <Construction className="h-6 w-6" />
              </div>

              <h1 className="font-display text-lg sm:text-xl font-bold tracking-wide text-[#E5C158] uppercase">
                MAINTENANCE
              </h1>

              <p className="mt-1.5 text-xs sm:text-sm font-medium text-[#F4F1EA]">
                Modul <span className="text-[#E5C158]">{currentMenuObj.label}</span> sedang dalam pemeliharaan
              </p>

              <p className="mt-1 max-w-md text-[11px] sm:text-xs text-[#8FA599] leading-relaxed">
                Data pada menu ini sengaja dikosongkan sementara. Silakan buka grup Kalkulator (Hardbox, Hitung Ongkir) atau grup Modal Kalkulator (Data Bahan, Data Proses, Biaya Finishing, Rumus Model, Modal Ongkir).
              </p>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
                <button
                  onClick={() => handleSelectMenu('kalkulator-box')}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#D4AF37] px-4 py-2 text-xs font-semibold text-[#07140F] hover:bg-[#E5C158] transition-colors cursor-pointer shadow-sm"
                >
                  <Box className="h-3.5 w-3.5" />
                  <span>Buka Kalkulator Hardbox</span>
                </button>
                <button
                  onClick={() => handleSelectMenu('hitung-ongkir')}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4AF37]/35 bg-[#122D22] px-4 py-2 text-xs font-semibold text-[#F3D77D] hover:bg-[#193B2D] transition-colors cursor-pointer"
                >
                  <Truck className="h-3.5 w-3.5 text-[#D4AF37]" />
                  <span>Buka Hitung Ongkir</span>
                </button>
                <button
                  onClick={() => handleSelectMenu('modal-ongkir')}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4AF37]/35 bg-[#122D22] px-4 py-2 text-xs font-semibold text-[#F3D77D] hover:bg-[#193B2D] transition-colors cursor-pointer"
                >
                  <Truck className="h-3.5 w-3.5 text-[#D4AF37]" />
                  <span>Buka Modal Ongkir</span>
                </button>
                <button
                  onClick={() => handleSelectMenu('data-proses')}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4AF37]/35 bg-[#122D22] px-4 py-2 text-xs font-semibold text-[#F3D77D] hover:bg-[#193B2D] transition-colors cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5 text-[#D4AF37]" />
                  <span>Buka Data Proses</span>
                </button>
              </div>
            </section>
          )}
        </main>
      </div>

      {/* Modal Tambah / Ubah Ketentuan Logika (Logika Model, Logika Mesin, Logika Harga) */}
      {isLogicModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4"
          onClick={() => setIsLogicModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-[#D4AF37]/35 bg-[#0C2017] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#D4AF37]/15 pb-4">
              <div className="flex items-center gap-2.5">
                <Lightbulb className="h-5 w-5 text-[#D4AF37]" />
                <h2 className="text-base sm:text-lg font-bold text-[#E5C158]">
                  {editingLogicId
                    ? `Ubah ${currentLogicTabObj.label}`
                    : `Tambah ${currentLogicTabObj.label}`}
                </h2>
              </div>
              <button
                onClick={() => setIsLogicModalOpen(false)}
                className="rounded-lg p-1.5 text-[#8FA599] hover:bg-[#122D22] hover:text-[#F4F1EA] transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveLogicItem} className="mt-5 space-y-4">
              {logicFormError && (
                <div className="rounded-lg border border-[#F43F5E]/40 bg-[#2A1216] px-3.5 py-2.5 text-xs text-[#FDA4AF]">
                  {logicFormError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#B8C7BE] mb-1.5">
                  Nama Parameter / {currentLogicTabObj.label}
                </label>
                <input
                  type="text"
                  value={lNamaAturan}
                  onChange={(e) => setLNamaAturan(e.target.value)}
                  placeholder={`Contoh: ${
                    activeLogicTab === 'logika-model'
                      ? 'Batas Sambungan Board'
                      : activeLogicTab === 'logika-mesin'
                      ? 'Otomatisasi Pilih Digital vs Offset'
                      : activeLogicTab === 'logika-proses'
                      ? 'Kondisi Laminasi Aktif'
                      : 'Margin Harga Jual Standar'
                  }`}
                  className="w-full rounded-lg border border-[#D4AF37]/25 bg-[#081610] px-3.5 py-2.5 text-sm text-[#F4F1EA] placeholder-[#5E7468] focus:border-[#D4AF37] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#B8C7BE] mb-1.5">
                  Kondisi / Syarat Trigger
                </label>
                <input
                  type="text"
                  value={lKondisiTrigger}
                  onChange={(e) => setLKondisiTrigger(e.target.value)}
                  placeholder="Contoh: Jika Qty < 100 pcs atau Ukuran Bentangan > Plano"
                  className="w-full rounded-lg border border-[#D4AF37]/25 bg-[#081610] px-3.5 py-2.5 font-mono-tabular text-sm text-[#F4F1EA] placeholder-[#5E7468] focus:border-[#D4AF37] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#B8C7BE] mb-1.5">
                  Rumus / Keputusan Logika (Harga Modal / Jual)
                </label>
                <input
                  type="text"
                  value={lRumusTindakan}
                  onChange={(e) => setLRumusTindakan(e.target.value)}
                  placeholder="Contoh: Harga Jual = Total Modal x 1.35"
                  className="w-full rounded-lg border border-[#D4AF37]/25 bg-[#081610] px-3.5 py-2.5 font-mono-tabular text-sm text-[#F4F1EA] placeholder-[#5E7468] focus:border-[#D4AF37] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#B8C7BE] mb-1.5">
                  Keterangan
                </label>
                <input
                  type="text"
                  value={lKeterangan}
                  onChange={(e) => setLKeterangan(e.target.value)}
                  placeholder="Contoh: Tinggi tutup otomatis untuk model Buka Tutup dengan tinggi box di bawah 5 cm"
                  className="w-full rounded-lg border border-[#D4AF37]/25 bg-[#081610] px-3.5 py-2.5 text-sm text-[#F4F1EA] placeholder-[#5E7468] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#B8C7BE] mb-1.5">
                  Aksi (Output / Set Variabel)
                </label>
                <input
                  type="text"
                  value={lAksi}
                  onChange={(e) => setLAksi(e.target.value)}
                  placeholder="Contoh: Set Tt = 2 cm"
                  className="w-full rounded-lg border border-[#D4AF37]/25 bg-[#081610] px-3.5 py-2.5 font-mono-tabular text-sm text-[#F4F1EA] placeholder-[#5E7468] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#D4AF37]/15">
                <button
                  type="button"
                  onClick={() => setIsLogicModalOpen(false)}
                  className="rounded-lg border border-[#D4AF37]/25 bg-[#081610] px-4 py-2 text-xs font-semibold text-[#B8C7BE] hover:bg-[#122D22] transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#D4AF37] px-5 py-2 text-xs font-semibold text-[#07140F] hover:bg-[#E5C158] transition-colors cursor-pointer"
                >
                  Simpan Logika
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah / Ubah Data Bahan (Bahan Dasar, Kertas Std, Kertas Premium) */}
      {isMaterialModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4"
          onClick={() => setIsMaterialModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-[#D4AF37]/35 bg-[#0C2017] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#D4AF37]/15 pb-4">
              <div className="flex items-center gap-2.5">
                <Database className="h-5 w-5 text-[#D4AF37]" />
                <h2 className="text-base sm:text-lg font-bold text-[#E5C158]">
                  {editingMaterialId
                    ? `Ubah Data ${currentMaterialTabObj.label}`
                    : `Tambah Data ${currentMaterialTabObj.label}`}
                </h2>
              </div>
              <button
                onClick={() => setIsMaterialModalOpen(false)}
                className="rounded-lg p-1.5 text-[#8FA599] hover:bg-[#122D22] hover:text-[#F4F1EA] transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMaterialItem} className="mt-5 space-y-4">
              {materialFormError && (
                <div className="rounded-lg border border-[#F43F5E]/40 bg-[#2A1216] px-3.5 py-2.5 text-xs text-[#FDA4AF]">
                  {materialFormError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#B8C7BE] mb-1.5">
                  Nama {currentMaterialTabObj.label}
                </label>
                <input
                  type="text"
                  value={mNamaBahan}
                  onChange={(e) => setMNamaBahan(e.target.value)}
                  placeholder={`Contoh: ${
                    activeMaterialTab === 'bahan-dasar'
                      ? 'Yellow Board No. 30'
                      : activeMaterialTab === 'kertas-std'
                      ? 'Art Paper 150 gsm'
                      : 'Fancy Jasmine Gold'
                  }`}
                  className="w-full rounded-lg border border-[#D4AF37]/25 bg-[#081610] px-3.5 py-2.5 text-sm text-[#F4F1EA] placeholder-[#5E7468] focus:border-[#D4AF37] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#B8C7BE] mb-1.5">
                  Ukuran
                </label>
                <input
                  type="text"
                  value={mUkuranPlano}
                  onChange={(e) => setMUkuranPlano(e.target.value)}
                  placeholder="Contoh: 74 x 64 atau 109 x 79"
                  className="w-full rounded-lg border border-[#D4AF37]/25 bg-[#081610] px-3.5 py-2.5 font-mono-tabular text-sm text-[#F4F1EA] placeholder-[#5E7468] focus:border-[#D4AF37] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#B8C7BE] mb-1.5">
                  Harga
                </label>
                <input
                  type="text"
                  value={mHargaLembar}
                  onChange={(e) => setMHargaLembar(e.target.value)}
                  placeholder="Contoh: Rp 7.900"
                  className="w-full rounded-lg border border-[#D4AF37]/25 bg-[#081610] px-3.5 py-2.5 font-mono-tabular text-sm text-[#F4F1EA] placeholder-[#5E7468] focus:border-[#D4AF37] focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#D4AF37]/15">
                <button
                  type="button"
                  onClick={() => setIsMaterialModalOpen(false)}
                  className="rounded-lg border border-[#D4AF37]/25 bg-[#081610] px-4 py-2 text-xs font-semibold text-[#B8C7BE] hover:bg-[#122D22] transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#D4AF37] px-5 py-2 text-xs font-semibold text-[#07140F] hover:bg-[#E5C158] transition-colors cursor-pointer"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah / Ubah Data Proses (Digital, Offset, Laminasi, Logo) */}
      {isProcessModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4"
          onClick={() => setIsProcessModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-[#D4AF37]/35 bg-[#0C2017] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#D4AF37]/15 pb-4">
              <div className="flex items-center gap-2.5">
                <Printer className="h-5 w-5 text-[#D4AF37]" />
                <h2 className="text-base sm:text-lg font-bold text-[#E5C158]">
                  {processModalConfig.title}
                </h2>
              </div>
              <button
                onClick={() => setIsProcessModalOpen(false)}
                className="rounded-lg p-1.5 text-[#8FA599] hover:bg-[#122D22] hover:text-[#F4F1EA] transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProcessItem} className="mt-5 space-y-4">
              {processFormError && (
                <div className="rounded-lg border border-[#F43F5E]/40 bg-[#2A1216] px-3.5 py-2.5 text-xs text-[#FDA4AF]">
                  {processFormError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#B8C7BE] mb-1.5">
                  {processModalConfig.label1}
                </label>
                <input
                  type="text"
                  value={pField1}
                  onChange={(e) => setPField1(e.target.value)}
                  placeholder={processModalConfig.placeholder1}
                  className="w-full rounded-lg border border-[#D4AF37]/25 bg-[#081610] px-3.5 py-2.5 text-sm text-[#F4F1EA] placeholder-[#5E7468] focus:border-[#D4AF37] focus:outline-none"
                  required
                />
              </div>

              {activeProcessTab === 'laminasi' && (
                <div>
                  <label className="block text-xs font-semibold text-[#B8C7BE] mb-1.5">
                    Type (Digital / Offset)
                  </label>
                  <select
                    value={pLaminasiType}
                    onChange={(e) =>
                      setPLaminasiType(e.target.value as 'Digital' | 'Offset')
                    }
                    className="w-full rounded-lg border border-[#D4AF37]/25 bg-[#081610] px-3.5 py-2.5 text-sm text-[#F4F1EA] focus:border-[#D4AF37] focus:outline-none"
                  >
                    <option value="Digital">Digital</option>
                    <option value="Offset">Offset</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#B8C7BE] mb-1.5">
                  {processModalConfig.label2}
                </label>
                <input
                  type="text"
                  value={pField2}
                  onChange={(e) => setPField2(e.target.value)}
                  placeholder={processModalConfig.placeholder2}
                  className="w-full rounded-lg border border-[#D4AF37]/25 bg-[#081610] px-3.5 py-2.5 font-mono-tabular text-sm text-[#F4F1EA] placeholder-[#5E7468] focus:border-[#D4AF37] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#B8C7BE] mb-1.5">
                  {processModalConfig.label3}
                </label>
                <input
                  type="text"
                  value={pField3}
                  onChange={(e) => setPField3(e.target.value)}
                  placeholder={processModalConfig.placeholder3}
                  className="w-full rounded-lg border border-[#D4AF37]/25 bg-[#081610] px-3.5 py-2.5 font-mono-tabular text-sm text-[#F4F1EA] placeholder-[#5E7468] focus:border-[#D4AF37] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#B8C7BE] mb-1.5">
                  {processModalConfig.label4}
                </label>
                <input
                  type="text"
                  value={pField4}
                  onChange={(e) => setPField4(e.target.value)}
                  placeholder={processModalConfig.placeholder4}
                  className="w-full rounded-lg border border-[#D4AF37]/25 bg-[#081610] px-3.5 py-2.5 text-sm text-[#F4F1EA] placeholder-[#5E7468] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              {(activeProcessTab === 'laminasi' || activeProcessTab === 'logo') &&
                'label5' in processModalConfig && (
                  <div>
                    <label className="block text-xs font-semibold text-[#B8C7BE] mb-1.5">
                      {processModalConfig.label5}
                    </label>
                    <input
                      type="text"
                      value={pField5}
                      onChange={(e) => setPField5(e.target.value)}
                      placeholder={processModalConfig.placeholder5}
                      className="w-full rounded-lg border border-[#D4AF37]/25 bg-[#081610] px-3.5 py-2.5 font-mono-tabular text-sm text-[#F4F1EA] placeholder-[#5E7468] focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                )}

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#D4AF37]/15">
                <button
                  type="button"
                  onClick={() => setIsProcessModalOpen(false)}
                  className="rounded-lg border border-[#D4AF37]/25 bg-[#081610] px-4 py-2 text-xs font-semibold text-[#B8C7BE] hover:bg-[#122D22] transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#D4AF37] px-5 py-2 text-xs font-semibold text-[#07140F] hover:bg-[#E5C158] transition-colors cursor-pointer"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah / Ubah Biaya Finishing */}
      {isFinishingModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4"
          onClick={() => setIsFinishingModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-[#D4AF37]/35 bg-[#0C2017] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#D4AF37]/15 pb-4">
              <div className="flex items-center gap-2.5">
                <Box className="h-5 w-5 text-[#D4AF37]" />
                <h2 className="text-base sm:text-lg font-bold text-[#E5C158]">
                  {editingFinishing
                    ? 'Ubah Biaya Finishing Jasa Rakit'
                    : 'Tambah Biaya Finishing Baru'}
                </h2>
              </div>
              <button
                onClick={() => setIsFinishingModalOpen(false)}
                className="rounded-lg p-1.5 text-[#8FA599] hover:bg-[#122D22] hover:text-[#F4F1EA] transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFinishing} className="mt-5 space-y-4">
              {finishingFormError && (
                <div className="rounded-lg border border-[#F43F5E]/40 bg-[#2A1216] px-3.5 py-2.5 text-xs text-[#FDA4AF]">
                  {finishingFormError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#B8C7BE] mb-1.5">
                  Model Box
                </label>
                <input
                  type="text"
                  value={formModelBox}
                  onChange={(e) => setFormModelBox(e.target.value)}
                  placeholder="Contoh: Box Buka Tutup (Terpisah)"
                  className="w-full rounded-lg border border-[#D4AF37]/25 bg-[#081610] px-3.5 py-2.5 text-sm text-[#F4F1EA] placeholder-[#5E7468] focus:border-[#D4AF37] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#B8C7BE] mb-1.5">
                    Harga Jasa Minimum (Rp)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={500}
                    value={formMinPrice}
                    onChange={(e) => setFormMinPrice(e.target.value)}
                    className="w-full rounded-lg border border-[#D4AF37]/25 bg-[#081610] px-3.5 py-2.5 font-mono-tabular text-sm text-[#F4F1EA] focus:border-[#D4AF37] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#B8C7BE] mb-1.5">
                    Harga Jasa Maksimum (Rp)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={500}
                    value={formMaxPrice}
                    onChange={(e) => setFormMaxPrice(e.target.value)}
                    className="w-full rounded-lg border border-[#D4AF37]/25 bg-[#081610] px-3.5 py-2.5 font-mono-tabular text-sm text-[#F4F1EA] focus:border-[#D4AF37] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#B8C7BE] mb-1.5">
                  Instruksi Khusus
                </label>
                <textarea
                  rows={3}
                  value={formInstructions}
                  onChange={(e) => setFormInstructions(e.target.value)}
                  placeholder="Masukkan catatan atau instruksi perhitungan..."
                  className="w-full rounded-lg border border-[#D4AF37]/25 bg-[#081610] px-3.5 py-2.5 text-sm text-[#F4F1EA] placeholder-[#5E7468] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#D4AF37]/15">
                <button
                  type="button"
                  onClick={() => setIsFinishingModalOpen(false)}
                  className="rounded-lg border border-[#D4AF37]/25 bg-[#081610] px-4 py-2 text-xs font-semibold text-[#B8C7BE] hover:bg-[#122D22] transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#D4AF37] px-5 py-2 text-xs font-semibold text-[#07140F] hover:bg-[#E5C158] transition-colors cursor-pointer"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah / Ubah Rumus Model */}
      {isFormulaModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto"
          onClick={() => setIsFormulaModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl border border-[#D4AF37]/35 bg-[#0C2017] p-6 shadow-2xl my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#D4AF37]/15 pb-4">
              <div className="flex items-center gap-2.5">
                <BookOpen className="h-5 w-5 text-[#D4AF37]" />
                <h2 className="text-base sm:text-lg font-bold text-[#E5C158]">
                  {editingFormula
                    ? 'Ubah Rumus Model Box'
                    : 'Tambah Rumus Model Baru'}
                </h2>
              </div>
              <button
                onClick={() => setIsFormulaModalOpen(false)}
                className="rounded-lg p-1.5 text-[#8FA599] hover:bg-[#122D22] hover:text-[#F4F1EA] transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFormula} className="mt-5 space-y-4">
              {formulaFormError && (
                <div className="rounded-lg border border-[#F43F5E]/40 bg-[#2A1216] px-3.5 py-2.5 text-xs text-[#FDA4AF]">
                  {formulaFormError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#B8C7BE] mb-1.5">
                  Model Box
                </label>
                <input
                  type="text"
                  value={fModelBox}
                  onChange={(e) => setFModelBox(e.target.value)}
                  placeholder="Contoh: Box Buka Tutup (Terpisah)"
                  className="w-full rounded-lg border border-[#D4AF37]/25 bg-[#081610] px-3.5 py-2 text-sm text-[#F4F1EA] placeholder-[#5E7468] focus:border-[#D4AF37] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#B8C7BE] mb-1.5">
                    Board Body
                  </label>
                  <textarea
                    rows={2}
                    value={fBoardBody}
                    onChange={(e) => setFBoardBody(e.target.value)}
                    className="w-full rounded-lg border border-[#D4AF37]/25 bg-[#081610] px-3 py-2 font-mono-tabular text-xs text-[#F4F1EA] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#B8C7BE] mb-1.5">
                    Board Tutup
                  </label>
                  <textarea
                    rows={2}
                    value={fBoardTutup}
                    onChange={(e) => setFBoardTutup(e.target.value)}
                    className="w-full rounded-lg border border-[#D4AF37]/25 bg-[#081610] px-3 py-2 font-mono-tabular text-xs text-[#F4F1EA] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#B8C7BE] mb-1.5">
                    Lapisan Dalam Body
                  </label>
                  <textarea
                    rows={2}
                    value={fLapisanDalamBody}
                    onChange={(e) => setFLapisanDalamBody(e.target.value)}
                    className="w-full rounded-lg border border-[#D4AF37]/25 bg-[#081610] px-3 py-2 font-mono-tabular text-xs text-[#F4F1EA] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#B8C7BE] mb-1.5">
                    Lapisan Dalam Tutup
                  </label>
                  <textarea
                    rows={2}
                    value={fLapisanDalamTutup}
                    onChange={(e) => setFLapisanDalamTutup(e.target.value)}
                    className="w-full rounded-lg border border-[#D4AF37]/25 bg-[#081610] px-3 py-2 font-mono-tabular text-xs text-[#F4F1EA] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#B8C7BE] mb-1.5">
                    Lapisan Luar Body
                  </label>
                  <textarea
                    rows={2}
                    value={fLapisanLuarBody}
                    onChange={(e) => setFLapisanLuarBody(e.target.value)}
                    className="w-full rounded-lg border border-[#D4AF37]/25 bg-[#081610] px-3 py-2 font-mono-tabular text-xs text-[#F4F1EA] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#B8C7BE] mb-1.5">
                    Lapisan Luar Tutup
                  </label>
                  <textarea
                    rows={2}
                    value={fLapisanLuarTutup}
                    onChange={(e) => setFLapisanLuarTutup(e.target.value)}
                    className="w-full rounded-lg border border-[#D4AF37]/25 bg-[#081610] px-3 py-2 font-mono-tabular text-xs text-[#F4F1EA] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#B8C7BE] mb-1.5">
                    Pisau Body
                  </label>
                  <textarea
                    rows={2}
                    value={fPisauBody}
                    onChange={(e) => setFPisauBody(e.target.value)}
                    className="w-full rounded-lg border border-[#D4AF37]/25 bg-[#081610] px-3 py-2 font-mono-tabular text-xs text-[#F4F1EA] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#B8C7BE] mb-1.5">
                    Pisau Tutup
                  </label>
                  <textarea
                    rows={2}
                    value={fPisauTutup}
                    onChange={(e) => setFPisauTutup(e.target.value)}
                    className="w-full rounded-lg border border-[#D4AF37]/25 bg-[#081610] px-3 py-2 font-mono-tabular text-xs text-[#F4F1EA] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#D4AF37]/15">
                <button
                  type="button"
                  onClick={() => setIsFormulaModalOpen(false)}
                  className="rounded-lg border border-[#D4AF37]/25 bg-[#081610] px-4 py-2 text-xs font-semibold text-[#B8C7BE] hover:bg-[#122D22] transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#D4AF37] px-5 py-2 text-xs font-semibold text-[#07140F] hover:bg-[#E5C158] transition-colors cursor-pointer"
                >
                  Simpan Rumus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah / Ubah Modal Ongkir */}
      {isOngkirModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4"
          onClick={() => setIsOngkirModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-[#D4AF37]/35 bg-[#0C2017] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#D4AF37]/15 pb-4">
              <div className="flex items-center gap-2.5">
                <Truck className="h-5 w-5 text-[#D4AF37]" />
                <h2 className="text-base sm:text-lg font-bold text-[#E5C158]">
                  {editingOngkir ? 'Ubah Modal Ongkir' : 'Tambah Modal Ongkir'}
                </h2>
              </div>
              <button
                onClick={() => setIsOngkirModalOpen(false)}
                className="rounded-lg p-1.5 text-[#8FA599] hover:bg-[#122D22] hover:text-[#F4F1EA] transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveOngkir} className="mt-5 space-y-4">
              {ongkirFormError && (
                <div className="rounded-lg border border-[#F43F5E]/40 bg-[#2A1216] px-3.5 py-2.5 text-xs text-[#FDA4AF]">
                  {ongkirFormError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#B8C7BE] mb-1.5">
                  Service Kurir
                </label>
                <input
                  type="text"
                  value={formService}
                  onChange={(e) => setFormService(e.target.value)}
                  placeholder="Contoh: Paxel Big, JNE Trucking, SiCepat Cargo"
                  className="w-full rounded-lg border border-[#D4AF37]/25 bg-[#081610] px-3.5 py-2.5 text-sm text-[#F4F1EA] placeholder-[#5E7468] focus:border-[#D4AF37] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#B8C7BE] mb-1.5">
                    Kota Asal
                  </label>
                  <input
                    type="text"
                    value={formKotaAsal}
                    onChange={(e) => setFormKotaAsal(e.target.value)}
                    placeholder="Contoh: Bandung"
                    className="w-full rounded-lg border border-[#D4AF37]/25 bg-[#081610] px-3.5 py-2.5 text-sm text-[#F4F1EA] placeholder-[#5E7468] focus:border-[#D4AF37] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#B8C7BE] mb-1.5">
                    Kota Tujuan
                  </label>
                  <input
                    type="text"
                    value={formKotaTujuan}
                    onChange={(e) => setFormKotaTujuan(e.target.value)}
                    placeholder="Contoh: Tangerang"
                    className="w-full rounded-lg border border-[#D4AF37]/25 bg-[#081610] px-3.5 py-2.5 text-sm text-[#F4F1EA] placeholder-[#5E7468] focus:border-[#D4AF37] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#B8C7BE] mb-1.5">
                  Estimasi Tiba
                </label>
                <input
                  type="text"
                  value={formEstimasiTiba}
                  onChange={(e) => setFormEstimasiTiba(e.target.value)}
                  placeholder="Contoh: 1 - 2 Hari"
                  className="w-full rounded-lg border border-[#D4AF37]/25 bg-[#081610] px-3.5 py-2.5 text-sm text-[#F4F1EA] placeholder-[#5E7468] focus:border-[#D4AF37] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#B8C7BE] mb-1.5">
                    Harga Perkg (Rp)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={formHargaPerKg}
                    onChange={(e) => setFormHargaPerKg(e.target.value)}
                    placeholder="Contoh: 2000"
                    className="w-full rounded-lg border border-[#D4AF37]/25 bg-[#081610] px-3.5 py-2.5 font-mono-tabular text-sm text-[#F4F1EA] focus:border-[#D4AF37] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#B8C7BE] mb-1.5">
                    Minimum Harga (Rp)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={500}
                    value={formMinimumHarga}
                    onChange={(e) => setFormMinimumHarga(e.target.value)}
                    placeholder="Contoh: 60000"
                    className="w-full rounded-lg border border-[#D4AF37]/25 bg-[#081610] px-3.5 py-2.5 font-mono-tabular text-sm text-[#F4F1EA] focus:border-[#D4AF37] focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Kalkulasi Otomatis: Maximum Harga */}
              <div className="rounded-xl border border-[#D4AF37]/30 bg-[#122D22]/70 p-3.5 flex items-center justify-between shadow-sm">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#E5C158]">
                      Maximum Harga (Otomatis)
                    </span>
                    <span className="rounded bg-[#D4AF37]/15 px-1.5 py-0.5 text-[10px] font-semibold text-[#F3D77D]">
                      Auto
                    </span>
                  </div>
                  <p className="text-[10.5px] text-[#8FA599]">
                    Rumus: <span className="font-mono text-[#D4AF37]">((25 - 10) × Harga perkg) + Minimum harga</span>
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-mono-tabular text-sm sm:text-base font-bold text-[#E5C158]">
                    {formatRupiah(
                      calculateMaxOngkir(
                        Number(formHargaPerKg) || 0,
                        Number(formMinimumHarga) || 0
                      )
                    )}
                  </div>
                  <div className="text-[10px] text-[#8FA599]">Dihitung sistem</div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#D4AF37]/15">
                <button
                  type="button"
                  onClick={() => setIsOngkirModalOpen(false)}
                  className="rounded-lg border border-[#D4AF37]/25 bg-[#081610] px-4 py-2 text-xs font-semibold text-[#B8C7BE] hover:bg-[#122D22] transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#D4AF37] px-5 py-2 text-xs font-semibold text-[#07140F] hover:bg-[#E5C158] transition-colors cursor-pointer"
                >
                  Simpan Data Ongkir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <OfflineIndicator />
    </div>
  );
}
