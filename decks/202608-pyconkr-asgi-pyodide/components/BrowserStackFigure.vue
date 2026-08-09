<script setup>
defineProps({
  // Reserve the space the edge column spends on its Python Worker frame, so the
  // runtime frames line up when all three are shown side by side.
  aligned: { type: Boolean, default: false },
});
</script>

<template>
  <div class="w-full max-w-130 mx-auto text-sm h-full flex flex-col">
    <div class="border border-gray-400/40 rounded-xl p-2 pb-0 bg-gray-400/5 flex-1 flex flex-col">
      <div class="text-center text-xs op60 mb-1">🌐 Browser</div>
      <div class="rounded-lg p-2" :class="aligned ? 'border border-transparent' : ''">
        <div v-if="aligned" class="text-center text-xs op0 mb-1" aria-hidden="true">&nbsp;</div>
        <div class="border border-violet-400/40 rounded-lg p-2 bg-violet-400/5">
          <div class="text-center text-xs op60 mb-1">🐍 Pyodide</div>
          <div class="border border-emerald-400/40 rounded-lg p-2 bg-emerald-400/10 text-center leading-tight min-h-13">
            🐍 <b><code>app</code></b> <span class="op70">in <code>main.py</code></span><br>
            <span class="text-xs op80">ASGI application (FastAPI)</span>
          </div>
          <div class="text-center text-xs op60 my-0.5">⇅ <code>scope</code> · <code>receive</code> · <code>send</code></div>
          <div class="border border-sky-400/40 rounded-lg p-2 bg-sky-400/10 text-center leading-tight min-h-13">
            🌉 <b><code>bridge.py</code></b><br>
            <span class="text-xs op80"><code>fetch</code> from the page → <b>ASGI calls</b></span>
          </div>
        </div>
      </div>
      <div class="text-center text-xs op60 my-0.5 mt-auto">⇅ a function call — no network</div>
      <!-- Mirrors the bottom block of the other columns (frame padding + environment
           label) so the transport rows and frontend boxes land on the same lines. -->
      <div class="border border-transparent rounded-xl p-2">
        <div class="text-center text-xs op0 mb-1" aria-hidden="true">&nbsp;</div>
        <div class="border border-teal-400/40 rounded-lg p-2 bg-teal-400/10 text-center leading-tight min-h-13">
          📄 <b>Frontend page</b><br>
          <span class="text-xs op80">issues HTTP / WebSocket calls</span>
        </div>
      </div>
    </div>
  </div>
</template>
