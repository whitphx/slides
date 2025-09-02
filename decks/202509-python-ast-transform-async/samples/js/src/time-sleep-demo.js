import fs from "fs";
import { loadPyodide } from "pyodide";

const pyFile = fs.readFileSync("../py/time_sleep_demo.py", "utf-8");

const pyodide = await loadPyodide();

await pyodide.runPythonAsync(pyFile);
