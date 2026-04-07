const { PrivateKey } = require('@bsv/sdk')

const alicePriv = PrivateKey.fromRandom()
const alicePub = alicePriv.toPublicKey()

const bobPriv = PrivateKey.fromRandom()
const bobPub = bobPriv.toPublicKey()

const context = 'test'

const sharedAlice = alicePriv.deriveChild(bobPub, context)
const sharedBob = bobPriv.deriveChild(alicePub, context)

console.log('Alice shared:', sharedAlice.toHex())
console.log('Bob shared:  ', sharedBob.toHex())
console.log('Match:', sharedAlice.toHex() === sharedBob.toHex())
