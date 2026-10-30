import { Command } from 'commander';
import { accountAuth } from '../auth.ts';
import { get } from '../client.ts';
import type { OutputFormat } from '../output.ts';
import { printOutput } from '../output.ts';

export function registerUsersCommand(program: Command): void {
  const users = program.command('users').description('Manage Rollbar users');

  users
    .command('list')
    .description('List all users (GET /api/1/users)')
    .action(async () => {
      const auth = accountAuth(program);
      const format = program.opts().format as OutputFormat;
      const result = await get(auth, '/api/1/users');
      printOutput(result, format);
    });

  users
    .command('get')
    .description('Get a user (GET /api/1/user/:id)')
    .argument('<user-id>', 'User ID')
    .action(async (userId: string) => {
      const auth = accountAuth(program);
      const format = program.opts().format as OutputFormat;
      const result = await get(auth, `/api/1/user/${userId}`);
      printOutput(result, format);
    });
}
