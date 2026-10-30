import { Command } from 'commander';
import { projectToken } from '../auth.ts';
import { get } from '../client.ts';
import type { OutputFormat } from '../output.ts';
import { printOutput } from '../output.ts';

export function registerEnvironmentsCommand(program: Command): void {
  const envs = program.command('environments').description('List Rollbar environments');

  envs
    .command('list')
    .description('List all environments (GET /api/1/environments/)')
    .action(async () => {
      const token = projectToken(program);
      const format = program.opts().format as OutputFormat;
      const result = await get(token, '/api/1/environments/');
      printOutput(result, format);
    });
}
