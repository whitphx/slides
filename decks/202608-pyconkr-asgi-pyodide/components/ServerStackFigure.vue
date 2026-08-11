<script setup>
defineProps({
  // Reserve the space the other columns spend on an isolation frame (Web / Python
  // Worker), so the runtime frames line up when shown side by side.
  aligned: { type: Boolean, default: false },
  // Ring the two rows every column shares, the app and the interface it is called
  // through, so the box that does change reads as the only one.
  highlight: { type: Boolean, default: false },
});
</script>

<template>
  <div class="w-full max-w-130 mx-auto text-sm h-full flex flex-col">
    <div class="border border-gray-400/40 rounded-xl p-2 bg-gray-400/5">
      <div class="text-center text-xs op60 mb-1">🖥️ Server machine</div>
      <div class="rounded-lg p-2" :class="aligned ? 'border border-transparent' : ''">
        <div v-if="aligned" class="text-center text-xs op0 mb-1" aria-hidden="true">&nbsp;</div>
        <div class="border border-violet-400/40 rounded-lg p-2 bg-violet-400/5">
          <div class="text-center text-xs op60 mb-1">🐍 CPython</div>
          <div
            class="rounded-lg p-2 text-center leading-tight min-h-13 border transition-all duration-700 delay-[250ms]"
            :class="highlight ? 'border-emerald-400 bg-emerald-400/25 ring-4 ring-emerald-400/30' : 'border-emerald-400/40 bg-emerald-400/10'"
          >
            🐍 <b><code>app</code></b> <span class="op70">in <code>main.py</code></span><br>
            <span class="text-xs op80">ASGI application (FastAPI)</span>
          </div>
          <div
            class="text-center text-xs my-0.5 transition-all duration-700 delay-[250ms]"
            :class="highlight ? 'op100 font-600 text-emerald-700 dark:text-emerald-300' : 'op60'"
          >⇅ <code>scope</code> · <code>receive</code> · <code>send</code></div>
          <div class="border border-sky-400/40 rounded-lg p-2 bg-sky-400/10 text-center leading-tight min-h-13">
            🦄 <b>Uvicorn</b><br>
            <span class="text-xs op80">HTTP off a TCP socket → <b>ASGI calls</b></span>
          </div>
        </div>
      </div>
    </div>
    <div class="text-center text-xs op60 my-0.5 mt-auto">⇅ HTTP over the network</div>
    <div class="border border-gray-400/40 rounded-xl p-2 bg-gray-400/5">
      <div class="text-center text-xs op60 mb-1">🌐 Browser</div>
      <div class="border border-teal-400/40 rounded-lg p-2 bg-teal-400/10 text-center leading-tight min-h-13">
        📄 <b>Frontend page</b><br>
        <span class="text-xs op80">issues HTTP / WebSocket calls</span>
      </div>
    </div>
  </div>
</template>
