# P2P and DHT Stream Testing Skill

This skill captures expert procedural guidance for testing and implementing P2P streams using Hyperswarm DHT and streamx.

## Knowledge Captured

### 1. Reliable Local DHT Discovery
Discovery in an isolated DHT (bootstrap: []) can be flaky. The most reliable pattern is:
1. Create a bootstrapper: `new DHT({ bootstrap: [], ephemeral: false })`.
2. Create Peer nodes using the bootstrapper address.
3. Call `server.listen(keyPair)`.
4. **CRITICAL**: Wait for ~2000ms. Announcement propagation is not instantaneous even on localhost.
5. Call `node.connect(publicKey)`.

### 2. Streamx Lifecycle Integration
When wrapping DHT connections in a `Duplex` (streamx) stream:
- `_open(cb)` must call the callback (or `_onopenDone(null)`) for the stream to transition to the `open` state.
- If `announce: true`, the stream is "open" as soon as the server is listening.
- If `announce: false`, the stream is "open" only after `node.connect()` succeeds and the socket is ready.

### 3. Event Data Accuracy
Avoid relying on `node.host` or `node.port` for connection events.
- **Server side**: Extract address from `server.address()`.
- **Client side**: Extract address from `node.remoteAddress()` after the connection opens.

### 4. Symmetric Shared Secrets (@bsv/sdk)
For a 1-1 peer pipe, use standard ECDH:
1. `sharedPoint = privateKey.deriveSharedSecret(remotePublicKey)`
2. Extract X-coordinate: `sharedSecret = sharedPoint.encode(true).slice(1)` (32 bytes).
3. Hash with context: `dhtKey = Hash.sha256(concat([sharedSecret, context]))`.
This ensures both Alice and Bob derive the same DHT key regardless of who initiates.

### 5. Stream Robustness
- **Internal vs External DHT**: Track if the DHT node was created internally (`_nodeCreated`). Only call `_node.destroy()` if BitBeam created it.
- **Write Buffering**: If `_write` is called before the P2P connection is established, wait for the `connected` event before proceeding.

