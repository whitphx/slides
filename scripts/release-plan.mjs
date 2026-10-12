#!/usr/bin/env node
// Finds the workspace packages that are published to npm (those not marked "private").
//
//   node scripts/release-plan.mjs          JSON array of the packages whose current version
//                                          is not on npm yet.
//   node scripts/release-plan.mjs --check  Checks each package's release metadata and exits
//                                          non-zero on problems; used on pull requests.
//   node scripts/release-plan.mjs --dirs   The packages' directories, one per line.
//   node scripts/release-plan.mjs --sync-plugin-versions
//                                          Copies each package's version into its
//                                          .claude-plugin/plugin.json; runs after `changeset version`.
//
// Uses only Node and npm, so it runs before `pnpm install`.

import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'

const root = new URL('..', import.meta.url).pathname
const repo = 'whitphx/slides'

function workspaceDirs() {
  const globs = [...readFileSync(join(root, 'pnpm-workspace.yaml'), 'utf-8').matchAll(/^\s*-\s*['"]?([^'"\s]+)['"]?\s*$/gm)].map(m => m[1])
  return globs.flatMap((glob) => {
    if (!glob.endsWith('/*') || glob.slice(0, -2).includes('*'))
      throw new Error(`Unsupported workspace pattern: ${glob}`)
    const parent = glob.slice(0, -2)
    return readdirSync(join(root, parent), { withFileTypes: true })
      .filter(entry => entry.isDirectory() && existsSync(join(root, parent, entry.name, 'package.json')))
      .map(entry => `${parent}/${entry.name}`)
  })
}

function publicPackages() {
  return workspaceDirs()
    .map(dir => ({ dir, pkg: JSON.parse(readFileSync(join(root, dir, 'package.json'), 'utf-8')) }))
    .filter(({ pkg }) => !pkg.private)
    .map(({ dir, pkg }) => ({ name: pkg.name, version: pkg.version, dir, tag: `${pkg.name}@${pkg.version}`, pkg }))
}

function run(command, args) {
  try {
    return { ok: true, stdout: execFileSync(command, args, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] }) }
  }
  catch (error) {
    return { ok: false, stdout: String(error.stdout ?? ''), stderr: String(error.stderr ?? '') }
  }
}

function onNpm({ name, version }) {
  const result = run('npm', ['view', `${name}@${version}`, 'version', '--json'])
  if (result.ok)
    return result.stdout.trim() !== ''
  if (/E404/.test(result.stdout + result.stderr))
    return false
  throw new Error(`npm view ${name}@${version} failed:\n${result.stderr}`)
}

function plan() {
  const pending = publicPackages()
    .filter(p => !onNpm(p))
    .map(({ name, version, dir, tag }) => ({ name, version, dir, tag }))
  console.log(JSON.stringify(pending))
}

// npm's provenance check needs `repository` to name this repository, and the release
// workflow takes the release notes from the CHANGELOG.md that `changeset version` writes.
function check() {
  const problems = []
  for (const { name, version, dir, pkg } of publicPackages()) {
    const where = `${dir}/package.json (${name})`
    if (!/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(version ?? ''))
      problems.push(`${where}: version "${version}" is not a release version`)
    if (pkg.repository?.url !== `git+https://github.com/${repo}.git` || pkg.repository?.directory !== dir)
      problems.push(`${where}: "repository" must be { "type": "git", "url": "git+https://github.com/${repo}.git", "directory": "${dir}" }`)
    if (!pkg.license)
      problems.push(`${where}: no "license"`)
    if (!existsSync(join(root, dir, 'LICENSE')))
      problems.push(`${dir}: no LICENSE file`)
    if (!pkg.files?.includes('CHANGELOG.md'))
      problems.push(`${where}: "files" must include CHANGELOG.md`)
    const plugin = join(root, dir, '.claude-plugin', 'plugin.json')
    if (existsSync(plugin)) {
      const pluginVersion = JSON.parse(readFileSync(plugin, 'utf-8')).version
      if (pluginVersion !== version)
        problems.push(`${dir}/.claude-plugin/plugin.json: version ${pluginVersion} differs from package.json's ${version}`)
    }
  }
  if (problems.length) {
    console.error(problems.map(p => `- ${p}`).join('\n'))
    process.exit(1)
  }
  console.log(`Release metadata OK: ${publicPackages().map(p => p.tag).join(', ') || 'no public packages'}`)
}

function syncPluginVersions() {
  for (const { dir, version } of publicPackages()) {
    const plugin = join(root, dir, '.claude-plugin', 'plugin.json')
    if (!existsSync(plugin))
      continue
    const text = readFileSync(plugin, 'utf-8')
    // Edits the one field, keeping the file's formatting.
    const updated = text.replace(/("version"\s*:\s*)"[^"]*"/, `$1${JSON.stringify(version)}`)
    if (updated !== text) {
      writeFileSync(plugin, updated)
      console.log(`${dir}/.claude-plugin/plugin.json: version ${version}`)
    }
  }
}

if (process.argv.includes('--sync-plugin-versions'))
  syncPluginVersions()
else if (process.argv.includes('--check'))
  check()
else if (process.argv.includes('--dirs'))
  console.log(publicPackages().map(p => p.dir).join('\n'))
else
  plan()
