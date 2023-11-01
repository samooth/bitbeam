const BitBeam = require('../../index.js')
const bsv = require('bsv2')


const alicePrivKey = bsv.PrivKey.fromString("L2viUUvqF7WzxMNTExSa277STdSRQX2vYpWE4pnxWuunHAoiLHsb")
const bobPubKey = bsv.PubKey.fromString("03516b6b5a609b35f22bdfc62306744f8663e569c3edd3e55860af086d95a8e499")
console.log("Alice PrivKey: ", alicePrivKey.toString())
console.log("Bob PubKey", bobPubKey.toString())

// key is 32-byte unique passphrase calculated using DH
// to find the other side of your pipe.
// once the other peer is discovered it is used to derive a noise keypair as well.

let beam = new BitBeam({ from: alicePrivKey, to: bobPubKey })

beam.on("connected",(con)=>{
	console.log("Connected",con)
  console.error('[bitbeam] Success! Encrypted tunnel established to remote peer')
  process.stdin.pipe(beam).pipe(process.stdout)
})
beam.on("remote-address",(addr)=>{
	console.log("Connection from: ",addr.host, addr.port)
})
beam.on("close",()=>{
	console.log("[Disconnected]")
})
beam.on("error",(error)=>{
	console.log("error",error?.code)


})

// to generate a passphrase, leave the constructor empty and hyperbeam will generate one for you
// const beam = new Hyperbeam()
// beam.key // <-- your passphrase
console.log("key: ",beam.key)

// make a little chat app
	//process.stdin.pipe(beam).pipe(process.stdout)


beam.on('end', () => {
  beam.end()
})

beam.resume()
beam.pause()

process.once('SIGINT', () => {
 beam.end()
})


