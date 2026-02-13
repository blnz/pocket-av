# pocket-av

A monorepo for the Pocket AV audio player and its supporting services.

## Packages

| Package | Description |
|---------|-------------|
| [`keycache-chrome`](packages/keycache-chrome) | Chrome extension for credential management (Vite + React + TypeScript) |
| [`keycache-server`](packages/keycache-server) | Sync server for KeyCache (Express + PostgreSQL + TypeScript) |
| [`pocket-av-app`](packages/pocket-av-app) | Audio player Flutter app with a focus on internet radio |

## Development

This project uses [pnpm workspaces](https://pnpm.io/workspaces) for the Node.js packages.

```bash
pnpm install          # install all dependencies
pnpm dev:chrome       # run chrome extension dev server
pnpm dev:server       # run sync server in watch mode
pnpm test             # run all tests
pnpm typecheck        # type-check all packages
```

The Flutter app (`pocket-av-app`) is managed separately via the `flutter` CLI.
