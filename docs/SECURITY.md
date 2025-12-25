**Secrets & Security — Project Guidance**

This document explains how to handle API keys and other secrets for this project.

1. Never commit secrets
  - Do NOT commit `.env.local` or any file containing API keys, tokens, or credentials.
  - The project `.gitignore` includes `.env.local` and related files. Use `.env.local.example` for placeholders.

2. Where to store secrets
  - Local development: create `.env.local` in the project root and add your keys there.
  - CI / Deployment: use platform secret storage (GitHub Actions secrets, Cloud provider secret managers, etc.).

3. How to add keys locally
  - Copy `.env.local.example` → `.env.local` and fill in values.
  - Example:

    VITE_GEMINI_API_KEY=your_key_here

  - Restart the dev server after creating/updating `.env.local`.

4. Rotation & Exposure
  - If a secret is accidentally committed, rotate it immediately (revoke and create a new one).
  - Remove the secret from the git history (we provide guidance and can help with cleanup). After rotation, force-push cleaned history if necessary.

5. Automated scanning
  - Use secret-scanning tools (GitHub secret scanning, TruffleHog, git-secrets) to detect secrets before pushing.

6. Useful commands (Windows PowerShell)
  - Create `.env.local` from example:

    Copy-Item .env.local.example .env.local

  - Check for common API key patterns locally (simple grep):

    Select-String -Path "**/*" -Pattern 'x-api-key|sk-|AIza|VITE_|ANTHROPIC|CLAUDE' -SimpleMatch

7. Need help?
  - If you want, I can add a pre-commit hook to scan for secrets or integrate `git-secrets` into the repo.
