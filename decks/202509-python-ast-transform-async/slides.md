---
theme: ../../themes/triangle
title: "AST Black Magic: Run synchronous Python code on asynchronous Pyodide"
drawings:
  persist: false
mdc: true
themeConfig:
  primary: '#36709E'
defaults:
  transition: slide-left
transition: fade-out
addons:
  - anipres
  - fancy-arrow
---

<h1 text-6xl leading-18>
AST Black Magic:<br>
<small>Run synchronous Python code on asynchronous Pyodide</small>
</h1>

---

<h1 text-4xl>Yuichiro Tachibana / 橘 祐一郎</h1>

@whitphx

<div absolute top-40 right-40>
<img src="https://avatars.githubusercontent.com/u/3135397?v=4" alt="whitphx" w="130px">
</div>

<div mt-8>
Software Artisan / Indie Dev / OSS Enthusiast
</div>

<div mt-4>

<v-clicks>

- ML Developer Advocate at <span v-mark.underline.yellow="1">Hugging Face</span> 🤗
- <span v-mark.underline.red="2">Streamlit</span> Creator

</v-clicks>

</div>

<div my-10 w-min flex="~ gap-1" items-center justify-center v-click>
  <div i-ri-user-3-line op50 ma text-2xl />
  <div><a href="https://whitphx.info/" target="_blank" class="border-none! font-300">whitphx.info</a></div>
  <div i-ri-github-line op50 ma text-2xl ml4/>
  <div><a href="https://github.com/whitphx" target="_blank" class="border-none! font-300">whitphx</a></div>
  <div i-ri-linkedin-line op50 ma text-2xl ml4/>
  <div><a href="https://www.linkedin.com/in/whitphx/" target="_blank" class="border-none! font-300">whitphx</a></div>
  <div i-ri-twitter-x-line op50 ma text-2xl ml4/>
  <div><a href="https://twitter.com/whitphx" target="_blank" class="border-none! font-300">whitphx</a></div>
</div>

---
layout: section
---

<h1>AST 101</h1>

---

# What is an AST?

- **AST** stands for **Abstract Syntax Tree**
- It is a tree representation of the structure of source code

<div flex="~ col" gap-4 h-90 v-click="1">

```py {*}
x = 1 + 2
```

<div grid="~ cols-2" gap-4 grow v-click="2">

``` {*|1-2|3-9|4-5|6-9}{at: 3}
Module(
    body=[
        Assign(
            targets=[
                Name(id='x', ctx=Store())],
            value=BinOp(
                left=Constant(value=1),
                op=Add(),
                right=Constant(value=2)))])
```

<SlidevAnipres id="ast-sample-add-assignment" at="2" />

</div>

</div>

---
layout: section
---

<h1>
Background

<div text-4xl>
Incompatibility between Python and Pyodide
</div>
</h1>

---

# Pyodide
https://pyodide.org/

<div flex justify-center items-center h="60">

<a href="https://pyodide.org/" target="_blank" rel="noopener noreferrer">
  <img src="/pyodide.png" alt="Pyodide" max-h="100%" object-cover m-auto>
</a>

</div>

> Pyodide is a Python distribution for the browser and Node.js based on WebAssembly.

---

# How Python code is run on Pyodide
Python in JavaScript

<div mt-8>

<<< @/samples/js/src/pyodide-simple.js js {*|*|5-8|5-8|10}{'data-id': 'pyodide-example-js'}

<div v-click="4">

```
3.13.2 (main, Aug 19 2025, 14:09:10) [Clang 21.0.0git (https:/github.com/llvm/llvm-project 2f05451198e2f222ec66cec489
```

</div>

</div>

<div absolute right-30 top-20 text-4xl data-id="desc1" v-click="1">JavaScript</div>
<FancyArrow from="[data-id=desc1] @ left" to="[data-id=pyodide-example-js] @ top" arc="-0.1" v-click="1"/>

<div absolute right-10 top-60 text-4xl data-id="desc2" v-click="2">Run Python code</div>
<FancyArrow from="[data-id=desc2] @ left" to="[data-id=pyodide-example-js] .line:nth-child(5) @ right" arc="-0.1" v-click="2" />

<div absolute right-10 top-90 text-4xl data-id="desc3" v-click="3">Pass the Python code as a string literal</div>
<FancyArrow from="[data-id=desc3] @ topleft" to="[data-id=pyodide-example-js] .line:nth-child(6) @ right" arc="-0.1" v-click="3" />

<style>
* {
  --slidev-code-font-size: 18px;
}
</style>

---

# Python in JavaScript = Python on browsers/NodeJS

```shell
❯ node
Welcome to Node.js v22.16.0.
Type ".help" for more information.
> const { loadPyodide } = require("pyodide")
undefined
> const pyodide = await loadPyodide();
undefined
> pyodide.runPython('print("Hello from Python")')
Hello from Python
undefined
```

<style>
* {
  --slidev-code-font-size: 18px;
}
</style>

---

# A Python framework ported to Pyodide
Streamlit for Pyodide: Stlite

<div grid="~ cols-2" gap-4>

<div>

[`streamlit/streamlit`](https://github.com/streamlit/streamlit)

<img src="/streamlit-logo-primary-colormark-darktext.svg" alt="Streamlit logo">


```py
import streamlit as st

st.write("Hello World")
```

```shell
❯ streamlit run app.py
```

</div>

<div>

[`whitphx/stlite`](https://github.com/whitphx/stlite)

<img src="/stlite.svg" alt="Stlite logo">

```html
<!doctype html>
<html>
  <head>
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/@stlite/browser@0.85.1/build/stlite.css"
    />
    <script
      type="module"
      src="https://cdn.jsdelivr.net/npm/@stlite/browser@0.85.1/build/stlite.js"
    ></script>
  </head>
  <body>
    <streamlit-app>
      <app-file name="app.py" entrypoint>
import streamlit as st

name = st.text_input('Your name')
st.write("Hello,", name or "world")
      </app-file>
    </streamlit-app>
  </body>
</html>
```

</div>

</div>

---

<div h-100 flex justify-center>

<SlidevVideo autoplay controls max-h="100%">
  <source src="/stlite_llm_static.mp4" type="video/mp4" />
</SlidevVideo>

</div>

<div>

👉 [Streamlit meets WebAssembly - stlite, PyConTW 2023](https://www.youtube.com/watch?v=fYB5hhM7P8k)

👉 [Democratize serverless web AI apps for Python devs, EuroPython 2025](https://ep2025.europython.eu/session/democratize-serverless-web-ai-apps-for-python-devs)

</div>

---

# The problem: interoperability



---

# Example 1: `asyncio.run()`

<div grid="~ cols-2" gap-4>

<div>

```py
import asyncio

async def fn():
    ...

asyncio.run(fn())
```

```
Traceback (most recent call last):
  ...
  File "/lib/python311.zip/asyncio/runners.py", line 186, in run
    raise RuntimeError(
RuntimeError: asyncio.run() cannot be called from a running event loop
```

</div>


```py
import asyncio

async def fn():
    ...

await fn()
```

</div>

---

# Example 2: `time.sleep()`

<div grid="~ cols-2" gap-4>

<div>

```py
import asyncio
import time

async def async_timer():
    print("Async time start", time.time())
    await asyncio.sleep(1)
    print("Async time end", time.time())


print("Script start", time.time())
# asyncio.run(async_timer())
asyncio.create_task(async_timer())
time.sleep(1)
```

### Expected

```
Script start 1756823376.8114681
Async time start 1756823376.811596
Async time end 1756823377.812911
```

### Actual
```
Script start 1756822802.754
Async time start 1756822803.755
Async time end 1756822804.757
```

</div>

```py
import asyncio

await asyncio.sleep(1)
```

</div>

---

# Motivation: we don't want to rewrite the code

---
layout: section
---

<h1>
AST transformation<br>
to the rescue
</h1>

---

# Python code execution flow

---

# Metaprogramming!

---

# `ast` module

---

# Example: AST Transformation
Replace `+` with `*` at runtime

`add.py`

<<< @/samples/py/add.py py {*}

```shell
❯ python add.py
2 + 3 = 5
2 + 3 = 5
```

`run_noop.py`
<<< @/samples/py/run_noop.py

```shell
❯ ./run_noop.py add.py
2 + 3 = 5
2 + 3 = 5
```

`run_add_as_mul.py`
<<< @/samples/py/run_add_as_mul.py py {*}

```shell
❯ ./run_add_as_mul.py add.py
2 + 3 = 6
2 + 3 = 6
```

---

# `ast.NodeVisitor` and `ast.NodeTransformer`

---

# Script Runner

```py
with open_python_file(script_path) as f:
    filebody = f.read()

filebody = codemod.patch(filebody, script_path)

bytecode = compile(  # type: ignore
    filebody,
    # Pass in the file path so it can show up in exceptions.
    script_path,
    # We're compiling entire blocks of Python, so we need "exec"
    # mode (as opposed to "eval" or "single").
    mode="exec",
    # Don't inherit any flags or "future" statements.
    flags=ast.PyCF_ALLOW_TOP_LEVEL_AWAIT,
    dont_inherit=1,
    # Use the default optimization options.
    optimize=-1,
)

if bytecode.co_flags & CO_COROUTINE:
    await eval(bytecode, module.__dict__)
else:
    exec(bytecode, module.__dict__)
```

---

# Case 1: `asyncio.run(coro())` -> `await coro()`

```
Call(
    func=Attribute(
        value=Name(id='asyncio', ctx=Load()),
        attr='run',
        ctx=Load()),
    args=[
        Call(
            func=Name(id='coro', ctx=Load()),
            args=[
                Name(id='arg', ctx=Load())])])
```

```
Await(
    value=Call(
        func=Name(id='coro', ctx=Load()),
        args=[
            Name(id='arg', ctx=Load())]))
```

```py
def transform_asyncio_run(node):
    return ast.Await(
        value=node.args[0],
    )
```

---

# Case 2: `time.sleep()` -> `asyncio.sleep()`

```
Call(
    func=Attribute(
        value=Name(id='time', ctx=Load()),
        attr='sleep',
        ctx=Load()),
    args=[
        Name(id='arg', ctx=Load())])
```

```
Await(
    value=Call(
        func=Attribute(
            value=Name(id='asyncio', ctx=Load()),
            attr='sleep',
            ctx=Load()),
        args=[
            Name(id='arg', ctx=Load())]))
```

```py
def transform_time_sleep(node):
    return ast.Await(
        value=ast.Call(
            func=ast.Attribute(
                value=ast.Name(id="asyncio", ctx=ast.Load()),
                attr="sleep",
                ctx=ast.Load(),
            ),
            args=node.args,
            keywords=node.keywords,
        )
    )
```

```py
_insert_import_statement(code_block_ast, ["asyncio"])
```

---

# Case 3: `def fn(): ...; fn()` -> `async def fn(): ...; await fn()`

---

# Case 4: `st.navigation().run()` -> `await (st.navigation()).run()`

---
layout: section
---

<h1>
More cases
</h1>

---

# Inside control flows

```py
if cond:
  time.sleep(1)
```

---

# Import types
```py
import time

time.sleep(1)
```

```py
from time import sleep

sleep(1)
```

```py
import time as t

t.sleep(1)
```

```py
from time import sleep as wait

wait(1)
```

---

# Aliased

```py
from time import sleep

wait = sleep

wait(1)
```

---

# Conditionally aliased

```py
import time
import asyncio

wait = time.sleep if cond else asyncio.sleep

wait(1)
```

---

# Import in scope

```py
from asyncio import sleep

def foo():
    from time import sleep

    sleep(1)
```

---

# Overridden package

```py
import time

time.sleep(1)
```

`time.py`
```py
import asyncio

async def sleep(delay):
    await asyncio.sleep(delay)
```

---

# Name resolution

---

# Test cases
