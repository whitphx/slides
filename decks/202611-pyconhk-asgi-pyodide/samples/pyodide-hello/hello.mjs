import { loadPyodide } from "pyodide";

const pyodide = await loadPyodide();

const answer = await pyodide.runPythonAsync(`
import sys

f"Python {sys.version.split()[0]} on {sys.platform}"
`);

console.log(answer);
