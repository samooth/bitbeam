const BitBeam = require('../../index.js')
const bsv = require('bsv')
const b32 = require('hi-base32')

const bobPrivKey = bsv.PrivKey.fromString("L1H2Zz694soUr9T3ygEdDi57VKnKW6yhKYa4ZL1z8KWc7Cz2QwDH")
console.log("Bob PrivKey: ",bobPrivKey.toString())

const alicePubKey = bsv.PubKey.fromPrivKey(bsv.PrivKey.fromString("L2viUUvqF7WzxMNTExSa277STdSRQX2vYpWE4pnxWuunHAoiLHsb"));
console.log("Alice PubKey: ", alicePubKey.toString())

const dh = bsv.Ecies.ivkEkM(bobPrivKey, alicePubKey)

// key is 32-byte unique passphrase calculated with DH
// to find the other side of your pipe.
// once the other peer is discovered it is used to derive a noise keypair as well.

const key = b32.encode(dh.kM).replace(/=/g, '').toLowerCase()

const beam = new BitBeam( key )

// to generate a passphrase, leave the constructor empty and hyperbeam will generate one for you
// const beam = new Hyperbeam()
// beam.key // <-- your passphrase
console.log("Key: ",beam.key)
// make a little chat app

const printMsg=(msg)=>{
	return console.log(">"+msg+"\r\n")
}
process.stdin.pipe(beam).pipe(process.stdout)
