#!/usr/bin/env node
// Downloads cn-font-split's native library (used to subset fonts in deck builds, via
// slidev-addon-anipres) for each installed cn-font-split version.
//
// cn-font-split's own install script fetches the *latest* release, looked up through the
// third-party ungh.cc. When that lookup fails, the download URL has no version and 404s,
// and "latest" changes under us. So its install script is skipped
// (pnpm.ignoredBuiltDependencies) and this runs from the root `postinstall`, asking for a
// listed release explicitly.
//
// Upstream fix: https://github.com/KonghaYao/cn-font-split/pull/219 (fails clearly instead of
// reporting success, and adds CN_FONT_SPLIT_VERSION to pin the release). Once a release with
// it is out, this script and the ignoredBuiltDependencies entry can go: let cn-font-split's
// own install script run, with CN_FONT_SPLIT_VERSION set to the release listed below.

import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'

// npm version of cn-font-split -> GitHub release with its native library: the newest
// release published before that npm version (7.6.8 is the last release with libraries).
const BINARY_RELEASES = {
  '7.4.3': '7.6.8',
}

const store = new URL('../node_modules/.pnpm', import.meta.url).pathname
const installs = existsSync(store)
  ? readdirSync(store).filter(name => name.startsWith('cn-font-split@'))
  : []

let failed = false
for (const entry of installs) {
  const dir = join(store, entry, 'node_modules', 'cn-font-split')
  const version = entry.slice('cn-font-split@'.length).split('_')[0]
  const hasLibrary = () => readdirSync(join(dir, 'dist')).some(file => file.startsWith('libffi-'))
  if (hasLibrary())
    continue
  const release = BINARY_RELEASES[version]
  if (!release) {
    console.error(`[install-cn-font-split] No native library release is listed for cn-font-split ${version}; add one to BINARY_RELEASES in scripts/install-cn-font-split.mjs.`)
    failed = true
    continue
  }
  console.log(`[install-cn-font-split] cn-font-split ${version}: downloading native library ${release}`)
  spawnSync(process.execPath, ['dist/cli.js', 'i', `default@${release}`], { cwd: dir, stdio: 'inherit' })
  // cn-font-split's script reports success even when the download fails, so check the file.
  if (!hasLibrary()) {
    console.error(`[install-cn-font-split] cn-font-split ${version}: the native library was not downloaded.`)
    failed = true
  }
}
if (failed)
  process.exit(1)
