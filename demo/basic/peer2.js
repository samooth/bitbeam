const BitBeam = require('../../index.js')
const { PrivateKey, PublicKey } = require('@bsv/sdk')
const {
    spawn
} = require('child_process')


const bobPrivKey = PrivateKey.fromWif("L1H2Zz694soUr9T3ygEdDi57VKnKW6yhKYa4ZL1z8KWc7Cz2QwDH")
const alicePubKey = PublicKey.fromString("025f932bd559ab31c726d096053ccc9a5d9393a79c56e039a9064401ad2b1f53d7");
console.log("Bob PrivKey: ", bobPrivKey.toWif())
console.log("Alice PubKey: ", alicePubKey.toString())


// key is 32-byte unique passphrase calculated with DH
// to find the other side of your pipe.
// once the other peer is discovered it is used to derive a noise keypair as well.

const beam = new BitBeam({
    from: bobPrivKey,
    to: alicePubKey
}, {
    announce: false
})

let record
let play

beam.on("connected", (con) => {
    console.log("Connected", con)
    console.error('[bitbeam] Success! Encrypted tunnel established to remote peer')
    process.stdin.pipe(beam).pipe(process.stdout)
})

beam.on("remote-address", (addr) => {
    console.log("Connection from: ", addr.host, addr.port)
})
beam.on("close", () => {
    console.log("disconnected")
})
beam.on("error", (error) => {
        console.log("error", error?.code)

    })
    // to generate a passphrase, leave the constructor empty and hyperbeam will generate one for you
    // const beam = new Hyperbeam()
    // beam.key // <-- your passphrase
console.log("Key: ", beam.key)
    // make a little chat app
    //process.stdin.pipe(beam).pipe(process.stdout)


beam.on('end', () => {
    beam.end()
})

beam.resume()
beam.pause()

process.once('SIGINT', () => {
    if (!beam.connected) closeASAP()
    else beam.end()
})