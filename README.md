# rollbar-cli

A TypeScript CLI tool wrapping the full Rollbar API v1 (93 endpoints across 24 categories). Designed for easy use by both humans and AI agents.

## Prerequisites

- [Bun](https://bun.sh/) v1.x+

## Installation

```bash
npm install -g @delexw/rollbar-cli
```

### From source

```bash
bun install
bun run build
```

The built CLI will be at `dist/rollbar.js`. You can also run directly with:

```bash
bun run dev -- <command>
```

## Setup

Configure a project access token before using API commands:

```bash
rollbar config set-token <project-name> <access-token>
rollbar config set-default <project-name>

# For account-level commands (teams, users, projects) — one global token
rollbar config set-account-token <account-token>
```

Tokens are stored securely in your OS keychain via [`@napi-rs/keyring`](https://www.npmjs.com/package/@napi-rs/keyring) (macOS Keychain, Windows Credential Manager, Linux Secret Service). Only project names and the default project setting are stored in `~/.rollbar-cli/config.json` — no tokens are written to disk.

You can also pass tokens inline:

```bash
rollbar --token <token> items list
```

## Global Options

| Option | Description |
|---|---|
| `--project <name>` | Use a specific project's token |
| `--token <token>` | Override with an explicit access token |
| `--account-token <token>` | Override with an explicit account-level token |
| `--format <json\|table\|plain>` | Output format (default: `json`) |

## Commands

| Command | Description | Endpoints |
|---|---|---|
| `rollbar config` | Token and project configuration | - |
| `rollbar items` | Error groups (items) | 6 |
| `rollbar occurrences` | Individual error events | 4 |
| `rollbar metrics` | Item, occurrence, and TTR metrics | 3 |
| `rollbar deploys` | Deploy tracking | 4 |
| `rollbar environments` | Environment listing | 1 |
| `rollbar sourcemaps` | Source map / symbol file uploads | 4 |
| `rollbar rql` | Rollbar Query Language jobs | 5 |
| `rollbar reports` | Top active items and counts | 3 |
| `rollbar projects` | Project management (account token) | 4 |
| `rollbar tokens` | Project access token management | 6 |
| `rollbar teams` | Team management (account token) | 4 |
| `rollbar users` | User listing (account token) | 2 |
| `rollbar team-users` | Team-user relationships | 9 |
| `rollbar team-projects` | Team-project relationships | 5 |
| `rollbar user-projects` | User-project listing | 1 |
| `rollbar people` | People / GDPR data deletion | 2 |
| `rollbar notifications` | Notification channels and rules | 28 |
| `rollbar replays` | Session replay management | 2 |
| `rollbar service-links` | Service link management | 5 |
| `rollbar versions` | Version info and items | 2 |
| `rollbar agent` | Output AI agent prompt | - |

Use `rollbar <command> --help` for subcommand details.

## AI Agent Integration

The `rollbar agent` command outputs a structured prompt that describes all available commands, expected input/output formats, authentication setup, and common workflows:

```bash
rollbar agent          # Full prompt
rollbar agent --compact # Compact version
```

## Examples

```bash
# Investigate active errors
rollbar items list --status active --level error
rollbar occurrences list-by-item <item-id>
rollbar occurrences get <occurrence-id>

# Resolve an item
rollbar items update <id> --data '{"status":"resolved"}'

# Track a deploy
rollbar deploys create --data '{"environment":"production","revision":"abc123"}'

# Run an RQL query
rollbar rql create --query "SELECT * FROM item_occurrence WHERE item.counter = 1"
rollbar rql results <job-id>

# Get project health
rollbar reports top-active --hours 24

# Manage notifications
rollbar notifications rules list slack
rollbar notifications rules create webhook --data '{"trigger":"new_item","config":{"url":"https://example.com/hook"}}'
```

## Development

```bash
bun run dev -- --help    # Run in development mode
bun run build            # Build to dist/rollbar.js
bun run test             # Run tests
bun run lint             # Run oxlint
bun run format           # Format with oxfmt
```

## Project Structure

```
src/
  index.ts           Entry point, CLI setup
  client.ts          HTTP client (fetch-based, auth handling)
  config.ts          Config management (OS keychain + ~/.rollbar-cli/config.json)
  output.ts          Output formatting (JSON, table, plain)
  agent.ts           AI agent prompt generator
  commands/          One file per API category (20 files)
tests/
  config.test.ts     Config module unit tests
  client.test.ts     HTTP client unit tests
  output.test.ts     Output formatting unit tests
  cli.test.ts        CLI integration tests
  agent.test.ts      Agent command tests
```
