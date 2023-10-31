const BitBeam = require('../../index.js')
const bsv = require('bsv2')

const alicePrivKey = bsv.PrivKey.fromString("L2viUUvqF7WzxMNTExSa277STdSRQX2vYpWE4pnxWuunHAoiLHsb")
console.log("Alice PrivKey: ",alicePrivKey.toString())
const bobPubKey = bsv.PubKey.fromPrivKey(bsv.PrivKey.fromString("L1H2Zz694soUr9T3ygEdDi57VKnKW6yhKYa4ZL1z8KWc7Cz2QwDH"));
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
