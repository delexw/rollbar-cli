#!/usr/bin/env node
import { Command } from 'commander';
import { version } from '../package.json' with { type: 'json' };
import { registerAgentCommand } from './agent.ts';
import { registerConfigCommand } from './commands/config.ts';
import { registerDeploysCommand } from './commands/deploys.ts';
import { registerEnvironmentsCommand } from './commands/environments.ts';
import { registerItemsCommand } from './commands/items.ts';
import { registerMetricsCommand } from './commands/metrics.ts';
import { registerNotificationsCommand } from './commands/notifications.ts';
import { registerOccurrencesCommand } from './commands/occurrences.ts';
import { registerPeopleCommand } from './commands/people.ts';
import { registerProjectsCommand } from './commands/projects.ts';
import { registerReplaysCommand } from './commands/replays.ts';
import { registerReportsCommand } from './commands/reports.ts';
import { registerRqlCommand } from './commands/rql.ts';
import { registerServiceLinksCommand } from './commands/service-links.ts';
import { registerSourcemapsCommand } from './commands/sourcemaps.ts';
import { registerTeamProjectsCommand } from './commands/team-projects.ts';
import { registerTeamUsersCommand } from './commands/team-users.ts';
import { registerTeamsCommand } from './commands/teams.ts';
import { registerTokensCommand } from './commands/tokens.ts';
import { registerUserProjectsCommand } from './commands/user-projects.ts';
import { registerUsersCommand } from './commands/users.ts';
import { registerVersionsCommand } from './commands/versions.ts';

const program = new Command();

program
  .name('rollbar')
  .description('CLI tool wrapping the full Rollbar API v1')
  .version(version)
  .option('--project <name>', 'Use a specific project configuration')
  .option('--token <token>', 'Override with an explicit access token')
  .option('--account-token <token>', 'Override with an explicit account-level token')
  .option('--format <format>', 'Output format: json, table, plain', 'json');

// Register all command groups
registerConfigCommand(program);
registerItemsCommand(program);
registerOccurrencesCommand(program);
registerMetricsCommand(program);
registerDeploysCommand(program);
registerEnvironmentsCommand(program);
registerSourcemapsCommand(program);
registerRqlCommand(program);
registerReportsCommand(program);
registerProjectsCommand(program);
registerTokensCommand(program);
registerTeamsCommand(program);
registerUsersCommand(program);
registerTeamUsersCommand(program);
registerTeamProjectsCommand(program);
registerUserProjectsCommand(program);
registerPeopleCommand(program);
registerNotificationsCommand(program);
registerReplaysCommand(program);
registerServiceLinksCommand(program);
registerVersionsCommand(program);
registerAgentCommand(program);

program.parseAsync(process.argv).catch((err: Error) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
