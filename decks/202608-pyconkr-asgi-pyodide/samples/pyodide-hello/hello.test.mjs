import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { test } from "node:test";
import { promisify } from "node:util";

const run = promisify(execFile);

test("running hello.mjs prints what Python returned", async () => {
  const { stdout } = await run("node", ["hello.mjs"], { cwd: import.meta.dirname });

  // Python's f-string came back to JavaScript as a plain string.
  assert.match(stdout, /^Python 3\.\d+/);
  assert.match(stdout, /on emscripten/);
});
