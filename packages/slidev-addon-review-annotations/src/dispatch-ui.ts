// The "Send N notes to agent" control: a small panel at the top right of the deck that
// hands this session's unsent notes to the dispatcher, either when the reviewer presses
// the button or, with auto-send on, once they have stopped adding notes for a while.

import type { Annotation } from './afs'
import { loginUrl } from './client'
import type { Sync } from './client'
import type { ReviewAnnotationsClientConfig } from './types'

const AUTO_KEY = 'slidev-review-annotations:auto-dispatch'

function readAuto(fallback: boolean) {
  try {
    const stored = localStorage.getItem(AUTO_KEY)
    return stored === null ? fallback : stored === '1'
  }
  catch {
    return fallback
  }
}

function writeAuto(on: boolean) {
  try {
    localStorage.setItem(AUTO_KEY, on ? '1' : '0')
  }
  catch {
    // A per-browser convenience; without storage it just isn't remembered.
  }
}

export function createDispatchControl(config: ReviewAnnotationsClientConfig, sync: Pick<Sync, 'flush' | 'pending'>) {
  const api = (path: string, init?: RequestInit) => fetch(`${config.endpoint}${path}`, init)
  const sessionPath = `/sessions/${encodeURIComponent(config.sessionId)}`

  const panel = document.createElement('div')
  panel.setAttribute('role', 'group')
  panel.setAttribute('aria-label', 'Send review annotations to the agent')
  // agent-ui-annotation swallows page clicks while picking elements, except on its own
  // parts; this attribute makes it treat the panel as one of them.
  panel.setAttribute('data-annotation-toolbar', '')
  panel.style.cssText = 'position:fixed;top:12px;right:12px;z-index:2147483646;display:none;flex-direction:column;align-items:flex-end;gap:6px;'
    + 'font:13px/1.4 system-ui,sans-serif'
  const send = document.createElement('button')
  send.type = 'button'
  send.style.cssText = 'padding:8px 14px;border-radius:8px;border:1px solid #7c3aed;background:#7c3aed;color:#fff;font:inherit;font-weight:600;cursor:pointer;box-shadow:0 4px 12px rgb(0 0 0 / 15%)'
  const autoLabel = document.createElement('label')
  autoLabel.style.cssText = 'display:flex;gap:6px;align-items:center;padding:4px 8px;border-radius:6px;background:rgb(255 255 255 / 90%);color:#222;cursor:pointer'
  const auto = document.createElement('input')
  auto.type = 'checkbox'
  autoLabel.append(auto, `Send automatically ${config.autoDispatchSeconds}s after the last annotation`)
  const status = document.createElement('div')
  status.setAttribute('role', 'status')
  status.style.cssText = 'max-width:320px;padding:4px 8px;border-radius:6px;background:rgb(255 255 255 / 90%);color:#222;text-align:right'
  // Changes the toolbar made that haven't reached the server yet (offline).
  const unsaved = document.createElement('div')
  unsaved.style.cssText = status.style.cssText
  const login = document.createElement('a')
  login.textContent = 'Log in to review'
  login.style.cssText = 'padding:6px 12px;border-radius:8px;border:1px solid #7c3aed;background:rgb(255 255 255 / 90%);color:#5b21b6;font-weight:600;text-decoration:none'
  panel.append(login, send, autoLabel, unsaved, status)
  document.body.append(panel)

  let canDispatch = false
  let loggedOut = false
  let unsent = 0
  let timer: ReturnType<typeof setTimeout> | undefined
  let sending = false
  // Whether the status says a send waited for offline changes, to clear it once they're saved.
  let heldBack = false
  auto.checked = readAuto(config.autoDispatch)

  function render() {
    const waiting = sync.pending()
    panel.style.display = loggedOut || (canDispatch && (unsent > 0 || waiting > 0 || status.textContent)) ? 'flex' : 'none'
    unsaved.textContent = waiting ? `${waiting} annotation change${waiting === 1 ? ' is' : 's are'} kept in this browser until the connection is back.` : ''
    unsaved.style.display = waiting ? '' : 'none'
    login.style.display = loggedOut ? '' : 'none'
    login.href = loginUrl(config)
    autoLabel.style.display = canDispatch ? 'flex' : 'none'
    send.style.display = canDispatch && unsent + waiting > 0 ? '' : 'none'
    // Its padding and background would otherwise show as an empty box.
    status.style.display = status.textContent ? '' : 'none'
    send.disabled = sending
    // Waiting changes are mostly new annotations; the count is exact again once they are saved.
    const count = unsent + waiting
    send.textContent = sending ? 'Sending…' : `Send ${count} annotation${count === 1 ? '' : 's'} to agent`
  }

  function say(message: string, link?: string) {
    heldBack = false
    status.textContent = message
    if (link) {
      const a = document.createElement('a')
      a.href = link
      a.target = '_blank'
      a.rel = 'noopener'
      a.textContent = 'View comment'
      status.append(' ', a)
    }
    render()
  }

  async function refresh() {
    try {
      if (!canDispatch) {
        const who = await api('/whoami')
        loggedOut = who.status === 401
        canDispatch = who.ok && !!(await who.json() as { canDispatch?: boolean }).canDispatch
      }
      if (canDispatch) {
        const response = await api(`${sessionPath}/pending`)
        const pending = response.ok ? (await response.json() as { annotations: Annotation[] }).annotations : []
        unsent = pending.filter(a => !a.dispatchedAt).length
      }
    }
    catch {
      // Leave the control as it was; the toolbar shows its own notice when the server is unreachable.
    }
    render()
  }

  function schedule() {
    clearTimeout(timer)
    // With changes still waiting to be saved, this runs again once they are.
    if (!auto.checked || !unsent || sync.pending())
      return
    timer = setTimeout(dispatch, config.autoDispatchSeconds * 1000)
    say(`Sending automatically ${config.autoDispatchSeconds}s after your last annotation.`)
  }

  async function dispatch() {
    clearTimeout(timer)
    sending = true
    render()
    try {
      // Annotations made offline must reach the server before they can be sent on.
      const saved = await sync.flush()
      if (saved.pending) {
        say(saved.stopped === 'login'
          ? 'Not sent: log in again so your annotations can be saved first.'
          : `Not sent: still offline. ${auto.checked ? 'Sending' : 'Send again'} once the connection is back.`)
        heldBack = true
        return
      }
      const response = await api(`${sessionPath}/dispatch`, { method: 'POST' })
      const result = await response.json().catch(() => ({})) as { count?: number, url?: string, error?: string, retryAfterSeconds?: number }
      if (response.status === 429) {
        say(`Sent recently; ${auto.checked ? 'sending again' : 'try again'} in ${result.retryAfterSeconds}s.`)
        if (auto.checked)
          timer = setTimeout(dispatch, (result.retryAfterSeconds ?? 60) * 1000)
      }
      else if (!response.ok) {
        say(`Could not send: ${result.error ?? `HTTP ${response.status}`}`)
      }
      else {
        say(result.count ? `Sent ${result.count} annotation${result.count === 1 ? '' : 's'} to the agent.` : 'No new annotations to send.', result.url)
      }
    }
    catch {
      say('Could not reach the annotation server.')
    }
    finally {
      sending = false
      await refresh()
    }
  }

  send.addEventListener('click', dispatch)
  auto.addEventListener('change', () => {
    writeAuto(auto.checked)
    if (auto.checked)
      schedule()
    else {
      clearTimeout(timer)
      say('')
    }
  })

  void refresh()

  return {
    // Call after the toolbar saves, edits or deletes a note.
    async changed() {
      if (heldBack && !sync.pending()) {
        heldBack = false
        say('')
      }
      await refresh()
      schedule()
    },
    destroy() {
      clearTimeout(timer)
      panel.remove()
    },
  }
}
