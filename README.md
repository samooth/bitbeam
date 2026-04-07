# bitbeam

A 1-1 end-to-end encrypted internet pipe powered by [Hyperswarm](https://github.com/hyperswarm/hyperswarm), Noise & Bitcoin

```
npm install git+https://github.com/samooth/bitbeam
```

## Usage

``` js
const BitBeam = require('bitbeam')
const { PrivateKey, PublicKey } = require('@bsv/sdk')

// Alice Private Key
const fromPrivKey = PrivateKey.fromWif("L1H2Zz694soUr9T3y...")
// Bob Public Key
const toPubKey = PublicKey.fromString("03516b6b5a609b35f22bdfc62...");

// key is 32-byte unique passphrase to find the other side of your pipe.
// once the other peer is discovered it is used to derive a noise keypair as well.
// bitbeam uses symmetric ECDH to generate the unique passphrase when 
// from: and to: are specified in the options object, being, 
// from: the Bitcoin Private Key of Alice and
// to: the Bitcoin Public Key of Bob
const beam = new BitBeam({from: fromPrivKey, to: toPubKey})

// You can also specify an optional context to isolate your application
// const beam = new BitBeam({from: priv, to: pub}, { context: 'my-app-v1' })

// to generate a random passphrase, leave the constructor empty and bitbeam will generate one for you
// const beam = new BitBeam()
// beam.key // <-- your passphrase

// make a little chat app
process.stdin.pipe(beam).pipe(process.stdout)
```

## CLI

First install it

```sh
npm install -g bitbeam
```

Then on one machine run

```sh
echo 'hello world' | bitbeam
```

This will generate a phrase, eg "neznr3z3j44l7q7sgynbzpdrdlpausurbpcmqvwupmuoidolbopa". Then on another machine run

```sh
# will print "hello world"
bitbeam neznr3z3j44l7q7sgynbzpdrdlpausurbpcmqvwupmuoidolbopa
```

That's it! Happy piping.

## API

#### `const stream = new BitBeam([key][, options])`

Make a new BitBeam duplex stream.
 
Will auto connect to another peer using the same key with an end to end encrypted tunnel.

When the other peer writes it's emitted as `data` on this stream.

Likewise when you write to this stream it's emitted as `data` on the other peers stream.

If you do not pass a `key` into the constructor (the passphrase), one will be generated and put on `stream.key`.

`key` can be:
- A `string` passphrase.
- An object `{ from, to }` where `from` is a `PrivateKey` and `to` is a `PublicKey` (or their string/WIF equivalents).

`options` include:

- `dht`: A DHT instance. Defaults to a new instance.
- `announce`: Whether to announce the stream. Defaults to `true`.
- `context`: A string used to further salt the ECDH shared secret derivation. Defaults to `'bitbeam'`.

#### `stream.key`

The passphrase used by the stream for connection.

## License

MIT
