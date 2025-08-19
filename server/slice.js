const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const { dirname } = require("path");
const appDir = dirname(require.main.filename);
const filePath = `${appDir}/uploads`;

function buildSettingsFlags(obj) {
  return Object.entries(obj)
    .map(([k, v]) => `-s ${k}=${String(v).toLowerCase()}`)
    .join(" ");
}

// ---- Malzeme presetleri ----
const MATERIALS = {
  PLA:   { density_g_cm3: 1.24, e0: { temp: 200, temp0: 205, temp_layer0: 210 }, e1: { temp: 200, temp0: 205, temp_layer0: 210 } },
  PETG:  { density_g_cm3: 1.27, e0: { temp: 235, temp0: 240, temp_layer0: 245 }, e1: { temp: 235, temp0: 240, temp_layer0: 245 } },
  ABS:   { density_g_cm3: 1.04, e0: { temp: 240, temp0: 245, temp_layer0: 250 }, e1: { temp: 240, temp0: 245, temp_layer0: 250 } },
  ASA:   { density_g_cm3: 1.07, e0: { temp: 245, temp0: 250, temp_layer0: 255 }, e1: { temp: 245, temp0: 250, temp_layer0: 255 } },
  NYLON: { density_g_cm3: 1.15, e0: { temp: 250, temp0: 255, temp_layer0: 260 }, e1: { temp: 250, temp0: 255, temp_layer0: 260 } },
};

// ---- Genel/Extruder ayarları (kısaltıldı) ----
const generalSettings = {
  acceleration_enabled: true,
  adaptive_layer_height_enabled: true,
  adhesion_extruder_nr: 1,
  adhesion_type: "raft",
  layer_height: 0.28,
  layer_height_0: 0.4,
  prime_tower_enable: true,
  prime_tower_position_x: 75,
  prime_tower_position_y: 95,
  prime_tower_size: 35,
  raft_interface_layers: 3,
  raft_interface_thickness: 0.2,
};

const baseE0 = {
  acceleration_infill: 1500,
  acceleration_print: 2000,
  line_width: 0.45,
  material_flow: 96,
  material_flow_layer_0: 98,
  speed_print: 20,
  speed_travel: 175,
  wall_thickness: 0.8,
};
const baseE1 = { ...baseE0, acceleration_infill: 2000, acceleration_print: 2400, speed_print: 40 };

// ---------- GCODE HEADER PARSER ----------
function parseHeaderBlock(gcodePath) {
  const text = fs.readFileSync(gcodePath, "utf-8");
  const start = text.indexOf(";START_OF_HEADER");
  const end   = text.indexOf(";END_OF_HEADER");
  if (start === -1 || end === -1) return {};
  const header = text.slice(start, end).split(/\r?\n/);

  const getNum = (key) => {
    const line = header.find(l => l.startsWith(`;${key}:`));
    if (!line) return undefined;
    const raw = line.split(":").slice(1).join(":").trim();
    const n = Number(raw);
    return Number.isFinite(n) ? n : undefined;
  };

  // Boyutlar
  const minX = getNum("PRINT.SIZE.MIN.X");
  const minY = getNum("PRINT.SIZE.MIN.Y");
  const minZ = getNum("PRINT.SIZE.MIN.Z");
  const maxX = getNum("PRINT.SIZE.MAX.X");
  const maxY = getNum("PRINT.SIZE.MAX.Y");
  const maxZ = getNum("PRINT.SIZE.MAX.Z");

  // Süre (s)
  const printTimeS = getNum("PRINT.TIME");

  // Extruder hacimleri (mm^3)
  const volE0 = getNum("EXTRUDER_TRAIN.0.MATERIAL.VOLUME_USED");
  const volE1 = getNum("EXTRUDER_TRAIN.1.MATERIAL.VOLUME_USED");

  // Nozzle çapı lazımsa:
  const nozE0 = getNum("EXTRUDER_TRAIN.0.NOZZLE.DIAMETER");
  const nozE1 = getNum("EXTRUDER_TRAIN.1.NOZZLE.DIAMETER");

  return {
    dims: (minX!=null&&maxX!=null&&minY!=null&&maxY!=null&&minZ!=null&&maxZ!=null) ? {
      xWidth: parseFloat((maxX - minX).toFixed(2)),
      yDepth: parseFloat((maxY - minY).toFixed(2)),
      zHeight: parseFloat((maxZ - minZ).toFixed(2)),
    } : undefined,
    printTimeSeconds: printTimeS,
    volumes: { e0: volE0, e1: volE1 },
    nozzles: { e0: nozE0, e1: nozE1 },
  };
}

// mm³ → m (filament uzunluğu)
function volumeToLengthMeters(volume_mm3, diameter_mm) {
  if (!Number.isFinite(volume_mm3)) return undefined;
  const area = Math.PI * Math.pow(diameter_mm / 2, 2); // mm²
  const length_mm = volume_mm3 / area;
  return parseFloat((length_mm / 1000).toFixed(3));
}

// mm³ → g (yoğunluk g/cm³)
function volumeToGrams(volume_mm3, density_g_cm3) {
  if (!Number.isFinite(volume_mm3)) return undefined;
  const cm3 = volume_mm3 / 1000;
  return parseFloat((cm3 * density_g_cm3).toFixed(2));
}

// ---- Slicing ana fonksiyonu ----
async function sliceModel({
  inputFilename,
  printer_def = "printer-settings/ultimaker3.def.json",
  material,
  materialE0,
  materialE1,
  filamentDiameterMm,        // tüm extruderlar için tek çap
  filamentDiameterE0Mm,      // opsiyonel E0 çapı
  filamentDiameterE1Mm,      // opsiyonel E1 çapı
}) {
  // Malzeme presetleri
  const matE0Name = (materialE0 || material || "PLA").toUpperCase();
  const matE1Name = (materialE1 || material || "PLA").toUpperCase();
  const matE0 = MATERIALS[matE0Name] || MATERIALS.PLA;
  const matE1 = MATERIALS[matE1Name] || MATERIALS.PLA;

  // Sıcaklıkları uygula
  const e0Settings = {
    ...baseE0,
    material_initial_print_temperature: matE0.e0.temp0,
    material_print_temperature: matE0.e0.temp,
    material_print_temperature_layer_0: matE0.e0.temp_layer0,
  };
  const e1Settings = {
    ...baseE1,
    material_initial_print_temperature: matE1.e1.temp0,
    material_print_temperature: matE1.e1.temp,
    material_print_temperature_layer_0: matE1.e1.temp_layer0,
  };

  const outputPath = `${appDir}/outputs/${inputFilename.split(".")[0]}.gcode`;
  const generalFlags = buildSettingsFlags(generalSettings);
  const e0Flags = buildSettingsFlags(e0Settings);
  const e1Flags = buildSettingsFlags(e1Settings);

  const command = [
    "CuraEngine slice -v",
    `-j "${printer_def}"`,
    `-o "${outputPath}"`,
    generalFlags,
    "-e0", e0Flags,
    "--next",
    "-e1", e1Flags,
    "-s print_statistics=true",
    `-l "${path.join(filePath, inputFilename)}"`,
  ].join(" ");

  let output;
  try {
    output = execSync(command + " 2>&1", { encoding: "utf-8" });
    console.log("CuraEngine Output:\n", output);
  } catch (err) {
    console.error("❌ CuraEngine error:", err.message);
    throw err;
  }

  // ---- Header’dan oku ----
  const hdr = parseHeaderBlock(outputPath);

  // Süre (fallback: stdout satırı)
  let printTimeSeconds = hdr.printTimeSeconds;
  if (!Number.isFinite(printTimeSeconds)) {
    const m = output.match(/Print time \(s\):\s*(\d+)/);
    if (m) printTimeSeconds = parseInt(m[1], 10);
  }

  // Extruder hacimleri
  const volE0 = hdr.volumes?.e0;
  const volE1 = hdr.volumes?.e1;
  const filamentVolumeMM3 = (Number(volE0 || 0) + Number(volE1 || 0)) || undefined;

  // Çaplar (öncelik: extruder spesifik > genel > 2.85)
  const dE0 = Number(filamentDiameterE0Mm || filamentDiameterMm) || 2.85;
  const dE1 = Number(filamentDiameterE1Mm || filamentDiameterMm) || 2.85;

  // Uzunluklar (m)
  const lenE0m = volumeToLengthMeters(volE0, dE0);
  const lenE1m = volumeToLengthMeters(volE1, dE1);
  const filamentLengthMeters = [lenE0m, lenE1m].some(Number.isFinite)
    ? parseFloat(((lenE0m || 0) + (lenE1m || 0)).toFixed(3))
    : undefined;

  // Ağırlıklar (g)
  const wE0g = volumeToGrams(volE0, matE0.density_g_cm3);
  const wE1g = volumeToGrams(volE1, matE1.density_g_cm3);
  const filamentWeightGrams = [wE0g, wE1g].some(Number.isFinite)
    ? parseFloat(((wE0g || 0) + (wE1g || 0)).toFixed(2))
    : undefined;

  // Boyutlar
  const partDimensionsMm = hdr.dims; // { xWidth, yDepth, zHeight }

  return {
    command,
    outputPath,
    printTimeSeconds,
    printTimeHours: Number.isFinite(printTimeSeconds) ? parseFloat((printTimeSeconds / 3600).toFixed(2)) : undefined,

    // Toplamlar
    filamentVolumeMM3,
    filamentLengthMeters,
    filamentWeightGrams,
    filamentWeightKg: Number.isFinite(filamentWeightGrams) ? parseFloat((filamentWeightGrams / 1000).toFixed(3)) : undefined,

    // Extruder kırılımı
    perExtruder: {
      E0: {
        material: matE0Name,
        volumeMM3: volE0,
        filamentDiameterMm: dE0,
        lengthMeters: lenE0m,
        weightGrams: wE0g,
      },
      E1: {
        material: matE1Name,
        volumeMM3: volE1,
        filamentDiameterMm: dE1,
        lengthMeters: lenE1m,
        weightGrams: wE1g,
      },
    },

    // Boyutlar
    partDimensionsMm,
    materialUsed: { E0: matE0Name, E1: matE1Name },
  };
}

module.exports = { sliceModel };
