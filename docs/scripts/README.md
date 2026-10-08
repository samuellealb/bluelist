# Scripts

## `run.mjs`

`run.mjs` is the cross-platform launcher for Nuxt commands. It runs Nuxt from
the project's local `node_modules/.bin` directory with the repository root as
its working directory, rather than relying on the shell `PATH`.

Before starting Nuxt, the launcher reads `.env.local` itself to inspect
`NODE_EXTRA_CA_CERTS`. When that variable names an existing file, it resolves
the path from the repository root and passes it to the Nuxt child process. This
ensures the extra certificate is available before Node initializes its TLS
stack. If the certificate path does not exist, the launcher prints a warning
and starts Nuxt without setting the variable.

Nuxt receives `--dotenv .env.local`, so it also loads the rest of the local
environment configuration. The launcher accepts one required command:

```sh
node scripts/run.mjs <dev|build|preview|generate>
```

It exits with Nuxt's exit status. It reports an error when no command is given
or the local Nuxt binary is unavailable; install dependencies with `yarn
install` in the latter case.

## Package Scripts

`package.json` routes the following Yarn commands through the launcher:

| Yarn command    | Launcher invocation             |
| --------------- | ------------------------------- |
| `yarn dev`      | `node scripts/run.mjs dev`      |
| `yarn build`    | `node scripts/run.mjs build`    |
| `yarn preview`  | `node scripts/run.mjs preview`  |
| `yarn generate` | `node scripts/run.mjs generate` |

Use these package scripts instead of calling Nuxt directly when the local
certificate configuration must be applied before startup.
