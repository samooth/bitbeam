const BitBeam = require('../../index.js')
const { PrivateKey, PublicKey } = require('@bsv/sdk')


const bobPrivKey = PrivateKey.fromWif("L1H2Zz694soUr9T3ygEdDi57VKnKW6yhKYa4ZL1z8KWc7Cz2QwDH")
const alicePubKey = PublicKey.fromString("025f932bd559ab31c726d096053ccc9a5d9393a79c56e039a9064401ad2b1f53d7");
console.log("Bob PrivKey: ", bobPrivKey.toWif())
console.log("Alice PubKey: ", alicePubKey.toString())

// key is 32-byte unique passphrase calculated with DH
// to find the other side of your pipe.
// once the other peer is discovered it is used to derive a noise keypair as well.

const beam = new BitBeam({ from: bobPrivKey, to: alicePubKey }, { announce: false })

beam.on("connected",(peer)=>{
	console.log("Connected", peer)
	process.stdin.pipe(beam).pipe(process.stdout)

})
beam.on("remote-address",(addr)=>{
	console.log("Connection from: ",addr.host, addr.port)
})

beam.on("error",(err)=>{
	console.log("[Error]",err.code)
})

beam.on("close",()=>{
	console.log("[Disconnected]")
})

beam.on('end', () => {
  beam.end()
})

beam.resume()
beam.pause()

// to generate a passphrase, leave the constructor empty and hyperbeam will generate one for you
// const beam = new Hyperbeam()
// beam.key // <-- your passphrase
console.log("Key: ", beam.key)
// make a little chat app

const printMsg=(msg)=>{
	return console.log(">"+msg+"\r\n")
}


process.once('SIGINT', () => {
 beam.end()
})
