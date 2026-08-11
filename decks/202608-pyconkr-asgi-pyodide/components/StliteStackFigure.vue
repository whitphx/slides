<script setup>
defineProps({
  // Ring what both columns share — your script, Streamlit itself, and the interface
  // between them and the server half — so the swapped boxes below read as the change.
  highlight: { type: Boolean, default: false },
});
</script>

<template>
  <div class="w-full max-w-130 mx-auto text-xs h-full flex flex-col">
    <div class="border border-gray-400/40 rounded-xl p-1.5 pb-0 bg-gray-400/5 flex-1 flex flex-col">
      <div class="text-center op60 mb-1">🌐 Browser</div>
      <div class="border border-gray-400/40 rounded-lg p-1.5 bg-gray-400/10">
        <div class="text-center op60 mb-1">⚙️ Web Worker</div>
        <div class="border border-violet-400/40 rounded-lg p-1.5 bg-violet-400/5">
          <div class="text-center op60 mb-1">🐍 Pyodide</div>
          <div class="grid grid-cols-2 gap-1">
            <div
              class="rounded-lg p-1.5 text-center text-sm border transition-all duration-700 delay-[250ms]"
              :class="highlight ? 'border-emerald-400 bg-emerald-400/25 ring-4 ring-emerald-400/30' : 'border-emerald-400/40 bg-emerald-400/10'"
            >
              🐍 <b>Your script</b>
            </div>
            <div
              class="rounded-lg p-1.5 text-center text-sm border transition-all duration-700 delay-[250ms]"
              :class="highlight ? 'border-emerald-400 bg-emerald-400/25 ring-4 ring-emerald-400/30' : 'border-emerald-400/40 bg-emerald-400/10'"
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
            :class="highlight ? 'border-amber-400 bg-amber-400/25 ring-4 ring-amber-400/30' : 'border-amber-400/40 bg-amber-400/10'"
          >
            🎈 <span class="text-sm"><b>Streamlit runtime</b></span><br>
            <span class="op80">ScriptRunner &amp; app state</span>
          </div>
          <div
            class="text-center my-0.5 transition-all duration-700 delay-[250ms]"
            :class="highlight ? 'op100 font-600 text-amber-700 dark:text-amber-300' : 'op60'"
          >⇅ <code>scope</code> · <code>receive</code> · <code>send</code></div>
          <div class="border border-sky-400/40 rounded-lg p-1.5 bg-sky-400/10 text-center leading-tight">
            🌉 <span class="text-sm"><b>Stlite's ASGI bridge</b></span><br>
            <span class="op80">browser events → <b>ASGI calls</b></span>
          </div>
        </div>
      </div>
      <div class="text-center op60 my-0.5 mt-auto">⇅ message passing (no network)</div>
      <!-- Mirrors the bottom block of the server column (frame padding + environment
           label) so the transport rows and frontend boxes land on the same lines. -->
      <div class="border border-transparent rounded-xl p-1.5">
        <div class="text-center op0 mb-1" aria-hidden="true">&nbsp;</div>
        <div class="border border-teal-400/40 rounded-lg p-1.5 bg-teal-400/10 text-center leading-tight">
          📄 <span class="text-sm"><b>Streamlit frontend</b></span><br>
          <span class="op80">the same SPA</span>
        </div>
      </div>
    </div>
  </div>
</template>
