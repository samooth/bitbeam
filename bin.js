#!/usr/bin/env node

const bitbeam = require('./')

if (process.argv.includes('-h') || process.argv.includes('--help')) {
  console.error('Usage: bitbeam [passphrase]')
  console.error('')
  console.error('  Creates a 1-1 end-to-end encrypted network pipe.')
  console.error('  If a passphrase is not supplied, will create a new phrase and begin listening.')
  process.exit(1)
}

let beam
try {
  beam = new bitbeam(process.argv[2], process.argv.includes('-r'))
} catch (e) {
  if (e.constructor.name === 'PassphraseError') {
    console.error(e.message)
    console.error('(If you are attempting to create a new pipe, do not provide a phrase and bitbeam will generate one for you.)')
    process.exit(1)
  } else {
    throw e
  }
}

if (beam.announce) {
  console.error('[bitbeam] Run bitbeam ' + beam.key + ' to connect')
  console.error('[bitbeam] To restart this side of the pipe with the same key add -r to the above')
} else {
  console.error('[bitbeam] Connecting pipe...')
}

beam.on('remote-address', function ({ host, port }) {
  if (!host) console.error('[bitbeam] Could not detect remote address')
  else console.error('[bitbeam] Joined the DHT - remote address is ' + host + ':' + port)
})

beam.on('connected', function () {
  console.error('[bitbeam] Success! Encrypted tunnel established to remote peer')
})

beam.on('error', function (e) {
  console.error('[bitbeam] Error:', e.message)
  closeASAP()
})

beam.on('end', () => beam.end())

process.stdin.pipe(beam).pipe(process.stdout)
if (typeof process.stdin.unref === 'function') process.stdin.unref()

process.once('SIGINT', () => {
  if (!beam.connected) closeASAP()
  else beam.end()
})

function closeASAP () {
  console.error('[bitbeam] Shutting down beam...')

  const timeout = setTimeout(() => process.exit(1), 2000)
  beam.destroy()
  beam.on('close', function () {
    clearTimeout(timeout)
  })
}
