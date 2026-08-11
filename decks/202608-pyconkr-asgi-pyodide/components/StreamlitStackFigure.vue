<script setup>
defineProps({
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
        <div class="border border-violet-400/40 rounded-lg p-1.5 bg-violet-400/5">
          <div class="text-center op60 mb-1">🐍 CPython</div>
          <div class="border border-emerald-400/40 rounded-lg p-1.5 bg-emerald-400/10 text-center text-sm">
            🐍 <b>Your app script</b>
          </div>
          <div class="text-center op60 my-0.5">⇅ runs your script</div>
          <div class="border border-amber-400/40 rounded-lg p-1.5 bg-amber-400/10 text-center leading-tight">
            🎈 <span class="text-sm"><b>Streamlit server</b></span><br>
            <span class="op80">ScriptRunner &amp; app state</span>
          </div>
          <div class="text-center op60 my-0.5">⇅ <code>scope</code> · <code>receive</code> · <code>send</code></div>
          <div class="border border-sky-400/40 rounded-lg p-1.5 bg-sky-400/10 text-center leading-tight">
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
