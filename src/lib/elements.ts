export type ElementCategory =
  | "non-metal"
  | "other-metal"
  | "metalloid"
  | "transition-metal"
  | "unknown";

export type ElementDisplayCategory =
  | "other-non-metals"
  | "alkali-metals"
  | "transition-metals"
  | "other-metals"
  | "alkaline-earth-metals"
  | "halogens"
  | "noble-gases"
  | "lanthanides"
  | "actinides"
  | "unknown-chemical-properties";

export type ElementData = {
  atomicNumber: number;
  name: string;
  symbol: string;
  weight: number;
  category: ElementCategory;
  cutoff?: boolean;
  isEstimated?: boolean;
};
export type Compound = {
  id: string;
  name: string;
  selectedSymbols: string[];
  elementCountBySymbol: Record<string, number>;
  quantityInputValue: string;
};

export const elementByAtomicNumber = new Map<number, ElementData>([
  [1, { atomicNumber: 1, name: "Hydrogen", symbol: "H", weight: 1.008, category: "non-metal" }],
  [2, { atomicNumber: 2, name: "Helium", symbol: "He", weight: 4, category: "non-metal" }],
  [3, { atomicNumber: 3, name: "Lithium", symbol: "Li", weight: 6.94, category: "other-metal" }],
  [4, { atomicNumber: 4, name: "Beryllium", symbol: "Be", weight: 9.01, category: "other-metal" }],
  [5, { atomicNumber: 5, name: "Boron", symbol: "B", weight: 10.81, category: "metalloid", cutoff: true }],
  [6, { atomicNumber: 6, name: "Carbon", symbol: "C", weight: 12.01, category: "non-metal" }],
  [7, { atomicNumber: 7, name: "Nitrogen", symbol: "N", weight: 14.01, category: "non-metal" }],
  [8, { atomicNumber: 8, name: "Oxygen", symbol: "O", weight: 16, category: "non-metal" }],
  [9, { atomicNumber: 9, name: "Fluorine", symbol: "F", weight: 19, category: "non-metal" }],
  [10, { atomicNumber: 10, name: "Neon", symbol: "Ne", weight: 20.18, category: "non-metal" }],
  [11, { atomicNumber: 11, name: "Sodium", symbol: "Na", weight: 22.99, category: "other-metal" }],
  [12, { atomicNumber: 12, name: "Magnesium", symbol: "Mg", weight: 24.31, category: "other-metal" }],
  [13, { atomicNumber: 13, name: "Aluminum", symbol: "Al", weight: 26.98, category: "other-metal" }],
  [14, { atomicNumber: 14, name: "Silicon", symbol: "Si", weight: 28.09, category: "metalloid", cutoff: true }],
  [15, { atomicNumber: 15, name: "Phosphorus", symbol: "P", weight: 30.97, category: "non-metal" }],
  [16, { atomicNumber: 16, name: "Sulfur", symbol: "S", weight: 32.06, category: "non-metal" }],
  [17, { atomicNumber: 17, name: "Chlorine", symbol: "Cl", weight: 35.45, category: "non-metal" }],
  [18, { atomicNumber: 18, name: "Argon", symbol: "Ar", weight: 39.95, category: "non-metal" }],
  [19, { atomicNumber: 19, name: "Potassium", symbol: "K", weight: 39.1, category: "other-metal" }],
  [20, { atomicNumber: 20, name: "Calcium", symbol: "Ca", weight: 40.08, category: "other-metal" }],
  [21, { atomicNumber: 21, name: "Scandium", symbol: "Sc", weight: 44.96, category: "transition-metal" }],
  [22, { atomicNumber: 22, name: "Titanium", symbol: "Ti", weight: 47.87, category: "transition-metal" }],
  [23, { atomicNumber: 23, name: "Vanadium", symbol: "V", weight: 50.94, category: "transition-metal" }],
  [24, { atomicNumber: 24, name: "Chromium", symbol: "Cr", weight: 52, category: "transition-metal" }],
  [25, { atomicNumber: 25, name: "Manganese", symbol: "Mn", weight: 54.94, category: "transition-metal" }],
  [26, { atomicNumber: 26, name: "Iron", symbol: "Fe", weight: 55.85, category: "transition-metal" }],
  [27, { atomicNumber: 27, name: "Cobalt", symbol: "Co", weight: 58.93, category: "transition-metal" }],
  [28, { atomicNumber: 28, name: "Nickel", symbol: "Ni", weight: 58.69, category: "transition-metal" }],
  [29, { atomicNumber: 29, name: "Copper", symbol: "Cu", weight: 63.55, category: "transition-metal" }],
  [30, { atomicNumber: 30, name: "Zinc", symbol: "Zn", weight: 65.38, category: "transition-metal" }],
  [31, { atomicNumber: 31, name: "Gallium", symbol: "Ga", weight: 69.72, category: "other-metal" }],
  [32, { atomicNumber: 32, name: "Germanium", symbol: "Ge", weight: 72.63, category: "metalloid" }],
  [33, { atomicNumber: 33, name: "Arsenic", symbol: "As", weight: 74.92, category: "metalloid", cutoff: true }],
  [34, { atomicNumber: 34, name: "Selenium", symbol: "Se", weight: 78.97, category: "non-metal" }],
  [35, { atomicNumber: 35, name: "Bromine", symbol: "Br", weight: 79.9, category: "non-metal" }],
  [36, { atomicNumber: 36, name: "Krypton", symbol: "Kr", weight: 83.8, category: "non-metal" }],
  [37, { atomicNumber: 37, name: "Rubidium", symbol: "Rb", weight: 85.47, category: "other-metal" }],
  [38, { atomicNumber: 38, name: "Strontium", symbol: "Sr", weight: 87.62, category: "other-metal" }],
  [39, { atomicNumber: 39, name: "Yttrium", symbol: "Y", weight: 88.91, category: "transition-metal" }],
  [40, { atomicNumber: 40, name: "Zirconium", symbol: "Zr", weight: 91.22, category: "transition-metal" }],
  [41, { atomicNumber: 41, name: "Niobium", symbol: "Nb", weight: 92.91, category: "transition-metal" }],
  [42, { atomicNumber: 42, name: "Molybdenum", symbol: "Mo", weight: 95.95, category: "transition-metal" }],
  [43, { atomicNumber: 43, name: "Technetium", symbol: "Tc", weight: 97, category: "transition-metal", isEstimated: true }],
  [44, { atomicNumber: 44, name: "Ruthenium", symbol: "Ru", weight: 101.07, category: "transition-metal" }],
  [45, { atomicNumber: 45, name: "Rhodium", symbol: "Rh", weight: 102.91, category: "transition-metal" }],
  [46, { atomicNumber: 46, name: "Palladium", symbol: "Pd", weight: 106.42, category: "transition-metal" }],
  [47, { atomicNumber: 47, name: "Silver", symbol: "Ag", weight: 107.87, category: "transition-metal" }],
  [48, { atomicNumber: 48, name: "Cadmium", symbol: "Cd", weight: 112.41, category: "transition-metal" }],
  [49, { atomicNumber: 49, name: "Indium", symbol: "In", weight: 114.82, category: "other-metal" }],
  [50, { atomicNumber: 50, name: "Tin", symbol: "Sn", weight: 118.71, category: "other-metal" }],
  [51, { atomicNumber: 51, name: "Antimony", symbol: "Sb", weight: 121.76, category: "metalloid" }],
  [52, { atomicNumber: 52, name: "Tellurium", symbol: "Te", weight: 127.6, category: "metalloid", cutoff: true }],
  [53, { atomicNumber: 53, name: "Iodine", symbol: "I", weight: 126.9, category: "non-metal" }],
  [54, { atomicNumber: 54, name: "Xenon", symbol: "Xe", weight: 131.29, category: "non-metal" }],
  [55, { atomicNumber: 55, name: "Cesium", symbol: "Cs", weight: 132.91, category: "other-metal" }],
  [56, { atomicNumber: 56, name: "Barium", symbol: "Ba", weight: 137.33, category: "other-metal" }],
  [57, { atomicNumber: 57, name: "Lanthanum", symbol: "La", weight: 138.91, category: "transition-metal" }],
  [58, { atomicNumber: 58, name: "Cerium", symbol: "Ce", weight: 140.12, category: "transition-metal" }],
  [59, { atomicNumber: 59, name: "Praseodymium", symbol: "Pr", weight: 140.91, category: "transition-metal" }],
  [60, { atomicNumber: 60, name: "Neodymium", symbol: "Nd", weight: 144.24, category: "transition-metal" }],
  [61, { atomicNumber: 61, name: "Promethium", symbol: "Pm", weight: 145, category: "transition-metal", isEstimated: true }],
  [62, { atomicNumber: 62, name: "Samarium", symbol: "Sm", weight: 150.36, category: "transition-metal" }],
  [63, { atomicNumber: 63, name: "Europium", symbol: "Eu", weight: 151.96, category: "transition-metal" }],
  [64, { atomicNumber: 64, name: "Gadolinium", symbol: "Gd", weight: 157.25, category: "transition-metal" }],
  [65, { atomicNumber: 65, name: "Terbium", symbol: "Tb", weight: 158.93, category: "transition-metal" }],
  [66, { atomicNumber: 66, name: "Dysprosium", symbol: "Dy", weight: 162.5, category: "transition-metal" }],
  [67, { atomicNumber: 67, name: "Holmium", symbol: "Ho", weight: 164.93, category: "transition-metal" }],
  [68, { atomicNumber: 68, name: "Erbium", symbol: "Er", weight: 167.26, category: "transition-metal" }],
  [69, { atomicNumber: 69, name: "Thulium", symbol: "Tm", weight: 168.93, category: "transition-metal" }],
  [70, { atomicNumber: 70, name: "Ytterbium", symbol: "Yb", weight: 173.05, category: "transition-metal" }],
  [71, { atomicNumber: 71, name: "Lutetium", symbol: "Lu", weight: 174.97, category: "transition-metal" }],
  [72, { atomicNumber: 72, name: "Hafnium", symbol: "Hf", weight: 178.49, category: "transition-metal" }],
  [73, { atomicNumber: 73, name: "Tantalum", symbol: "Ta", weight: 180.95, category: "transition-metal" }],
  [74, { atomicNumber: 74, name: "Tungsten", symbol: "W", weight: 183.84, category: "transition-metal" }],
  [75, { atomicNumber: 75, name: "Rhenium", symbol: "Re", weight: 186.21, category: "transition-metal" }],
  [76, { atomicNumber: 76, name: "Osmium", symbol: "Os", weight: 190.23, category: "transition-metal" }],
  [77, { atomicNumber: 77, name: "Iridium", symbol: "Ir", weight: 192.22, category: "transition-metal" }],
  [78, { atomicNumber: 78, name: "Platinum", symbol: "Pt", weight: 195.08, category: "transition-metal" }],
  [79, { atomicNumber: 79, name: "Gold", symbol: "Au", weight: 196.97, category: "transition-metal" }],
  [80, { atomicNumber: 80, name: "Mercury", symbol: "Hg", weight: 200.59, category: "transition-metal" }],
  [81, { atomicNumber: 81, name: "Thallium", symbol: "Tl", weight: 204.38, category: "other-metal" }],
  [82, { atomicNumber: 82, name: "Lead", symbol: "Pb", weight: 207.2, category: "other-metal" }],
  [83, { atomicNumber: 83, name: "Bismuth", symbol: "Bi", weight: 208.98, category: "other-metal" }],
  [84, { atomicNumber: 84, name: "Polonium", symbol: "Po", weight: 209, category: "other-metal", isEstimated: true }],
  [85, { atomicNumber: 85, name: "Astatine", symbol: "At", weight: 210, category: "non-metal", cutoff: true, isEstimated: true }],
  [86, { atomicNumber: 86, name: "Radon", symbol: "Rn", weight: 222, category: "non-metal", isEstimated: true }],
  [87, { atomicNumber: 87, name: "Francium", symbol: "Fr", weight: 223, category: "other-metal", isEstimated: true }],
  [88, { atomicNumber: 88, name: "Radium", symbol: "Ra", weight: 226, category: "other-metal", isEstimated: true }],
  [89, { atomicNumber: 89, name: "Actinium", symbol: "Ac", weight: 227, category: "transition-metal", isEstimated: true }],
  [90, { atomicNumber: 90, name: "Thorium", symbol: "Th", weight: 232.04, category: "transition-metal" }],
  [91, { atomicNumber: 91, name: "Protactinium", symbol: "Pa", weight: 231.04, category: "transition-metal" }],
  [92, { atomicNumber: 92, name: "Uranium", symbol: "U", weight: 238.03, category: "transition-metal" }],
  [93, { atomicNumber: 93, name: "Neptunium", symbol: "Np", weight: 237, category: "transition-metal", isEstimated: true }],
  [94, { atomicNumber: 94, name: "Plutonium", symbol: "Pu", weight: 244, category: "transition-metal", isEstimated: true }],
  [95, { atomicNumber: 95, name: "Americium", symbol: "Am", weight: 243, category: "transition-metal", isEstimated: true }],
  [96, { atomicNumber: 96, name: "Curium", symbol: "Cm", weight: 247, category: "transition-metal", isEstimated: true }],
  [97, { atomicNumber: 97, name: "Berkelium", symbol: "Bk", weight: 247, category: "transition-metal", isEstimated: true }],
  [98, { atomicNumber: 98, name: "Californium", symbol: "Cf", weight: 251, category: "transition-metal", isEstimated: true }],
  [99, { atomicNumber: 99, name: "Einsteinium", symbol: "Es", weight: 252, category: "transition-metal", isEstimated: true }],
  [100, { atomicNumber: 100, name: "Fermium", symbol: "Fm", weight: 257, category: "transition-metal", isEstimated: true }],
  [101, { atomicNumber: 101, name: "Mendelevium", symbol: "Md", weight: 258, category: "transition-metal", isEstimated: true }],
  [102, { atomicNumber: 102, name: "Nobelium", symbol: "No", weight: 259, category: "transition-metal", isEstimated: true }],
  [103, { atomicNumber: 103, name: "Lawrencium", symbol: "Lr", weight: 266, category: "transition-metal", isEstimated: true }],
  [104, { atomicNumber: 104, name: "Rutherfordium", symbol: "Rf", weight: 267, category: "transition-metal", isEstimated: true }],
  [105, { atomicNumber: 105, name: "Dubnium", symbol: "Db", weight: 268, category: "transition-metal", isEstimated: true }],
  [106, { atomicNumber: 106, name: "Seaborgium", symbol: "Sg", weight: 269, category: "transition-metal", isEstimated: true }],
  [107, { atomicNumber: 107, name: "Bohrium", symbol: "Bh", weight: 270, category: "transition-metal", isEstimated: true }],
  [108, { atomicNumber: 108, name: "Hassium", symbol: "Hs", weight: 269, category: "transition-metal", isEstimated: true }],
  [109, { atomicNumber: 109, name: "Meitnerium", symbol: "Mt", weight: 278, category: "transition-metal", isEstimated: true }],
  [110, { atomicNumber: 110, name: "Darmstadtium", symbol: "Ds", weight: 281, category: "transition-metal", isEstimated: true }],
  [111, { atomicNumber: 111, name: "Roentgenium", symbol: "Rg", weight: 282, category: "transition-metal", isEstimated: true }],
  [112, { atomicNumber: 112, name: "Copernicium", symbol: "Cn", weight: 285, category: "transition-metal", isEstimated: true }],
  [113, { atomicNumber: 113, name: "Nihonium", symbol: "Nh", weight: 286, category: "other-metal", isEstimated: true }],
  [114, { atomicNumber: 114, name: "Flerovium", symbol: "Fl", weight: 289, category: "other-metal", isEstimated: true }],
  [115, { atomicNumber: 115, name: "Moscovium", symbol: "Mc", weight: 290, category: "other-metal", isEstimated: true }],
  [116, { atomicNumber: 116, name: "Livermorium", symbol: "Lv", weight: 293, category: "other-metal", isEstimated: true }],
  [117, { atomicNumber: 117, name: "Tennessine", symbol: "Ts", weight: 294, category: "unknown", isEstimated: true }],
  [118, { atomicNumber: 118, name: "Oganesson", symbol: "Og", weight: 294, category: "unknown", isEstimated: true }]
]);

export const mainTableAtomicNumbers = [
  ...Array.from({ length: 56 }, (_, i) => i + 1),
  ...Array.from({ length: 17 }, (_, i) => i + 72),
  ...Array.from({ length: 15 }, (_, i) => i + 104)
];

export const lanthanideActinideAtomicNumbers = [
  ...Array.from({ length: 15 }, (_, i) => i + 57),
  ...Array.from({ length: 15 }, (_, i) => i + 89)
];

export const getElementsByAtomicNumbers = (atomicNumbers: number[]): ElementData[] =>
  atomicNumbers
    .map((atomicNumber) => elementByAtomicNumber.get(atomicNumber))
    .filter((element): element is ElementData => Boolean(element));


export const getElementBySymbol = (symbol: string): ElementData | undefined =>
  Array.from(elementByAtomicNumber.values()).find((element) => element.symbol === symbol);

const alkaliMetalSymbols = new Set(["Li", "Na", "K", "Rb", "Cs", "Fr"]);
const alkalineEarthMetalSymbols = new Set(["Be", "Mg", "Ca", "Sr", "Ba", "Ra"]);
const halogenSymbols = new Set(["F", "Cl", "Br", "I", "At"]);
const nobleGasSymbols = new Set(["He", "Ne", "Ar", "Kr", "Xe", "Rn"]);
const unknownChemicalPropertySymbols = new Set(["Nh", "Fl", "Mc", "Lv", "Ts", "Og"]);

export const getElementDisplayCategory = (element: ElementData): ElementDisplayCategory => {
  const { symbol, atomicNumber } = element;

  if (unknownChemicalPropertySymbols.has(symbol)) return "unknown-chemical-properties";
  if (halogenSymbols.has(symbol)) return "halogens";
  if (nobleGasSymbols.has(symbol)) return "noble-gases";
  if (alkaliMetalSymbols.has(symbol)) return "alkali-metals";
  if (alkalineEarthMetalSymbols.has(symbol)) return "alkaline-earth-metals";
  if (atomicNumber >= 57 && atomicNumber <= 71) return "lanthanides";
  if (atomicNumber >= 89 && atomicNumber <= 103) return "actinides";

  if (element.category === "transition-metal") return "transition-metals";
  if (element.category === "other-metal") return "other-metals";
  if (element.category === "metalloid") return "other-non-metals";
  if (element.category === "unknown") return "unknown-chemical-properties";
  return "other-non-metals";
};

const electronOrbitalOrder = [
  { label: "1s", capacity: 2 },
  { label: "2s", capacity: 2 },
  { label: "2p", capacity: 6 },
  { label: "3s", capacity: 2 },
  { label: "3p", capacity: 6 },
  { label: "4s", capacity: 2 },
  { label: "3d", capacity: 10 },
  { label: "4p", capacity: 6 },
  { label: "5s", capacity: 2 },
  { label: "4d", capacity: 10 },
  { label: "5p", capacity: 6 },
  { label: "6s", capacity: 2 },
  { label: "4f", capacity: 14 },
  { label: "5d", capacity: 10 },
  { label: "6p", capacity: 6 },
  { label: "7s", capacity: 2 },
  { label: "5f", capacity: 14 },
  { label: "6d", capacity: 10 },
  { label: "7p", capacity: 6 }
] as const;

const electronConfigurationOverrides: Record<number, Partial<Record<(typeof electronOrbitalOrder)[number]["label"], number>>> = {
  24: { "4s": 1, "3d": 5 },
  29: { "4s": 1, "3d": 10 },
  41: { "5s": 1, "4d": 4 },
  42: { "5s": 1, "4d": 5 },
  44: { "5s": 1, "4d": 7 },
  45: { "5s": 1, "4d": 8 },
  46: { "5s": 0, "4d": 10 },
  47: { "5s": 1, "4d": 10 },
  57: { "4f": 0, "5d": 1 },
  58: { "4f": 1, "5d": 1 },
  64: { "4f": 7, "5d": 1 },
  78: { "6s": 1, "5d": 9 },
  79: { "6s": 1, "5d": 10 },
  89: { "5f": 0, "6d": 1 },
  90: { "5f": 0, "6d": 2 },
  91: { "5f": 2, "6d": 1 },
  92: { "5f": 3, "6d": 1 },
  93: { "5f": 4, "6d": 1 },
  96: { "5f": 7, "6d": 1 },
  103: { "6d": 0, "7p": 1 }
};

const nobleGasCores = [
  { atomicNumber: 2, symbol: "He" },
  { atomicNumber: 10, symbol: "Ne" },
  { atomicNumber: 18, symbol: "Ar" },
  { atomicNumber: 36, symbol: "Kr" },
  { atomicNumber: 54, symbol: "Xe" },
  { atomicNumber: 86, symbol: "Rn" }
] as const;

const getElectronOccupancy = (atomicNumber: number): Map<string, number> => {
  if (!Number.isInteger(atomicNumber) || atomicNumber <= 0) return new Map<string, number>();

  const occupancy = new Map<string, number>();
  let remaining = atomicNumber;

  for (const orbital of electronOrbitalOrder) {
    const electrons = Math.max(0, Math.min(orbital.capacity, remaining));
    occupancy.set(orbital.label, electrons);
    remaining -= electrons;
    if (remaining <= 0) break;
  }

  const override = electronConfigurationOverrides[atomicNumber];
  if (override) {
    for (const [label, electrons] of Object.entries(override)) {
      occupancy.set(label, electrons ?? 0);
    }
  }

  return occupancy;
};

export const getElectronConfiguration = (atomicNumber: number): string => {
  const occupancy = getElectronOccupancy(atomicNumber);
  if (!(occupancy instanceof Map)) return "";

  return electronOrbitalOrder
    .map(({ label }) => {
      const electrons = occupancy.get(label) ?? 0;
      return electrons > 0 ? `${label}${electrons}` : null;
    })
    .filter((part): part is string => Boolean(part))
    .join(" ");
};

export const getElectronConfigurationNobleGas = (atomicNumber: number): string => {
  if (!Number.isInteger(atomicNumber) || atomicNumber <= 0) return "";
  if (atomicNumber <= 2) return getElectronConfiguration(atomicNumber);

  const core = [...nobleGasCores].reverse().find((entry) => entry.atomicNumber < atomicNumber);
  if (!core) return getElectronConfiguration(atomicNumber);

  const totalOccupancy = getElectronOccupancy(atomicNumber);
  const coreOccupancy = getElectronOccupancy(core.atomicNumber);

  const remainder = electronOrbitalOrder
    .map(({ label }) => {
      const electrons = (totalOccupancy.get(label) ?? 0) - (coreOccupancy.get(label) ?? 0);
      return electrons > 0 ? `${label}${electrons}` : null;
    })
    .filter((part): part is string => Boolean(part))
    .join(" ");

  return remainder ? `[${core.symbol}] ${remainder}` : `[${core.symbol}]`;
};

export const getValenceElectronCount = (atomicNumber: number): number => {
  if (!Number.isInteger(atomicNumber) || atomicNumber <= 0) return 0;

  const occupancy = getElectronOccupancy(atomicNumber);
  let highestShell = 0;
  for (const [label, electrons] of occupancy.entries()) {
    if (electrons <= 0) continue;
    const shell = Number(label.match(/^([0-9]+)/)?.[1] ?? 0);
    if (shell > highestShell) highestShell = shell;
  }

  if (highestShell <= 0) return 0;
  let valence = 0;
  for (const [label, electrons] of occupancy.entries()) {
    if (electrons <= 0) continue;
    const shell = Number(label.match(/^([0-9]+)/)?.[1] ?? 0);
    if (shell === highestShell) valence += electrons;
  }
  return valence;
};

export const getValenceElectronConfiguration = (atomicNumber: number): string => {
  if (!Number.isInteger(atomicNumber) || atomicNumber <= 0) return "";

  const occupancy = getElectronOccupancy(atomicNumber);
  let highestShell = 0;
  for (const [label, electrons] of occupancy.entries()) {
    if (electrons <= 0) continue;
    const shell = Number(label.match(/^([0-9]+)/)?.[1] ?? 0);
    if (shell > highestShell) highestShell = shell;
  }
  if (highestShell <= 0) return "";

  return electronOrbitalOrder
    .map(({ label }) => {
      const shell = Number(label.match(/^([0-9]+)/)?.[1] ?? 0);
      if (shell !== highestShell) return null;
      const electrons = occupancy.get(label) ?? 0;
      return electrons > 0 ? `${label}${electrons}` : null;
    })
    .filter((part): part is string => Boolean(part))
    .join(" ");
};

const superscriptDigits: Record<string, string> = {
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹"
};

const toSuperscript = (value: string): string =>
  value
    .split("")
    .map((digit) => superscriptDigits[digit] ?? digit)
    .join("");

export const formatElectronConfigurationSuperscript = (configuration: string): string =>
  configuration
    .split(" ")
    .map((token) => {
      const match = token.match(/^([1-9][spdfg])([0-9]+)$/i);
      if (!match) return token;
      return `${match[1]}${toSuperscript(match[2])}`;
    })
    .join(" ");

// export const getTagMolarMass = (symbol: string) => {
//   const element = getElementBySymbol(symbol);
//   if (!element) return 0; // TODO: should this be an error?
//   return element.weight * getCount(symbol);
// };