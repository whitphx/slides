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

``` {*|1-2|3-9|4-5|6-9|6-9|*}{at: 3}
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

# `ast` module

```py {*}{'data-id': 'ast-module-example'}
>>> import ast
>>> tree = ast.parse("x = 1 + 2")
>>> print(ast.dump(tree, indent=4))
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

<div>

<div v-click>
<div data-id="ast-parse-desc" absolute top-10 right-10 w="50%" bg-white p-4 rounded border="~ gray/50 rounded-lg">

`ast.parse(code)` returns an AST object, `tree`, that is of type `ast.Module`.

</div>
<FancyArrow from="[data-id=ast-parse-desc] @ left" to="[data-id=ast-module-example] .line:nth-child(2) @ top" arc="-0.2" />
</div>

<div v-click>
<span data-id="ast-module-node-classes" absolute top-50 right-10 w="40%" bg-white p-4 rounded border="~ gray/50 rounded-lg">

`ast` module has node classes such as `ast.Module`, `ast.Assign`, `ast.Name`, `ast.Constant`, `ast.BinOp`, and `ast.Add`.

</span>
<FancyArrow from="[data-id=ast-module-node-classes] @ left" to="[data-id=ast-module-example] .line:nth-child(4) @ right" arc="-0.2" />
<FancyArrow from="[data-id=ast-module-node-classes] @ left" to="[data-id=ast-module-example] .line:nth-child(6) @ right" arc="-0.2" />
<FancyArrow from="[data-id=ast-module-node-classes] @ left" to="[data-id=ast-module-example] .line:nth-child(8) @ top" arc="-0.2" />
<FancyArrow from="[data-id=ast-module-node-classes] @ left" to="[data-id=ast-module-example] .line:nth-child(9) @ right" arc="-0.2" />
<FancyArrow from="[data-id=ast-module-node-classes] @ left" to="[data-id=ast-module-example] .line:nth-child(10) @ (70%,0)" arc="-0.2" />
<FancyArrow from="[data-id=ast-module-node-classes] @ left" to="[data-id=ast-module-example] .line:nth-child(11) @ (90%,0)" arc="-0.2" />
<FancyArrow from="[data-id=ast-module-node-classes] @ left" to="[data-id=ast-module-example] .line:nth-child(12) @ (70%,0)" arc="-0.2" />
</div>

</div>

---

# AST transformation

<div grid="~ cols-3" gap-4 mt-16>

<Modal>
  <template #title>
    <span data-id="modal-python-code">Python code</span>
  </template>

```py
a = 1
x = a + 2
print(x)
```
</Modal>

<Modal v-click="1">
  <template #title>
    <span data-id="modal-ast">
      AST
    </span>
  </template>

<div relative overflow-hidden>

````md magic-move {at: 5, 'data-id': 'ast-mod-shiki-move'}

```
...
BinOp(
    left=Name(id='a', ctx=Load()),
    op=Add(),
    right=Constant(value=2))
...
```

``` {*}{maxHeight:'200px'}
...
BinOp(
    left=Name(id='a', ctx=Load()),
    op=Mult(),
    right=Constant(value=2))
...
```

````

</div>

</Modal>

<Modal v-click="2">
  <template #title>
    <span data-id="modal-bytecode">
    Byte code
    </span>
  </template>

````md magic-move {'data-id': 'codeblock-bytecode', at: 6}

```
...
LOAD_NAME     0 (a)
LOAD_CONST    1 (2)
BINARY_OP     0 (+)
STORE_NAME    1 (x)
...
```

```
...
LOAD_NAME     0 (a)
LOAD_CONST    1 (2)
BINARY_OP     5 (*)
STORE_NAME    1 (x)
...
```

````

</Modal>

</div>

<FancyArrow from="[data-id=modal-python-code] @ right" to="[data-id=modal-ast] @ left" arc="0.6" v-click="1">

`ast.parse(code)`

</FancyArrow>

<FancyArrow from="[data-id=modal-ast] @ right" to="[data-id=modal-bytecode] @ left" arc="0.35" v-click="2">

`compile(tree)`

</FancyArrow>

<div mt-20 v-click="3">

````md magic-move {'data-id': 'ast-transform-sample-result', at: 7}
```
3
```

```
2
```

````

</div>

<FancyArrow from="[data-id=codeblock-bytecode] @ bottom" to="[data-id=ast-transform-sample-result] @ top" v-click="3">

`exec(bytecode)`

</FancyArrow>

<div v-click="4">
<span data-id="transform-node-desc" absolute top-90 left-30>
Transform this node in the AST...
</span>
<FancyArrow from="[data-id=transform-node-desc]" to="[data-id=ast-mod-shiki-move] @ (20%,55%)" color="red" arc="0.3" />
</div>

<div v-click="8">
<span data-id="result-change-desc" absolute top-110 left-40>
Program behavior is changed<br>without modifying the source code.
</span>
<FancyArrow from="[data-id=result-change-desc] @ left" to="[data-id=ast-transform-sample-result] @ (3%,100%)" color="red" arc="0.3" />
</div>

---

# AST transformation in action

<div flex="~ row" w="100%">

<div grow>

<div>

`add.py`

<<< @/samples/py/add.py py {*}

</div>

<div v-click="1" mt-2>

```shell
❯ python add.py
2 + 5 = 7
2 + 5 = 7
```

</div>

</div>

<div v-click="2" w="60%" ml-4>

<p>
Custom Python runner:
<code transition duration-500>
<template v-if="$clicks<3">
run_noop.py
</template>
<template v-else>
run_add_as_mul.py
</template>
</code>
</p>

<div overflow-hidden>

````md magic-move {at: 3}

<<< @/samples/py/run_noop.py py

```py {*|10}
#!/usr/bin/env python3
import sys
import ast

with open(sys.argv[1]) as f:
    code = f.read()

tree = ast.parse(code)

transformed_tree = transform_tree(tree)

bytecode = compile(transformed_tree, filename="<ast>", mode="exec")

exec(bytecode)
```

````

</div>

<div mt-2>

````md magic-move {at: 3}

```shell
❯ ./run_noop.py add.py
2 + 5 = 7
2 + 5 = 7
```

```shell
❯ ./run_add_as_mul.py add.py
2 + 5 = 10
2 + 5 = 10
```

````

</div>

</div>

</div>

---

# `ast.NodeTransformer`

```py {12-14|1-9|*}
import ast


class AddToMulTransformer(ast.NodeTransformer):
    def visit_BinOp(self, node):
        self.generic_visit(node)
        if isinstance(node.op, ast.Add):
            node.op = ast.Mult()
        return node


def transform_tree(tree):
    transformer = AddToMulTransformer()
    return transformer.visit(tree)
```

---

# `ast.NodeVisitor`

---

# Metaprogramming!

- Don't shoot yourself in the foot.

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

<div>

Pyodide executes Python code in WebAssembly, which has a different nature.

- Single-threaded
- Browser's event loop

-> Some Python features do not work as expected.

https://pyodide.org/en/stable/usage/wasm-constraints.html

-> We will focus on async-related features.

</div>

---

# Example 1: `asyncio.run()`

<div grid="~ cols-2" gap-4>

<div>

## Original

```py {*|6}{at: 3, 'data-id': 'asyncio-run-orig'}
import asyncio

async def fn():
    ...

asyncio.run(fn())
```

<div v-click>

```
Traceback (most recent call last):
  ...
  File "/lib/python311.zip/asyncio/runners.py", line 186, in run
    raise RuntimeError(
RuntimeError: asyncio.run() cannot be called from a running event loop
```

</div>

</div>

<div>

<div v-click>

## Fixed

```py {*|6}{at: 3, 'data-id': 'asyncio-run-await'}
import asyncio

async def fn():
    ...

await fn()
```

</div>

<div v-click="4">

- Top-level `await`

</div>

</div>

</div>

<FancyArrow from="[data-id=asyncio-run-orig] .line:nth-child(6) @ topright" to="[data-id=asyncio-run-await] .line:nth-child(6) @ topleft" arc="0.2" v-click="3" color="blue" />

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

# Motivation

- We don't want to rewrite the code.
- Once you write Python code for Streamlit (Python),<br>
  it should work on Stlite (Pyodide).

---
layout: section
---

<h1>
AST transformation<br>
to the rescue
</h1>

---
hide: true
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

# Case 1: `asyncio.run(coro())` → `await coro()`

<div :class="$clicks >= 2 ? 'translate-y--16' : ''" duration-100>

<div grid="~ cols-2" gap-4 v-click.hide="2">

```py
asyncio.run(coro())
```

```py
await coro()
```

</div>

<div grid="~ cols-2" gap-4>

``` {*|7-10}{at:1, 'data-id': 'asyncio-run-ast-orig'}
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

``` {*|2-5}{at:1, 'data-id': 'asyncio-run-ast-fixed'}
Await(
    value=Call(
        func=Name(id='coro', ctx=Load()),
        args=[
            Name(id='arg', ctx=Load())]))
```

</div>

<FancyArrow
  v-click="1"
  v-click.hide="2"
  from="[data-id=asyncio-run-ast-orig] .line:nth-child(7) @ right"
  to="[data-id=asyncio-run-ast-fixed] .line:nth-child(2) @ (60%,50%)"
/>

<div v-click="2">

```py
def transform_asyncio_run(node):
    return ast.Await(
        value=node.args[0],
    )
```

</div>

</div>

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
