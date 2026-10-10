# Tracked localhost development certificate (scope review)

The upstream snapshot `c2c9ae0` already tracks `packages/fs/localhost.decrypted.key` and `packages/fs/localhost.crt`; the theme work did not introduce either file. Inspection was limited to certificate metadata and SHA-256 digests of RSA moduli, never logging private key material.

- Certificate subject: noname, CN=https://localhost; issuer: noname development.
- SAN: DNS localhost and IP 127.0.0.1 only.
- Validity: 2024-07-23 through 2034-07-21.
- Certificate SHA-256 fingerprint: `5A:61:26:F9:63:63:78:73:24:37:2A:58:6D:07:75:5B:78:EF:C1:BE:3B:60:65:9D:5A:23:63:E2:F7:5E:5E:16`.
- Key and certificate RSA modulus digests match (`a90cfeabebdddcc9a32e99331631bac5efb2580911dae197ea0520269d5e7f3e`).
- `packages/fs/src/index.ts` references both only in a commented-out HTTPS server example; the dedicated streaming game server uses private-container HTTP. Public TLS/auth credentials are separate and are not these files.

These observations support an upstream localhost development fixture, **not evidence of a newly leaked public deployment key**. They do not prove the key has never been reused elsewhere. No unrelated key rotation, deletion or history rewrite was performed. This publicly tracked key must not be treated as secret or used for production TLS. Do not claim the entire upstream repository is secret-free.
