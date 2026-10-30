import { Command } from 'commander';
import { accountAuth } from '../auth.ts';
import { del, get, post } from '../client.ts';
import type { OutputFormat } from '../output.ts';
import { printOutput } from '../output.ts';

export function registerTeamsCommand(program: Command): void {
  const teams = program.command('teams').description('Manage Rollbar teams');

  teams
    .command('create')
    .description('Create a team (POST /api/1/teams)')
    .requiredOption('--name <name>', 'Team name')
    .requiredOption('--access-level <level>', 'Access level (standard, light, view)')
    .action(async (opts: { name: string; accessLevel: string }) => {
      const auth = accountAuth(program);
      const format = program.opts().format as OutputFormat;
      const result = await post(auth, '/api/1/teams', {
        name: opts.name,
        access_level: opts.accessLevel,
      });
      printOutput(result, format);
    });

  teams
    .command('list')
    .description('List all teams (GET /api/1/teams)')
    .action(async () => {
      const auth = accountAuth(program);
      const format = program.opts().format as OutputFormat;
      const result = await get(auth, '/api/1/teams');
      printOutput(result, format);
    });

  teams
    .command('get')
    .description('Get a team (GET /api/1/team/:id)')
    .argument('<team-id>', 'Team ID')
    .action(async (teamId: string) => {
      const auth = accountAuth(program);
      const format = program.opts().format as OutputFormat;
      const result = await get(auth, `/api/1/team/${teamId}`);
      printOutput(result, format);
    });

  teams
    .command('delete')
    .description('Delete a team (DELETE /api/1/team/:id)')
    .argument('<team-id>', 'Team ID')
    .action(async (teamId: string) => {
      const auth = accountAuth(program);
      const format = program.opts().format as OutputFormat;
      const result = await del(auth, `/api/1/team/${teamId}`);
      printOutput(result, format);
    });
}
