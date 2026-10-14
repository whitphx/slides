import type { ReviewAnnotationsClientConfig } from './src/types'

declare global {
  // Defined by setup/vite-plugins.ts.
  const __SLIDEV_REVIEW_ANNOTATIONS__: ReviewAnnotationsClientConfig
  const __SLIDEV_REVIEW_ANNOTATIONS_ENABLED__: boolean
}

export {}
