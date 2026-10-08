# Agent Tooling

Agent guidance is maintained alongside the configuration that enforces it. This
document explains where to look; it does not duplicate configuration content.

## Source Of Truth

| Need                                                    | Canonical location                                |
| ------------------------------------------------------- | ------------------------------------------------- |
| Repository-wide agent workflow and non-negotiable rules | [AGENTS.md](../AGENTS.md)                         |
| Claude Code entry point                                 | [CLAUDE.md](../CLAUDE.md)                         |
| Path-scoped editing rules                               | [.github/instructions/](../.github/instructions/) |
| Reusable workflows                                      | [.github/skills/](../.github/skills/)             |
| Focused task starters                                   | [.github/prompts/](../.github/prompts/)           |
| Selectable Copilot agent definitions                    | [.github/agents/](../.github/agents/)             |
| Claude plugin configuration                             | [.claude/](../.claude/)                           |

## How To Use It

1. Read `AGENTS.md`, then this documentation tree and the guide for the branch
   being changed.
2. Before editing, apply every `.github/instructions/` file whose `applyTo`
   pattern matches the target path.
3. Use a skill, prompt, or agent definition only when its scope matches the
   task; these are optional workflows, not duplicated architecture references.

The files listed above are authoritative. Update them in place when their
behavior changes, then update this index only when a source location changes.
