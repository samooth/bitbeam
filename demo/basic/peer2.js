const BitBeam = require('../../index.js')
const bsv = require('bsv2')

const bobPrivKey = bsv.PrivKey.fromString("L1H2Zz694soUr9T3ygEdDi57VKnKW6yhKYa4ZL1z8KWc7Cz2QwDH")
console.log("Bob PrivKey: ",bobPrivKey.toString())

const alicePubKey = bsv.PubKey.fromPrivKey(bsv.PrivKey.fromString("L2viUUvqF7WzxMNTExSa277STdSRQX2vYpWE4pnxWuunHAoiLHsb"));
console.log("Alice PubKey: ", alicePubKey.toString())

const dh = bsv.Ecies.ivkEkM(bobPrivKey, alicePubKey)

// key is 32-byte unique passphrase calculated with DH
// to find the other side of your pipe.
// once the other peer is discovered it is used to derive a noise keypair as well.

const key = BitBeam.toBase32(dh.kM)

const beam = new BitBeam( { from: bobPrivKey, to: alicePubKey }, false )

beam.on("connected",(peer)=>{
	console.log("connected:", peer)
})

	beam.on("remote-address",(addr)=>{
		console.log("Connection from: ",addr.host, addr.port)
	})
	beam.on("close",(peer)=>{
		console.log("disconnected")
		console.log(peer)
	})
	beam.on("error",(error)=>{
		console.log("error",error?.code)		

	})
// to generate a passphrase, leave the constructor empty and hyperbeam will generate one for you
// const beam = new Hyperbeam()
// beam.key // <-- your passphrase
console.log("Key: ",beam.key)
// make a little chat app
process.stdin.pipe(beam).pipe(process.stdout)
