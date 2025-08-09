const { execSync } = require("child_process");
const { dirname } = require("path");
const appDir = dirname(require.main.filename);
const filePath = `${appDir}/uploads`;

function buildSettingsFlags(obj) {
  return Object.entries(obj)
    .map(([k, v]) => `-s ${k}=${String(v).toLowerCase()}`)
    .join(" ");
}

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
  raft_interface_thickness: 0.2
};

// Extruder 0 (E0)
const e0Settings = {
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
  material_initial_print_temperature: 280,
  material_print_temperature: 270,
  material_print_temperature_layer_0: 300,
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
  speed_print: 40,
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
  wall_x_material_flow_layer_0: 92.6
};

// Extruder 1 (E1)
const e1Settings = {
  acceleration_infill: 2000,
  acceleration_print: 2400,
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
  material_initial_print_temperature: 270,
  material_print_temperature: 265,
  material_print_temperature_layer_0: 280,
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
  speed_print: 40,
  speed_topbottom: 35,
  speed_travel: 175,
  speed_wall: 35,
  speed_wall_0: 28,
  speed_wall_x: 35,
  support_angle: 45,
  support_brim_enable: false,
  support_infill_rate: 12,
  support_interface_enable: true,
  support_interface_height: 1,
  support_pattern: "zigzag",
  top_layers: 4,
  travel_avoid_supports: false,
  wall_0_material_flow: 96,
  wall_0_wipe_dist: 0.02,
  wall_line_width: 0.45,
  wall_thickness: 0.8
};

const appDefaults = {
  materialDensity: 1.24 // g/cm^3 (ör: PLA; ihtiyacına göre değiştir)
};

const sliceModel = (
  input_file,
  printer_def = "printer-settings/fdmprinter.def.json",
  materialDensity = appDefaults.materialDensity
) => {
  const outputPath = `${appDir}/outputs/${input_file.split(".")[0]}.gcode`;

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
    `-l "${filePath}/${input_file}"`
  ].join(" ");

  let output;
  try {
    output = execSync(command + " 2>&1", { encoding: "utf-8" });
    console.log("Output was:\n", output);
  } catch (err) {
    console.error("❌ CuraEngine error:", err.message);
    throw err;
  }

  const timeMatch = output.match(/Print time \(s\):\s*(\d+)/);
  const printTimeSeconds = timeMatch ? parseInt(timeMatch[1], 10) : null;

  const volumeMatch = output.match(/Filament \(mm\^3\):\s*(\d+(\.\d+)?)/);
  const filamentVolumeMM3 = volumeMatch ? parseFloat(volumeMatch[1]) : null;

  let filamentWeightGrams = null;
  if (filamentVolumeMM3 !== null) {
    const volumeCM3 = filamentVolumeMM3 / 1000;
    filamentWeightGrams = parseFloat((volumeCM3 * materialDensity).toFixed(2));
  }

  return {
    command, // debug için döndürüyorum
    outputPath,
    printTimeSeconds,
    filamentVolumeMM3,
    filamentWeightGrams
  };
};

module.exports = { sliceModel };
