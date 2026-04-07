const BitBeam = require('./index.js')
const DHT = require('@hyperswarm/dht')
const b4a = require('b4a')

async function run() {
  console.log('Creating bootstrapper...')
  const bootstrapper = new DHT({ bootstrap: [], ephemeral: false })
  await bootstrapper.ready()
  console.log('Bootstrapper ready on', bootstrapper.address().port)
  const bootstrap = [`127.0.0.1:${bootstrapper.address().port}`]

  console.log('Creating DHTs...')
  const dht1 = new DHT({ bootstrap, ephemeral: false })
  const dht2 = new DHT({ bootstrap, ephemeral: false })
  await dht1.ready()
  console.log('DHT1 ready')
  await dht2.ready()
  console.log('DHT2 ready')

  console.log('Creating Beam1...')
  const beam1 = new BitBeam({ dht: dht1 })
  beam1.resume()
  await new Promise(resolve => beam1.once('remote-address', resolve))
  console.log('beam1 ready')
  await new Promise(resolve => setTimeout(resolve, 2000))

  const beam2 = new BitBeam(beam1.key, { dht: dht2, announce: false })
  
  const msg1 = b4a.from('hello')
  beam1.write(msg1)

  beam2.on('data', data => {
      console.log('beam2 got data:', data.toString())
      process.exit(0)
  })
}

run().catch(console.error)
