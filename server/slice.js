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
  acceleration_enabled : true,
  adaptive_layer_height_enabled : true,
  adhesion_extruder_nr : 1,
  adhesion_type : "raft",
  adhesion_z_offset : 0 ,
  build_volume_temperature : 88,
  interlocking_enable : false,
  jerk_enabled : false,
  layer_height : 0.3,
  layer_height_0 : 0.3,
  material_shrinkage_percentage : 100.5,
  prime_tower_base_curve_magnitude : 0.5,
  prime_tower_base_height : 1.2,
  prime_tower_base_size : 5,
  prime_tower_enable : true,
  prime_tower_min_shell_thickness : 3,
  prime_tower_mode : normal,
  prime_tower_position_x: 75,
  prime_tower_position_y: 95,
  prime_tower_size : 30,
  raft_interface_extruder_nr : 0,
  raft_surface_remove_inside_corners : false,
  retraction_combing : "all",
  support_bottom_extruder_nr : 0,
  support_enable : true,
  support_extruder_nr : 1,
  support_extruder_nr_layer_0 : 0,
  support_infill_extruder_nr : 0,
  wall_extruder_nr : 0
 };

// Extruder 0 (E0)
const e0Settings = {
  acceleration_infill : 1800,
  acceleration_print : 2000,
  coasting_enable : true,
  cool_fan_enabled : false,
  cool_lift_head : true,
  cool_min_layer_time : 15,
  flooring_layer_count : 1,
  infill_material_flow : 80,
  infill_overlap : 10,
  infill_pattern : "zigzag",
  infill_sparse_density : 70,
  initial_layer_line_width_factor : 105,
  inset_direction : "outside_in",
  ironing_enabled : false,
  ironing_flow : 12,
  ironing_line_spacing : 0.2,
  jerk_print : 15,
  klipper_pressure_advance_factor : 0.07,
  klipper_smooth_time_factor : 0.05,
  line_width : 0.44,
  material_final_print_temperature : 245,
  material_flow : 92.6,
  material_flow_layer_0 : 92,
  material_initial_print_temperature : 255,
  material_print_temperature : 255,
  material_print_temperature_layer_0 : 265.0,
  material_standby_temperature : 180,
  prime_tower_flow : 92,
  prime_tower_line_width : 0.6,
  prime_tower_max_bridging_distance : 8,
  prime_tower_min_volume : 30,
  raft_airgap : 0,
  raft_base_line_spacing : 4,
  raft_base_margin : 1.5,
  raft_base_thickness : 0.7,
  raft_flow : 86,
  raft_interface_layers : 3,
  raft_interface_line_spacing : 1,
  raft_interface_margin : 3,
  raft_interface_speed : 75,
  raft_interface_wall_count : 1,
  raft_interface_z_offset : 0,
  raft_margin : 3,
  raft_surface_line_spacing : 0.4,
  raft_surface_line_width : 0.6,
  raft_surface_margin : 2.8,
  raft_surface_speed : 100,
  raft_surface_wall_count : 1,
  retraction_amount : 0.8,
  retraction_hop : 0.8,
  retraction_hop_enabled : true,
  retraction_min_travel : 2,
  retraction_speed : 70,
  roofing_layer_count : 4,
  roofing_material_flow : 85,
  skin_line_width : 0.4,
  skin_material_flow : 91,
  skin_material_flow_layer_0 : 92.6,
  slicing_tolerance : "inclusive",
  speed_infill : 100,
  speed_layer_0 : 35,
  speed_print : 130.0,
  speed_travel : 250,
  speed_wall_0 : 55,
  speed_z_hop : 300,
  support_angle : 15,
  support_bottom_distance : 0,
  support_infill_rate : 10,
  support_initial_layer_line_distance : 2,
  support_wall_count : 1,
  switch_extruder_extra_prime_amount : 0.5,
  switch_extruder_retraction_amount : 20,
  top_bottom_pattern : zigzag,
  top_layers : 4,
  wall_0_material_flow : 89,
  wall_0_material_flow_layer_0 : 92,
  wall_0_material_flow_roofing : 90,
  wall_line_count : 2,
  wall_line_width_0 : 0.4,
  wall_material_flow : 90,
  wall_thickness : 0.8,
  wall_x_material_flow : 89,
  wall_x_material_flow_layer_0 : 92.6,
  z_seam_corner : "z_seam_corner_weighted",
  z_seam_position : "frontleft"
  };

// Extruder 1 (E1)
// Extruder 1 (E1)
const e1Settings = {
  infill_pattern : "zigzag",
  infill_sparse_density : 30,
  inset_direction : "outside_in",
  ironing_enabled : false,
  material_final_print_temperature : 240,
  material_flow : 92.6,
  material_flow_layer_0 : 92.6,
  material_initial_print_temperature : 240,
  material_print_temperature : 255,
  material_print_temperature_layer_0 : 250,
  prime_tower_flow : 92.6,
  prime_tower_max_bridging_distance : 8,
  prime_tower_min_volume : 30,
  prime_tower_raft_base_line_spacing : 1.75,
  raft_airgap : 0,
  raft_base_flow : 94,
  raft_base_line_spacing : 1,
  raft_base_line_width : 1,
  raft_base_margin : 3,
  raft_base_speed : 50,
  raft_base_thickness : 0.6,
  raft_interface_flow : 90,
  raft_interface_layers : 6,
  raft_interface_line_spacing : 1.8,
  raft_interface_line_width : 0.6,
  raft_interface_speed : 100,
  raft_interface_thickness : 0.4,
  raft_interface_wall_count : 1,
  raft_margin : 2,
  raft_surface_flow : 90,
  raft_surface_infill_overlap : 0.05,
  raft_surface_layers : 1,
  raft_surface_line_spacing : 0.5,
  raft_surface_line_width : 0.6,
  raft_surface_margin : 3,
  raft_surface_monotonic : true,
  raft_surface_speed : 50,
  raft_surface_thickness : 0.3,
  raft_surface_wall_count : 0,
  retraction_amount : 0.8,
  skin_material_flow : 92.6,
  speed_support : 50,
  support_angle : 80,
  support_bottom_distance : 0.0,
  support_infill_rate : 15,
  support_interface_density : 95,
  support_interface_enable : true,
  support_interface_height : 1.2,
  support_interface_line_width : 0.44,
  support_interface_material_flow : 92,
  support_interface_pattern : "zigzag",
  support_line_width : 0.384,
  support_material_flow : 92,
  support_roof_height : 0.9,
  support_wall_count : 1,
  support_z_distance : 0.05,
  switch_extruder_extra_prime_amount : 0.5,
  switch_extruder_retraction_amount : 30,
  zig_zaggify_support : true
  };
  

const appDefaults = {
  materialDensity: 1.24 // g/cm^3 (ör: PLA; ihtiyacına göre değiştir)
};

const sliceModel = (
  input_file,
  printer_def = "printer-settings/ultimaker3.def.json",
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
