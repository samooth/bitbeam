const { PrivateKey } = require('@bsv/sdk')

const alicePriv = PrivateKey.fromRandom()
const alicePub = alicePriv.toPublicKey()

const bobPriv = PrivateKey.fromRandom()
const bobPub = bobPriv.toPublicKey()

const sharedAlice = alicePriv.deriveSharedSecret(bobPub)
const sharedBob = bobPriv.deriveSharedSecret(alicePub)

const sharedAliceHex = Buffer.from(sharedAlice).toString('hex')
const sharedBobHex = Buffer.from(sharedBob).toString('hex')

console.log('Alice shared:', sharedAliceHex)
console.log('Bob shared:  ', sharedBobHex)
console.log('Match:', sharedAliceHex === sharedBobHex)
