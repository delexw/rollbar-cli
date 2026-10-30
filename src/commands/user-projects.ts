import { Command } from 'commander';
import { accountToken } from '../auth.ts';
import { get } from '../client.ts';
import type { OutputFormat } from '../output.ts';
import { printOutput } from '../output.ts';

export function registerUserProjectsCommand(program: Command): void {
  const up = program.command('user-projects').description("List a user's projects");

  up.command('list')
    .description("List a user's projects (GET /api/1/user/:id/projects)")
    .argument('<user-id>', 'User ID')
    .action(async (userId: string) => {
      const token = accountToken(program);
      const format = program.opts().format as OutputFormat;
      const result = await get(token, `/api/1/user/${userId}/projects`);
      printOutput(result, format);
    });
}
