<script setup>
defineProps({
  // Ring what both columns share — your script, Streamlit itself, and the interface
  // between them and the server half — so the swapped boxes below read as the change.
  highlight: { type: Boolean, default: false },
  // Then hand the ring over to the two rows that do move, the ASGI caller and the
  // Python runtime under it: the shared rows go quiet so the swap reads alone.
  highlightSwapped: { type: Boolean, default: false },
  // Reserve the space Stlite spends on its Web Worker frame, so the runtime
  // frames line up when the two are shown side by side.
  aligned: { type: Boolean, default: false },
});
</script>

<template>
  <div class="w-full max-w-130 mx-auto text-xs h-full flex flex-col">
    <div class="border border-gray-400/40 rounded-xl p-1.5 bg-gray-400/5">
      <div class="text-center op60 mb-1">🖥️ Server machine</div>
      <div class="rounded-lg p-1.5" :class="aligned ? 'border border-transparent' : ''">
        <div v-if="aligned" class="text-center op0 mb-1" aria-hidden="true">&nbsp;</div>
        <div
          class="rounded-lg p-1.5 border transition-all duration-700 delay-[250ms]"
          :class="highlightSwapped ? 'border-violet-400 bg-violet-400/20 ring-4 ring-violet-400/25' : 'border-violet-400/40 bg-violet-400/5'"
        >
          <div class="text-center op60 mb-1">🐍 CPython</div>
          <div class="grid grid-cols-2 gap-1">
            <div
              class="rounded-lg p-1.5 text-center text-sm border transition-all duration-700 delay-[250ms]"
              :class="highlight && !highlightSwapped ? 'border-emerald-400 bg-emerald-400/25 ring-4 ring-emerald-400/30' : 'border-emerald-400/40 bg-emerald-400/10'"
            >
              🐍 <b>Your script</b>
            </div>
            <div
              class="rounded-lg p-1.5 text-center text-sm border transition-all duration-700 delay-[250ms]"
              :class="highlight && !highlightSwapped ? 'border-emerald-400 bg-emerald-400/25 ring-4 ring-emerald-400/30' : 'border-emerald-400/40 bg-emerald-400/10'"
            >
              📁 <b>Static assets</b>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-1 text-center op60 my-0.5">
            <div>⇅ runs your script</div>
            <div>↓ serves</div>
          </div>
          <div
            class="rounded-lg p-1.5 text-center leading-tight border transition-all duration-700 delay-[250ms]"
            :class="highlight && !highlightSwapped ? 'border-amber-400 bg-amber-400/25 ring-4 ring-amber-400/30' : 'border-amber-400/40 bg-amber-400/10'"
          >
            🎈 <span class="text-sm"><b>Streamlit runtime</b></span><br>
            <span class="op80">ScriptRunner &amp; app state</span>
            <div class="mt-0.5 rounded border border-amber-400/40 bg-amber-400/10 px-1 leading-snug">
              on <b>Starlette</b> <span class="op80">— the ASGI app</span>
            </div>
          </div>
          <div
            class="text-center my-0.5 transition-all duration-700 delay-[250ms]"
            :class="highlight && !highlightSwapped ? 'op100 font-600 text-amber-700 dark:text-amber-300' : 'op60'"
          >⇅ <code>scope</code> · <code>receive</code> · <code>send</code></div>
          <div
            class="rounded-lg p-1.5 text-center leading-tight border transition-all duration-700 delay-[250ms]"
            :class="highlightSwapped ? 'border-sky-400 bg-sky-400/30 ring-4 ring-sky-400/30' : 'border-sky-400/40 bg-sky-400/10'"
          >
            🦄 <span class="text-sm"><b>Uvicorn</b></span><br>
            <span class="op80">HTTP off a TCP socket → <b>ASGI calls</b></span>
          </div>
        </div>
      </div>
    </div>
    <div class="text-center op60 my-0.5 mt-auto">⇅ HTTP + WebSocket over the network</div>
    <div class="border border-gray-400/40 rounded-xl p-1.5 bg-gray-400/5">
      <div class="text-center op60 mb-1">🌐 Browser</div>
      <div class="border border-teal-400/40 rounded-lg p-1.5 bg-teal-400/10 text-center leading-tight">
        📄 <span class="text-sm"><b>Streamlit frontend</b></span><br>
        <span class="op80">the bundled React SPA</span>
      </div>
    </div>
  </div>
</template>
