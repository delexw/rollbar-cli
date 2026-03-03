import { Command } from 'commander';

const FULL_PROMPT = `# Rollbar CLI - AI Agent Reference

You have access to the \`rollbar\` CLI tool which wraps the full Rollbar API v1 (93 endpoints across 24 categories).

## Setup

Before using API commands, configure authentication:

\`\`\`bash
# Set a project access token (for most endpoints)
rollbar config set-token <project-name> <access-token>

# Set an account-level token (for teams, users, projects management)
rollbar config set-account-token <project-name> <account-token>

# Set the default project
rollbar config set-default <project-name>
\`\`\`

You can also pass tokens inline: \`rollbar --token <token> items list\`

## Global Options

- \`--project <name>\` — Use a specific project's token
- \`--token <token>\` — Override with an explicit access token
- \`--account-token <token>\` — Override with an explicit account token
- \`--format <json|table|plain>\` — Output format (default: json)

## Available Commands

### Configuration
\`\`\`
rollbar config set-token <project> <token>        # Set project token
rollbar config set-account-token <project> <token> # Set account token
rollbar config set-default <project>               # Set default project
rollbar config list                                # List configured projects
rollbar config remove <project>                    # Remove project config
rollbar config show                                # Show current config
\`\`\`

### Items (Error Groups)
\`\`\`
rollbar items create --data <json>                 # Create item
rollbar items get --id <id>                        # Get by ID
rollbar items get --uuid <uuid>                    # Get by UUID
rollbar items get --counter <counter>              # Get by project counter
rollbar items list [--status <s>] [--level <l>] [--page <n>]  # List items
rollbar items update <id> --data <json>            # Update item
\`\`\`

### Occurrences (Individual Events)
\`\`\`
rollbar occurrences list [--page <n>]              # List all occurrences
rollbar occurrences list-by-item <item-id> [--page <n>]  # List for item
rollbar occurrences get <id>                       # Get occurrence
rollbar occurrences delete <id>                    # Delete occurrence
\`\`\`

### Metrics
\`\`\`
rollbar metrics items --data <json>                # Item metrics
rollbar metrics occurrences --data <json>          # Occurrence metrics
rollbar metrics ttr --data <json>                  # Time-to-resolve metrics
\`\`\`

### Deploys
\`\`\`
rollbar deploys create --data <json>               # Create deploy
rollbar deploys get <deploy-id>                    # Get deploy
rollbar deploys update <deploy-id> --data <json>   # Update deploy
rollbar deploys list [--page <n>]                  # List deploys
\`\`\`

### Environments
\`\`\`
rollbar environments list                          # List environments
\`\`\`

### Source Maps & Symbol Files
\`\`\`
rollbar sourcemaps upload-js --file <path> [--version <v>] [--minified-url <url>]
rollbar sourcemaps upload-dsym --file <path> [--version <v>]
rollbar sourcemaps upload-proguard --file <path> [--version <v>]
rollbar sourcemaps upload-flutter --file <path> [--version <v>]
\`\`\`

### RQL (Rollbar Query Language)
\`\`\`
rollbar rql create --query <rql-string>            # Run RQL query
rollbar rql check <job-id>                         # Check job status
rollbar rql list                                   # List RQL jobs
rollbar rql results <job-id>                       # Get job results
rollbar rql cancel <job-id>                        # Cancel job
\`\`\`

### Reports
\`\`\`
rollbar reports top-active [--hours <n>] [--environments <env>]
rollbar reports occurrence-counts [--hours <n>] [--bucket-size <s>]
rollbar reports activated-counts [--hours <n>] [--bucket-size <s>]
\`\`\`

### Projects (requires account token)
\`\`\`
rollbar projects create --name <name>              # Create project
rollbar projects list                              # List projects
rollbar projects get <project-id>                  # Get project
rollbar projects delete <project-id>               # Delete project
\`\`\`

### Access Tokens
\`\`\`
rollbar tokens list <project-id>                   # List tokens
rollbar tokens create <project-id> --data <json>   # Create token
rollbar tokens update-rate-limit <project-id> <token> --data <json>
rollbar tokens delete <project-id> <token>
\`\`\`

### Teams (requires account token)
\`\`\`
rollbar teams create --name <n> --access-level <l> # Create team
rollbar teams list                                 # List teams
rollbar teams get <team-id>                        # Get team
rollbar teams delete <team-id>                     # Delete team
\`\`\`

### Users (requires account token)
\`\`\`
rollbar users list                                 # List users
rollbar users get <user-id>                        # Get user
\`\`\`

### Team-User Management (requires account token)
\`\`\`
rollbar team-users list <team-id>                  # List team users
rollbar team-users check <team-id> <user-id>       # Check membership
rollbar team-users assign <team-id> <user-id>      # Add user to team
rollbar team-users remove <team-id> <user-id>      # Remove from team
rollbar team-users user-teams <user-id>            # List user's teams
rollbar team-users invitations <team-id>           # List invitations
rollbar team-users invite <team-id> --email <e>    # Invite user
rollbar team-users get-invitation <invite-id>      # Get invitation
rollbar team-users cancel-invitation <invite-id>   # Cancel invitation
\`\`\`

### Team-Project Management (requires account token)
\`\`\`
rollbar team-projects list-by-team <team-id>       # Team's projects
rollbar team-projects list-by-project <project-id> # Project's teams
rollbar team-projects check <team-id> <project-id> # Check assignment
rollbar team-projects assign <team-id> <project-id># Assign project
rollbar team-projects remove <team-id> <project-id># Remove project
\`\`\`

### User-Project Management (requires account token)
\`\`\`
rollbar user-projects list <user-id>               # User's projects
\`\`\`

### People / GDPR
\`\`\`
rollbar people delete --person-id <id>             # Request deletion
rollbar people delete-status --person-id <id>      # Check deletion status
\`\`\`

### Notifications
\`\`\`
# Channels: slack, webhook, pagerduty, email
rollbar notifications configure <channel> --data <json>
rollbar notifications rules list <channel>
rollbar notifications rules create <channel> --data <json>
rollbar notifications rules replace <channel> --data <json>
rollbar notifications rules get <channel> <rule-id>
rollbar notifications rules update <channel> <rule-id> --data <json>
rollbar notifications rules delete <channel> <rule-id>
\`\`\`

### Session Replays
\`\`\`
rollbar replays get <env> <session-id> <replay-id>
rollbar replays delete <env> <session-id> <replay-id>
\`\`\`

### Service Links
\`\`\`
rollbar service-links list                         # List links
rollbar service-links create --data <json>         # Create link
rollbar service-links get <id>                     # Get link
rollbar service-links update <id> --data <json>    # Update link
rollbar service-links delete <id>                  # Delete link
\`\`\`

### Versions
\`\`\`
rollbar versions get <version>                     # Get version info
rollbar versions items <version>                   # List items for version
\`\`\`

## Common Workflows

### Investigate an error
\`\`\`bash
rollbar items list --status active --level error
rollbar occurrences list-by-item <item-id>
rollbar occurrences get <occurrence-id>
\`\`\`

### Resolve an item
\`\`\`bash
rollbar items update <id> --data '{"status":"resolved"}'
\`\`\`

### Track a deploy
\`\`\`bash
rollbar deploys create --data '{"environment":"production","revision":"abc123"}'
rollbar deploys list
\`\`\`

### Run an RQL query
\`\`\`bash
rollbar rql create --query "SELECT * FROM item_occurrence WHERE item.counter = 1"
rollbar rql check <job-id>
rollbar rql results <job-id>
\`\`\`

### Get project health overview
\`\`\`bash
rollbar reports top-active --hours 24
rollbar reports occurrence-counts --hours 24
\`\`\`

## Notes
- All \`--data\` arguments accept JSON strings
- Most list commands support \`--page\` for pagination
- Output is JSON by default (best for programmatic use)
- Project-level commands use the project access token
- Account-level commands (teams, users, projects) require an account token
`;

const COMPACT_PROMPT = `# Rollbar CLI Reference (Compact)

CLI wrapping Rollbar API v1. Auth: \`rollbar config set-token <project> <token>\`
Global: \`--project <name>\`, \`--token <token>\`, \`--format json|table|plain\`

Commands: config, items, occurrences, metrics, deploys, environments, sourcemaps, rql, reports, projects, tokens, teams, users, team-users, team-projects, user-projects, people, notifications, replays, service-links, versions

Use \`rollbar <command> --help\` for details on each command.
Key: items list/get/create/update, occurrences list/get/delete, deploys create/list, rql create/check/results, reports top-active/occurrence-counts
`;

export function registerAgentCommand(program: Command): void {
  program
    .command('agent')
    .description('Output AI agent prompt describing all available commands')
    .option('--compact', 'Output compact version')
    .action((opts: { compact?: boolean }) => {
      if (opts.compact) {
        console.log(COMPACT_PROMPT);
      } else {
        console.log(FULL_PROMPT);
      }
    });
}
