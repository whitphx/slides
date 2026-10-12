// Settings the Vite plugin passes to the browser as `__SLIDEV_ANNOTATE__`.
export interface AnnotateClientConfig {
  enabled: boolean
  // Base URL of the annotation API, e.g. "/__annotate/api" on the same origin.
  endpoint: string
  sessionId: string
  // Deck directory name.
  deck: string
  // Entry markdown file, relative to the repository root.
  entry: string
  // Absolute repository path in dev mode, empty in builds.
  repoRoot: string
  // Commit the deck was served or built from.
  revision: string
  // Whether "Send to agent" starts on its own after the reviewer stops adding notes.
  // Each reviewer can switch it in the deck; this is the default.
  autoDispatch: boolean
  // How long to wait after the last note before an automatic send.
  autoDispatchSeconds: number
}
