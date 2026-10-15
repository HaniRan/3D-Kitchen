/**
 * Registri model 3D: modelType → fungsi pembangun.
 * Setiap pembangun mengembalikan THREE.Group dengan userData.model (bagian & rig animasi).
 */
import * as K from './Knives.js';
import * as U from './Utensils.js';
import * as C from './Cookware.js';
import * as MC from './Machines.js';
import * as CE from './CookingEquipment.js';
import * as H from './Holding.js';
import * as T from './Tableware.js';
import * as L from './Linen.js';

const registry = {
  'chopping-knife': K.buildChoppingKnife,
  'vegetable-knife': K.buildVegetableKnife,
  'filleting-knife': K.buildFilletingKnife,
  'boning-knife': K.buildBoningKnife,
  'bread-knife': K.buildBreadKnife,
  cleaver: K.buildCleaver,
  sharpener: K.buildSharpener,
  'carving-fork': K.buildCarvingFork,
  peeler: U.buildPeeler,
  grater: U.buildGrater,
  ladle: U.buildLadle,
  spider: U.buildSpider,
  spatula: U.buildSpatula,
  'conical-strainer': U.buildConicalStrainer,
  strainer: U.buildStrainer,
  whisk: U.buildWhisk,
  'ice-cream-scoop': U.buildIceCreamScoop,
  'cutting-board': U.buildCuttingBoard,
  'rolling-pin': U.buildRollingPin,
  'measuring-cup': U.buildMeasuringCup,
  cobek: U.buildCobek,
  'stock-pot': C.buildStockPot,
  'sauce-pot': C.buildSaucePot,
  'sauce-pan': C.buildSaucePan,
  'saute-pan': C.buildSautePan,
  'roasting-pan': C.buildRoastingPan,
  'frying-pan': C.buildFryingPan,
  'steaming-pan': C.buildSteamingPan,
  blender: MC.buildBlender,
  'hand-mixer': MC.buildHandMixer,
  'planetary-mixer': MC.buildPlanetaryMixer,
  'spiral-mixer': MC.buildSpiralMixer,
  'meat-slicer': MC.buildMeatSlicer,
  scale: MC.buildScale,
  'gas-range': CE.buildGasRange,
  'deck-oven': CE.buildDeckOven,
  'rack-oven': CE.buildRackOven,
  'convection-oven': CE.buildConvectionOven,
  'combi-oven': CE.buildCombiOven,
  microwave: CE.buildMicrowave,
  salamander: CE.buildSalamander,
  griller: CE.buildGriller,
  'deep-fryer': CE.buildDeepFryer,
  'tilting-skillet': CE.buildTiltingSkillet,
  'steam-kettle': CE.buildSteamKettle,
  'display-case': H.buildDisplayCase,
  'showcase-chiller': H.buildShowcaseChiller,
  'showcase-freezer': H.buildShowcaseFreezer,
  'upright-chiller': H.buildUprightChiller,
  'upright-freezer': H.buildUprightFreezer,
  'walkin-chiller': H.buildWalkInChiller,
  'walkin-freezer': H.buildWalkInFreezer,
  'showcase-warmer': H.buildShowcaseWarmer,
  'warmer-cabinet': H.buildWarmerCabinet,
  'steam-table': H.buildSteamTable,
  'chafing-dish': H.buildChafingDish,
  'dinner-plate': T.buildDinnerPlate,
  'dessert-plate': T.buildDessertPlate,
  'bb-plate': T.buildBBPlate,
  saucer: T.buildSaucer,
  'soup-cup': T.buildSoupCup,
  'tea-cup': T.buildTeaCup,
  'coffee-cup': T.buildCoffeeCup,
  'dinner-fork': T.buildDinnerFork,
  'dessert-fork': T.buildDessertFork,
  'dinner-spoon': T.buildDinnerSpoon,
  'dessert-spoon': T.buildDessertSpoon,
  'soup-spoon': T.buildSoupSpoon,
  'dinner-knife': T.buildDinnerKnife,
  'dessert-knife': T.buildDessertKnife,
  'butter-spreader': T.buildButterSpreader,
  'water-goblet': T.buildWaterGoblet,
  'wine-glass': T.buildWineGlass,
  'juice-glass': T.buildJuiceGlass,
  'highball-glass': T.buildHighballGlass,
  'water-pitcher': T.buildWaterPitcher,
  'clay-pot': T.buildClayPot,
  apron: L.buildApron,
  'kitchen-towel': L.buildKitchenTowel,
  'dish-towel': L.buildDishTowel,
  'oven-mitt': L.buildOvenMitt,
};

export function modelTypes() { return Object.keys(registry); }
export function hasModel(type) { return type in registry; }
export function buildModel(type) {
  const fn = registry[type];
  if (!fn) throw new Error('Model tidak ditemukan: ' + type);
  const obj = fn();
  obj.userData.modelType = type;
  return obj;
}
