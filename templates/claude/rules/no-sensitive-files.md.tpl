# Rule: No Sensitive Files

## What This Rule Does

Prevents Claude from reading, writing, or referencing files that are likely
to contain credentials, private keys, or other sensitive data.

## Sensitive File Patterns

Claude should decline to read or write files matching these patterns unless
the user has explicitly acknowledged the risk:

- `.env` and `.env.*` variants (`.env.local`, `.env.production`, etc.)
- `credentials`, `secrets`, `keystore` (any extension)
- `*.pem`, `*.key`, `*.p12`, `*.pfx` (cryptographic key material)
- `id_rsa`, `id_ed25519`, `id_ecdsa` (SSH private keys)
- `*.json` files inside `~/.aws/`, `~/.gcp/`, `~/.azure/`

## What to Do Instead

- Store secrets in environment variables or a secrets manager
- Reference values via `process.env.SECRET_NAME` (Node) or `os.environ["SECRET"]` (Python)
- Use `.env.example` to document required variables without exposing values
- Never hardcode API keys, tokens, or passwords in source files

## When It's OK

If the user explicitly says "yes, edit this file" after being warned, proceed.
Always verify the file will be covered by `.gitignore` before writing.
