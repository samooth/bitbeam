const BitBeam = require('../../index.js')
const bsv = require('bsv')

const alicePrivKey = bsv.PrivKey.fromString("L2viUUvqF7WzxMNTExSa277STdSRQX2vYpWE4pnxWuunHAoiLHsb")
console.log("Alice PrivKey: ",alicePrivKey.toString())
const bobPubKey = bsv.PubKey.fromPrivKey(bsv.PrivKey.fromString("L1H2Zz694soUr9T3ygEdDi57VKnKW6yhKYa4ZL1z8KWc7Cz2QwDH"));
console.log("Bob PubKey", bobPubKey.toString())
// key is 32-byte unique passphrase calculated using DH
// to find the other side of your pipe.
// once the other peer is discovered it is used to derive a noise keypair as well.

const beam = new BitBeam({ from: alicePrivKey, to: bobPubKey })

// to generate a passphrase, leave the constructor empty and hyperbeam will generate one for you
// const beam = new Hyperbeam()
// beam.key // <-- your passphrase
console.log("key: ",beam.key)

// make a little chat app
process.stdin.pipe(beam).pipe(process.stdout)
