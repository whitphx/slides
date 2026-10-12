import type { AnnotateClientConfig } from './src/types'

declare global {
  // Defined by setup/vite-plugins.ts.
  const __SLIDEV_ANNOTATE__: AnnotateClientConfig
  const __SLIDEV_ANNOTATE_ENABLED__: boolean
}

export {}
