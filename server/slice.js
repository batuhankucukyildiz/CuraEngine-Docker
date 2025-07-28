const { execSync } = require("child_process");
const { dirname } = require("path");
const appDir = dirname(require.main.filename);
const filePath = `${appDir}/uploads`;

const sliceModel = (
  input_file,
  printer_def = "printer-settings/ultimaker3.def.json",
  materialDensity = 1.24 // PLA için varsayılan yoğunluk (g/cm³)
) => {
  const outputPath = `${appDir}/outputs/${input_file.split(".")[0]}.gcode`;
  const command = `CuraEngine slice -v -j ${printer_def} -o ${outputPath} -s infill_line_distance=0 -s print_statistics=true -l ${filePath}/${input_file}`;

  let output;
  try {
    output = execSync(command, { encoding: "utf-8" });
    console.log("Output was:\n", output);
  } catch (err) {
    console.error("❌ CuraEngine error:", err.message);
    throw err;
  }

  // Print time in seconds
  const timeMatch = output.match(/Print time \(s\):\s*(\d+)/);
  const printTimeSeconds = timeMatch ? parseInt(timeMatch[1], 10) : null;

  // Filament volume in mm³
  const volumeMatch = output.match(/Filament \(mm\^3\):\s*(\d+(\.\d+)?)/);
  const filamentVolumeMM3 = volumeMatch ? parseFloat(volumeMatch[1]) : null;

  // Gram hesabı: mm³ → cm³ → gram
  let filamentWeightGrams = null;
  if (filamentVolumeMM3 !== null) {
    const volumeCM3 = filamentVolumeMM3 / 1000;
    filamentWeightGrams = parseFloat((volumeCM3 * materialDensity).toFixed(2));
  }

  return {
    outputPath,
    printTimeSeconds,
    filamentVolumeMM3,
    filamentWeightGrams,
    rawOutput: output
  };
};

module.exports = { sliceModel };
