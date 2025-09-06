import { loadPyodide } from "pyodide";

const pyodide = await loadPyodide();

const result = pyodide.runPython(`
import sys
sys.version
`);

console.log(result);
