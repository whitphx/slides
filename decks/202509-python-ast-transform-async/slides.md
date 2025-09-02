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

# Pyodide
https://pyodide.org/

<div flex justify-center items-center h="80">

<a href="https://pyodide.org/" target="_blank" rel="noopener noreferrer">
  <img src="/pyodide.png" alt="Pyodide" max-h="100%" object-cover m-auto>
</a>

</div>

---

# Pyodide
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

# Pyodide runs Python code in browsers


## It has some limitations

TODO

---

# The problem: interoperability

## Example 1: `asyncio.run()`

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

# The problem: interoperability

## Example 2: `time.sleep()`

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

# AST transformation to the rescue

---

# Python code execution flow

---

# `ast` module

---

# Metaprogramming!

---

# Background: Pyodide-based Web UI framework

---

# Case1: `asyncio.run(coro())` -> `await coro()`

---

# Case2: `time.sleep()` -> `asyncio.sleep()`

---

# Case3: `def fn(): ...; fn()` -> `async def fn(): ...; await fn()`

---

# Test cases
