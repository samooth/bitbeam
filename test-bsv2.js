const test = require('brittle')
const BitBeam = require('./')
const DHT = require('spacedht')
const bsv = require('bsv2')
const b4a = require('b4a')

async function createDHTs (t) {
  const bootstrapper = new DHT({ bootstrap: [], ephemeral: false })
  await bootstrapper.ready()
  const bootstrap = [`127.0.0.1:${bootstrapper.address().port}`]

  const dht1 = new DHT({ bootstrap, ephemeral: false })
  const dht2 = new DHT({ bootstrap, ephemeral: false })
  await dht1.ready()
  await dht2.ready()

  t.teardown(async () => {
    await dht1.destroy()
    await dht2.destroy()
    await bootstrapper.destroy()
  })

  return [dht1, dht2]
}

test('basic transfer (bsv2)', async t => {
  const [dht1, dht2] = await createDHTs(t)
  const beam1 = new BitBeam({ dht: dht1 })
  beam1.resume()
  
  await new Promise(resolve => beam1.once('remote-address', resolve))
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  const beam2 = new BitBeam(beam1.key, { dht: dht2, announce: false })
  beam2.resume()

  const msg1 = b4a.from('hello')
  const msg2 = b4a.from('world')

  const p = new Promise((resolve, reject) => {
    beam2.once('data', data => {
      t.alike(data, msg1, 'beam2 received msg1')
      beam2.write(msg2)
      resolve()
    })
    setTimeout(() => reject(new Error('beam2 timeout')), 15000)
  })

  const p2 = new Promise((resolve, reject) => {
    beam1.once('data', data => {
      t.alike(data, msg2, 'beam1 received msg2')
      resolve()
    })
    setTimeout(() => reject(new Error('beam1 timeout')), 15000)
  })

  beam1.write(msg1)

  await Promise.all([p, p2])

  await beam1.destroy()
  await beam2.destroy()
})

test('transfer with derived keys (bsv2)', async t => {
  const [dht1, dht2] = await createDHTs(t)

  const alicePrivKey = bsv.PrivKey.fromRandom()
  const alicePubKey = bsv.PubKey.fromPrivKey(alicePrivKey)

  const bobPrivKey = bsv.PrivKey.fromRandom()
  const bobPubKey = bsv.PubKey.fromPrivKey(bobPrivKey)

  const beam1 = new BitBeam({ from: alicePrivKey, to: bobPubKey }, { dht: dht1 })
  beam1.resume()
  await new Promise(resolve => beam1.once('remote-address', resolve))
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  const beam2 = new BitBeam({ from: bobPrivKey, to: alicePubKey }, { dht: dht2, announce: false })
  beam2.resume()

  t.is(beam1.key, beam2.key, 'keys are derived correctly and match')

  const msg = b4a.from('secret message')
  
  const p = new Promise((resolve, reject) => {
    beam2.once('data', data => {
      t.alike(data, msg, 'received secret message')
      resolve()
    })
    setTimeout(() => reject(new Error('derived key timeout')), 15000)
  })

  beam1.write(msg)
  await p

  await beam1.destroy()
  await beam2.destroy()
})

test('different contexts result in different keys (bsv2)', async t => {
  const alicePrivKey = bsv.PrivKey.fromRandom()
  const bobPubKey = bsv.PubKey.fromPrivKey(bsv.PrivKey.fromRandom())

  const beam1 = new BitBeam({ from: alicePrivKey, to: bobPubKey }, { context: 'app1' })
  const beam2 = new BitBeam({ from: alicePrivKey, to: bobPubKey }, { context: 'app2' })

  t.not(beam1.key, beam2.key, 'different contexts yield different keys')
})
