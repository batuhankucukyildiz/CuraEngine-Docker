<<<<<<< Updated upstream
const execSync = require("child_process").execSync;

=======
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
>>>>>>> Stashed changes
const { dirname } = require("path");
const appDir = dirname(require.main.filename);
const filePath = `${appDir}/uploads`;

<<<<<<< Updated upstream
const sliceModel = (
  input_file,
  printer_def = "printer-settings/ultimaker3.def.json"
) => {
  console.log("hello");
  const outputPath = `${appDir}/outputs/${input_file.split(".")[0]}.gcode`;
  const output = execSync(
    `CuraEngine slice -v -j ${printer_def} -o ${outputPath}  -s infill_line_distance=0 -l ${filePath}/${input_file}`,
    { encoding: "utf-8" }
  ); // the default is 'buffer'

  console.log("Output was:\n", output);
};
=======
function buildSettingsFlags(obj) {
  return Object.entries(obj)
    .map(([k, v]) => `-s ${k}=${String(v).toLowerCase()}`)
    .join(" ");
}

// ---- Malzeme presetleri (yoğunluk + tipik ısılar) ----
const MATERIALS = {
  PLA:   { density_g_cm3: 1.24, e0: { temp: 200, temp0: 205, temp_layer0: 210 }, e1: { temp: 200, temp0: 205, temp_layer0: 210 } },
  PETG:  { density_g_cm3: 1.27, e0: { temp: 235, temp0: 240, temp_layer0: 245 }, e1: { temp: 235, temp0: 240, temp_layer0: 245 } },
  ABS:   { density_g_cm3: 1.04, e0: { temp: 240, temp0: 245, temp_layer0: 250 }, e1: { temp: 240, temp0: 245, temp_layer0: 250 } },
  ASA:   { density_g_cm3: 1.07, e0: { temp: 245, temp0: 250, temp_layer0: 255 }, e1: { temp: 245, temp0: 250, temp_layer0: 255 } },
  NYLON: { density_g_cm3: 1.15, e0: { temp: 250, temp0: 255, temp_layer0: 260 }, e1: { temp: 250, temp0: 255, temp_layer0: 260 } },
};

// ---- Genel ayarlar (ihtiyacına göre korundu) ----
const generalSettings = {
  acceleration_enabled: true,
  adaptive_layer_height_enabled: true,
  adhesion_extruder_nr: 1,
  adhesion_type: "raft",
  adhesion_z_offset: 0,
  build_volume_temperature: 92,
  interlocking_enable: false,
  jerk_enabled: true,
  layer_height: 0.28,
  layer_height_0: 0.4,
  material_shrinkage_percentage: 100.5,
  prime_tower_base_curve_magnitude: 3,
  prime_tower_base_height: 1.2,
  prime_tower_base_size: 5,
  prime_tower_enable: true,
  prime_tower_position_x: 75,
  prime_tower_position_y: 95,
  prime_tower_size: 35,
  raft_airgap: 0,
  raft_base_line_spacing: 4,
  raft_base_margin: 1.5,
  raft_base_thickness: 0.7,
  raft_flow: 86,
  raft_interface_layers: 3,
  raft_interface_line_spacing: 1.4,
  raft_interface_thickness: 0.2,
};

// ---- Extruder profilleri (ısılar materyale göre override edilecek) ----
const baseE0 = {
  acceleration_infill: 1500,
  acceleration_print: 2000,
  infill_material_flow: 92,
  infill_overlap: 10,
  infill_pattern: "zigzag",
  infill_sparse_density: 30,
  initial_layer_line_width_factor: 110,
  ironing_enabled: false,
  ironing_flow: 12,
  ironing_inset: 0.2,
  ironing_line_spacing: 0.3,
  ironing_monotonic: false,
  ironing_only_highest_layer: false,
  ironing_pattern: "concentric",
  jerk_layer_0: 8,
  jerk_print: 18,
  line_width: 0.45,
  material_flow: 96,
  material_flow_layer_0: 98,
  // sıcaklıklar materyal preset'inden gelecek
  optimize_wall_printing_order: true,
  outer_inset_first: false,
  raft_interface_line_width: 0.4,
  retraction_amount: 0.6,
  retraction_combing: "noskin",
  retraction_count_max: 20,
  retraction_enable: true,
  retraction_extrusion_window: 2,
  retraction_hop: 0.4,
  retraction_hop_enabled: true,
  retraction_min_travel: 0.8,
  retraction_speed: 37,
  skirt_brim_line_width: 0.45,
  skirt_brim_minimal_length: 100,
  skirt_brim_speed: 20,
  skin_material_flow: 95,
  skin_overlap: 8,
  skin_preshrink: 0.12,
  skin_removal_width: 0.2,
  skin_speed: 25,
  skirt_brim_line_count: 4,
  small_feature_speed_factor_0: 70,
  small_feature_speed_factor: 70,
  speed_infill: 45,
  speed_layer_0: 20,
  speed_print: 20,
  speed_topbottom: 35,
  speed_travel: 175,
  speed_wall: 35,
  speed_wall_0: 28,
  speed_wall_x: 35,
  support_angle: 45,
  support_brim_enable: false,
  support_infill_rate: 12,
  support_interface_enable: true,
  support_interface_height: 0.6,
  support_pattern: "zigzag",
  top_layers: 4,
  top_thickness: 0.8,
  travel_avoid_supports: false,
  wall_0_material_flow: 96,
  wall_0_wipe_dist: 0.02,
  wall_line_width: 0.45,
  wall_thickness: 0.8,
  wall_x_material_flow_layer_0: 92.6,
};

const baseE1 = {
  ...baseE0,
  acceleration_infill: 2000,
  acceleration_print: 2400,
  speed_print: 40,
  support_interface_height: 1,
};

// ---- STL boyutlarını hesapla (ASCII/Binary destekli) ----
function readSTLBoundingBox(absFilePath) {
  const buf = fs.readFileSync(absFilePath);
  const isASCII = buf.slice(0, 5).toString().toLowerCase() === "solid" && buf.toString().includes("facet");

  const min = { x: +Infinity, y: +Infinity, z: +Infinity };
  const max = { x: -Infinity, y: -Infinity, z: -Infinity };

  function consider(x, y, z) {
    if (x < min.x) min.x = x; if (x > max.x) max.x = x;
    if (y < min.y) min.y = y; if (y > max.y) max.y = y;
    if (z < min.z) min.z = z; if (z > max.z) max.z = z;
  }

  if (isASCII) {
    // Her "vertex x y z" satırını yakala
    const text = buf.toString();
    const re = /vertex\s+([+-]?\d*\.?\d+(?:[eE][+-]?\d+)?)\s+([+-]?\d*\.?\d+(?:[eE][+-]?\d+)?)\s+([+-]?\d*\.?\d+(?:[eE][+-]?\d+)?)/g;
    let m;
    while ((m = re.exec(text)) !== null) {
      consider(parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3]));
    }
  } else {
    // Binary STL: 80 bayt header, 4 bayt üçgen sayısı
    const triCount = buf.readUInt32LE(80);
    let offset = 84;
    for (let i = 0; i < triCount; i++) {
      offset += 12; // normal (3 float)
      for (let v = 0; v < 3; v++) {
        const x = buf.readFloatLE(offset); offset += 4;
        const y = buf.readFloatLE(offset); offset += 4;
        const z = buf.readFloatLE(offset); offset += 4;
        consider(x, y, z);
      }
      offset += 2; // attribute byte count
    }
  }

  // mm cinsinden
  const xWidth = parseFloat((max.x - min.x).toFixed(2));
  const yDepth = parseFloat((max.y - min.y).toFixed(2));
  const zHeight = parseFloat((max.z - min.z).toFixed(2));

  return { xWidth, yDepth, zHeight };
}

// ---- Slicing ana fonksiyonu ----
async function sliceModel({
  inputFilename,
  printer_def = "printer-settings/ultimaker3.def.json",
  material,            // tek materyal adı (PLA/ABS/PETG/…)
  materialE0,          // opsiyonel: E0 için materyal
  materialE1,          // opsiyonel: E1 için materyal
  filamentDiameterMm,  // default 2.85 veya 1.75
}) {
  // Malzeme presetlerini hazırla
  const matE0Name = (materialE0 || material || "PLA").toUpperCase();
  const matE1Name = (materialE1 || material || "PLA").toUpperCase();
  const matE0 = MATERIALS[matE0Name] || MATERIALS.PLA;
  const matE1 = MATERIALS[matE1Name] || MATERIALS.PLA;

  // Yoğunluk: tek malzeme ise E0’ı baz al
  const density_g_cm3 = matE0.density_g_cm3;

  // Filament çapı (mm)
  const d_mm = filamentDiameterMm ? parseFloat(filamentDiameterMm) : 2.85; // UM3 için 2.85 tipik

  // E0/E1 sıcaklıklarını preset’lerden uygula
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
    `-l "${path.join(filePath, inputFilename)}"`
  ].join(" ");

  let output;
  try {
    output = execSync(command + " 2>&1", { encoding: "utf-8" });
    console.log("CuraEngine Output:\n", output);
  } catch (err) {
    console.error("❌ CuraEngine error:", err.message);
    throw err;
  }

  // ---- CuraEngine çıktısından istatistikler ----
  const timeMatch = output.match(/Print time \(s\):\s*(\d+)/);
  const printTimeSeconds = timeMatch ? parseInt(timeMatch[1], 10) : null;

  const volumeMatch = output.match(/Filament \(mm\^3\):\s*(\d+(\.\d+)?)/);
  const filamentVolumeMM3 = volumeMatch ? parseFloat(volumeMatch[1]) : null;

  // Filament uzunluğu (m): V / (π * (d/2)^2)
  let filamentLengthMeters = null;
  if (filamentVolumeMM3 !== null) {
    const area_mm2 = Math.PI * Math.pow(d_mm / 2, 2);
    const length_mm = filamentVolumeMM3 / area_mm2;
    filamentLengthMeters = parseFloat((length_mm / 1000).toFixed(3));
  }

  // Kütle (g) = V(cm³) * yoğunluk(g/cm³)
  let filamentWeightGrams = null;
  if (filamentVolumeMM3 !== null) {
    const volumeCM3 = filamentVolumeMM3 / 1000; // 1000 mm³ = 1 cm³
    filamentWeightGrams = parseFloat((volumeCM3 * density_g_cm3).toFixed(2));
  }

  // STL boyutları
  let partDimensionsMm = null;
  try {
    const absModelPath = path.join(filePath, inputFilename);
    partDimensionsMm = readSTLBoundingBox(absModelPath);
  } catch (e) {
    console.warn("⚠️ STL dimensions could not be computed:", e.message);
  }

  return {
    command,
    outputPath,
    printTimeSeconds,
    filamentVolumeMM3,
    filamentLengthMeters,
    filamentWeightGrams,
    partDimensionsMm,
    materialUsed: { E0: matE0Name, E1: matE1Name },
  };
}
>>>>>>> Stashed changes

module.exports = { sliceModel };
