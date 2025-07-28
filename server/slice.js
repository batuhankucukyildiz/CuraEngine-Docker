const { execSync } = require("child_process");
const { dirname } = require("path");
const appDir = dirname(require.main.filename);
const filePath = `${appDir}/uploads`;

const sliceModel = (
  input_file,
  printer_def = "printer-settings/ultimaker3.def.json"
) => {
  const outputPath = `${appDir}/outputs/${input_file.split(".")[0]}.gcode`;

  const stdout = execSync(
    `CuraEngine slice -v -j ${printer_def} -o ${outputPath} -s infill_line_distance=0 -l ${filePath}/${input_file}`,
    { encoding: "utf-8" }
  );

  // Loglar arasında şu tür satırlar olabilir:
  // "Print time: 3600"
  // "Filament: 12345.6 mm (34.2 g)"
  // Bunları parse edelim:
  const result = {
    printTimeSeconds: null,
    filamentLengthMM: null,
    filamentWeightGrams: null,
    gcodePath: outputPath,
    rawOutput: stdout,
  };

  const timeMatch = stdout.match(/Print time: (\d+)/);
  if (timeMatch) result.printTimeSeconds = parseInt(timeMatch[1]);

  const filamentMatch = stdout.match(/Filament: ([\d.]+) mm \(([\d.]+) g\)/);
  if (filamentMatch) {
    result.filamentLengthMM = parseFloat(filamentMatch[1]);
    result.filamentWeightGrams = parseFloat(filamentMatch[2]);
  }

  return result;
};

module.exports = { sliceModel };
