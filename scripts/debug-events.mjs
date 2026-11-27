import { existsSync, readFileSync, watchFile } from 'node:fs'
import process from 'node:process'

const args = process.argv.slice(2)
const follow = args.includes('-f') || args.includes('--follow')
const showAll = args.includes('--all')
const file = args.find(arg => !arg.startsWith('-')) || '.tmp/vois-webview-debug/events.jsonl'

let printed = 0

function tokenState(url) {
  try {
    const token = new URL(url).searchParams.get('token')
    if (token === null)
      return 'token=missing'
    return token ? `token=set(${token.length})` : 'token=EMPTY'
  }
  catch {
    return ''
  }
}

function formatValue(value) {
  if (typeof value === 'string')
    return value
  try {
    return JSON.stringify(value)
  }
  catch {
    return String(value)
  }
}

function redact(value) {
  return String(value).replace(/password=[^&]*/g, 'password=***')
}

function apiResult(body) {
  if (!body || typeof body !== 'object')
    return ''
  return [body.errcode, body.errmsg].filter(value => value !== undefined).join(' ')
}

function format(event) {
  const time = new Date(event.receivedAt).toLocaleTimeString('en-GB', { hour12: false })

  if (event.type === 'lifecycle') {
    const visible = event.visible === false ? ' (background)' : ''
    return `${time} ${event.event.toUpperCase().padEnd(8)} ${redact(event.url)}${visible}`
  }

  if (event.type === 'error')
    return `${time} ERROR    ${event.message}`

  if (event.type === 'console') {
    if (event.level === 'log')
      return null
    return `${time} ${event.level.toUpperCase().padEnd(8)} ${formatValue(event.args).slice(0, 240)}`
  }

  if (event.type === 'network') {
    let url
    try {
      url = new URL(event.url)
    }
    catch {
      return null
    }
    if (!showAll && !url.pathname.startsWith('/v2/'))
      return null
    const token = tokenState(event.url)
    url.searchParams.delete('token')
    const status = event.error ? 'ERR' : String(event.status ?? '-')
    return [
      time,
      event.method.padEnd(4),
      status.padEnd(3),
      `${String(event.duration).padStart(4)}ms`,
      token.padEnd(13),
      apiResult(event.responseBody).padEnd(18),
      redact(url.pathname + url.search),
    ].join(' ')
  }

  return null
}

function render() {
  if (!existsSync(file)) {
    console.error(`Debug log not found: ${file}`)
    return
  }

  const lines = readFileSync(file, 'utf8').split('\n')
  for (; printed < lines.length; printed++) {
    const line = lines[printed].trim()
    if (!line)
      continue
    try {
      const output = format(JSON.parse(line))
      if (output)
        console.log(output)
    }
    catch {
      printed--
      return
    }
  }
}

render()

if (follow)
  watchFile(file, { interval: 300 }, render)
