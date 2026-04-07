const BitBeam = require('../../index.js')
const { PrivateKey, PublicKey } = require('@bsv/sdk')

const alicePrivKey = PrivateKey.fromWif("L2viUUvqF7WzxMNTExSa277STdSRQX2vYpWE4pnxWuunHAoiLHsb")
const bobPubKey = PublicKey.fromString("03516b6b5a609b35f22bdfc62306744f8663e569c3edd3e55860af086d95a8e499")

console.log("Alice PrivKey: ", alicePrivKey.toWif())
console.log("Bob PubKey", bobPubKey.toString())

// key is 32-byte unique passphrase calculated using DH
// to find the other side of your pipe.
// once the other peer is discovered it is used to derive a noise keypair as well.

const beam = new BitBeam({ from: alicePrivKey, to: bobPubKey })
beam.on("connected",()=>{
	console.log("Connected");
})
beam.on("remote-address",(addr)=>{
	console.log("Connection from: ",addr.host, addr.port);
})

// to generate a passphrase, leave the constructor empty and hyperbeam will generate one for you
// const beam = new Hyperbeam()
// beam.key // <-- your passphrase
console.log("key: ",beam.key)

const printMsg=(msg)=>{
	return console.log(">"+msg+"\r\n")
}
process.stdin.pipe(beam,printMsg).pipe(process.stdout)
