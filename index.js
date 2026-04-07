const { Duplex } = require('streamx')
const sodium = require('sodium-universal')
const { PrivateKey, PublicKey, Hash } = require('@bsv/sdk')
const b4a = require('b4a')
const queueTick = require('queue-tick')
const b32 = require('hi-base32')
const DHT = require('@hyperswarm/dht')

function toBase32 (buf) {
  return b32.encode(buf).replace(/=/g, '').toLowerCase()
}

function fromBase32 (str) {
  return b4a.from(b32.decode.asBytes(str.toUpperCase()))
}

function randomBytes (length) {
  const buffer = b4a.alloc(length)
  sodium.randombytes_buf(buffer)
  return buffer
}


module.exports = class BitBeam extends Duplex {
  constructor (key, options) {
    super()

    if (typeof key !== 'string' && !key?.from) {
      options = key
      key = null
    }

    if (typeof options === 'boolean') {
      options = { announce: options }
    } else if (typeof options !== 'object') {
      options = {}
    }
    let announce = options.hasOwnProperty("announce") ? options.announce : true
    const context = options.context || 'bitbeam'

    if ( key?.from &&  key?.to ) {
      const from = key.from instanceof PrivateKey ? key.from : PrivateKey.fromWif(key.from.toString())
      const to = key.to instanceof PublicKey ? key.to : PublicKey.fromString(key.to.toString())
      
      // Symmetric ECDH for shared secret
      const sharedPoint = from.deriveSharedSecret(to)
      const sharedSecret = b4a.from(sharedPoint.encode(true).slice(1))
      
      // Hash with context for robustness
      const dhtKey = b4a.from(Hash.sha256(b4a.concat([sharedSecret, b4a.from(context)])))
      
      key = toBase32(dhtKey)
    }else if (!key){
      key = toBase32(randomBytes(32))
      announce = true
    }

    this.key = key
    this.announce = announce
    this.context = context
    this._nodeCreated = !options.dht
    this._node = options.dht || null
    this._server = null
    this._out = null
    this._inc = null
    this._now = Date.now()
    this._ondrain = null
    this._onopen = null
    this._onread = null
  }

  static toBase32 (buf) {
    return b32.encode(buf).replace(/=/g, '').toLowerCase()
  }

  static fromBase32 (str) {
    return b4a.from(b32.decode.asBytes(str.toUpperCase()))
  }

  get connected () {
    return !!this._out
  }

  _ondrainDone (err) {
    if (this._ondrain) {
      const cb = this._ondrain
      this._ondrain = null
      cb(err)
    }
  }

  _onreadDone (err) {
    if (this._onread) {
      const cb = this._onread
      this._onread = null
      cb(err)
    }
  }

  _onopenDone (err) {
    if (this._onopen) {
      const cb = this._onopen
      this._onopen = null
      cb(err)
    }
  }

  async _open (cb) {
    const keyPair = DHT.keyPair(fromBase32(this.key))

    this._onopen = cb

    if (!this._node) this._node = new DHT({ ephemeral: true })
    await this._node.ready()

    const onConnection = s => {
      s.on('data', (data) => {
        if (!this._inc) {
          this._inc = s
          this._inc.on('error', (err) => this.destroy(err))
          this._inc.on('end', () => this._push(null))
        }

        if (s !== this._inc) return
        if (this._push(data) === false) s.pause()
      })
      s.on('error', (err) => {
        this.emit('error', err)
      })
      s.on('end', () => {
        const addr = this._server ? this._server.address() : this._node.remoteAddress()
        this.emit('end', { host: addr.host, port: addr.port })
        if (this._inc) return
        this._push(null)
      })

      if (!this._out) {
        this._out = s
        this._out.on('error', (err) => this.destroy(err))
        this._out.on('drain', () => this._ondrainDone(null))
        const addr = this._server ? this._server.address() : this._node.remoteAddress()
        this.emit('connected', { host: addr.host, port: addr.port })
        this._onopenDone(null)
      }
    }

    if (this.announce) {
      this._server = this._node.createServer({
        firewall (remotePublicKey) {
          return !remotePublicKey.equals(keyPair.publicKey)
        }
      })
      this._server.on('connection', onConnection)
      try {
        await this._server.listen(keyPair)
        this._onopenDone(null)
        queueTick(() => {
          const addr = this._server.address()
          this.emit('remote-address', { host: addr.host, port: addr.port })
        })
      } catch (err) {
        this._onopenDone(err)
      }
      return
    }

    const connection = this._node.connect(keyPair.publicKey, { keyPair })
    connection.once('open', () => {
      const addr = this._node.remoteAddress()
      this.emit('remote-address', { host: addr.host, port: addr.port })
      onConnection(connection)
    })
    connection.once('error', (err) => {
      this._onopenDone(err)
    })
  }

  _read (cb) {
    this._onread = cb
    if (this._inc) this._inc.resume()
  }

  _push (data) {
    const res = this.push(data)
    queueTick(() => this._onreadDone(null))
    return res
  }

  _write (data, cb) {
    if (!this._out) {
      this.once('connected', () => this._write(data, cb))
      return
    }
    if (this._out.write(data) !== false) return cb(null)
    this._ondrain = cb
  }

  _final (cb) {
    const done = () => {
      this.emit('end', { host: this._node.host, port: this._node.port })

      this._out.removeListener('finish', done)
      this._out.removeListener('error', done)
      cb(null)
    }

    this._out.end()
    this._out.on('finish', done)
    this._out.on('error', done)
  }

  _predestroy () {
    if (this._inc) this._inc.destroy()
    if (this._out) this._out.destroy()
    const err = new Error('Destroyed')
    this._onopenDone(err)
    this._onreadDone(err)
    this._ondrainDone(err)
  }

  async _destroy (cb) {
    if (!this._node) return cb(null)
    if (this._server) await this._server.close().catch(e => undefined)
    if (this._nodeCreated) await this._node.destroy().catch(e => undefined)
    cb(null)
  }

}

