const BitBeam = require('../../index.js')
const bsv = require('bsv2')
const {
    spawn
} = require('child_process')


const bobPrivKey = bsv.PrivKey.fromString("L1H2Zz694soUr9T3ygEdDi57VKnKW6yhKYa4ZL1z8KWc7Cz2QwDH")
console.log("Bob PrivKey: ", bobPrivKey.toString())

const alicePubKey = bsv.PubKey.fromPrivKey(bsv.PrivKey.fromString("L2viUUvqF7WzxMNTExSa277STdSRQX2vYpWE4pnxWuunHAoiLHsb"));
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