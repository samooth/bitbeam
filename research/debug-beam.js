const BitBeam = require('./index.js')
const beam = new BitBeam()
beam.on('remote-address', (addr) => {
    console.log('Address:', addr)
    process.exit(0)
})
console.log('Starting beam...')
beam.resume()
