# Bluelist Documentation

This directory is the agent-ready map of the repository. Its subdirectories
mirror the source tree, while the linked files in each guide remain the
implementation source of truth.

## Start Here

| Document                        | Purpose                                                                                       |
| ------------------------------- | --------------------------------------------------------------------------------------------- |
| [Architecture](ARCHITECTURE.md) | Runtime, data flow, authentication, service/store contracts, API, extension, and conventions. |

## Mirrored Project Map

| Project area       | Guide                              | Scope                                                                               |
| ------------------ | ---------------------------------- | ----------------------------------------------------------------------------------- |
| Application source | [src](src/README.md)               | Vue components, Bluesky services, Pinia state, types, utilities, and visual assets. |
| Routes             | [pages](pages/README.md)           | Nuxt page routes and nested list-detail routes.                                     |
| HTTP server        | [server](server/README.md)         | Nitro API endpoints, public OAuth metadata, and server-only configuration.          |
| Route middleware   | [middleware](middleware/README.md) | Browser session restoration and access redirects.                                   |
| Static files       | [public](public/README.md)         | Browser-served files.                                                               |
| Local tooling      | [scripts](scripts/README.md)       | Nuxt launcher and early TLS environment setup.                                      |
| Agent tooling      | [Agent tooling](agent-tooling.md)  | Canonical rules, path-scoped instructions, skills, prompts, and tool configuration. |
| Git hooks          | [.husky](.husky/README.md)         | Commit-time linting and conventional-commit validation.                             |

Follow the child README within a branch for finer-grained ownership. Documentation
for ignored machine-local certificate files is intentionally excluded.
