import { Command } from 'commander';
import { get } from '../client.ts';
import { getAccountToken } from '../config.ts';
import type { OutputFormat } from '../output.ts';
import { printOutput } from '../output.ts';

export function registerUsersCommand(program: Command): void {
  const users = program.command('users').description('Manage Rollbar users');

  users
    .command('list')
    .description('List all users (GET /api/1/users)')
    .action(async () => {
      const token = program.opts().accountToken ?? getAccountToken();
      const format = program.opts().format as OutputFormat;
      const result = await get(token, '/api/1/users');
      printOutput(result, format);
    });

  users
    .command('get')
    .description('Get a user (GET /api/1/user/:id)')
    .argument('<user-id>', 'User ID')
    .action(async (userId: string) => {
      const token = program.opts().accountToken ?? getAccountToken();
      const format = program.opts().format as OutputFormat;
      const result = await get(token, `/api/1/user/${userId}`);
      printOutput(result, format);
    });
}
