const { execSync } = require("child_process");
const { dirname } = require("path");
const appDir = dirname(require.main.filename);
const filePath = `${appDir}/uploads`;

const sliceModel = (
  input_file,
  printer_def = "printer-settings/ultimaker3.def.json"
) => {
  const outputPath = `${appDir}/outputs/${input_file.split(".")[0]}.gcode`;

  const command = `CuraEngine slice -v -j ${printer_def} -o ${outputPath} -s infill_line_distance=0 -s print_statistics=true -l ${filePath}/${input_file}`;
  console.log("Running:", command);

  const output = execSync(command, { encoding: "utf-8" });
  console.log("Output was:\n", output);
};

module.exports = { sliceModel };
