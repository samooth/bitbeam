const bsv = require('bsv2')

const alicePriv = bsv.PrivKey.fromRandom()
const alicePub = bsv.PubKey.fromPrivKey(alicePriv)

const bobPriv = bsv.PrivKey.fromRandom()
const bobPub = bsv.PubKey.fromPrivKey(bobPriv)

const sharedAlice = bsv.Ecies.ivkEkM(alicePriv, bobPub)
const sharedBob = bsv.Ecies.ivkEkM(bobPriv, alicePub)

console.log('Alice shared:', sharedAlice.kM.toString('hex'))
console.log('Bob shared:  ', sharedBob.kM.toString('hex'))
console.log('Match:', sharedAlice.kM.toString('hex') === sharedBob.kM.toString('hex'))
