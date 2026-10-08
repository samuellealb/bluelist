# Git Hooks

This directory contains the repository's Husky-managed Git hooks.

## Active Hooks

- `pre-commit` runs `yarn lint-staged` before a commit is created. Staged files
  must pass the checks configured for lint-staged.
- `commit-msg` runs `yarn commitlint --edit $1` to validate the commit message
  against the repository's commitlint configuration.

## Generated Helper Subtree

`_` is Husky-generated support code. It contains a shim for each supported Git
hook name. Each shim sources `_/h`, which finds the
same-named hook in this directory and runs it when present. This makes the two
top-level files above the only active project hooks; generated shims for hooks
without a matching top-level file exit successfully.

`_/.gitignore` ignores generated helper contents. `_/husky.sh` is a deprecated
compatibility helper that only prints Husky's migration
notice when sourced. Do not add project hook logic under `_`; place it in a
top-level hook file instead.
