import fs from "fs";
import { loadPyodide } from "pyodide";

const codemodPyFile = fs.readFileSync("../py/codemod.py", "utf-8");
const scriptRunnerPyFile = fs.readFileSync("../py/script_runner.py", "utf-8");

const pyodide = await loadPyodide();

pyodide.FS.writeFile("codemod.py", codemodPyFile);
pyodide.FS.writeFile("script_runner.py", scriptRunnerPyFile);

//#region runScript
const runScript = pyodide.pyimport("script_runner.run_script");

await runScript(`
import asyncio

async def coro():
    print("Hello World")
    return 42

asyncio.run(coro())
`);
//#endregion
