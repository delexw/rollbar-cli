import { Command } from 'commander';
import { get } from '../client.ts';
import { getProjectToken } from '../config.ts';
import type { OutputFormat } from '../output.ts';
import { printOutput } from '../output.ts';

export function registerEnvironmentsCommand(program: Command): void {
  const envs = program.command('environments').description('List Rollbar environments');

  envs
    .command('list')
    .description('List all environments (GET /api/1/environments/)')
    .action(async () => {
      const token = program.opts().token ?? getProjectToken(program.opts().project);
      const format = program.opts().format as OutputFormat;
      const result = await get(token, '/api/1/environments/');
      printOutput(result, format);
    });
}
