# BitBeam Project Mandates

## Testing
- **Test Runner**: Always use `brittle` for unit and integration tests.
- **DHT Setup**: 
    - For isolated local tests, always use a dedicated bootstrapper node (`new DHT({ bootstrap: [], ephemeral: false })`).
    - Peers should use the bootstrapper's address: ``127.0.0.1:${bootstrapper.address().port}``.
    - **Propagation Delay**: Always wait at least 2 seconds (`setTimeout`) after `server.listen()` before attempting a `node.connect()` to allow the DHT announcement to propagate.
- **Verification**: Prefer `t.alike()` for comparing Buffers and `t.is()` for derived keys.

## Implementation Standards
- **Library**: Always use `@bsv/sdk` for cryptographic operations.
- **Key Derivation**: Use symmetric ECDH with a `context` string (defaulting to 'bitbeam') to derive DHT keys.
- **Stream Lifecycle**: 
    - In `_open(cb)`, always ensure `this._onopenDone(null)` is called after a successful `server.listen()` or when a connection is established.
    - Call `.resume()` on beams in tests to ensure `_open` is triggered.
- **Robustness**:
    - `_write` must check for `this._out` and wait for `connected` if null.
    - Only destroy DHT nodes created internally by the instance.

