const { PrivateKey } = require('@bsv/sdk')

const alicePriv = PrivateKey.fromRandom()
const alicePub = alicePriv.toPublicKey()

const bobPriv = PrivateKey.fromRandom()
const bobPub = bobPriv.toPublicKey()

const sharedAlice = alicePriv.deriveSharedSecret(bobPub)
const sharedBob = bobPriv.deriveSharedSecret(alicePub)

console.log('Point type:', sharedAlice.constructor.name)
// console.log('Point properties:', Object.keys(sharedAlice))
// In some SDKs we use x coordinate
// console.log('X:', sharedAlice.x.toString())

try {
    console.log('toHex:', sharedAlice.toHex())
} catch (e) {
    console.log('toHex failed')
}

try {
    // Compressed encoding is 33 bytes, maybe encode(true)
    console.log('encode:', Buffer.from(sharedAlice.encode(true)).toString('hex'))
} catch (e) {
    console.log('encode failed')
}

console.log('Match (raw):', sharedAlice === sharedBob)
