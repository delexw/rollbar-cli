import { Command } from 'commander';
import { projectAuth } from '../auth.ts';
import { get } from '../client.ts';
import type { OutputFormat } from '../output.ts';
import { printOutput } from '../output.ts';

export function registerEnvironmentsCommand(program: Command): void {
  const envs = program.command('environments').description('List Rollbar environments');

  envs
    .command('list')
    .description('List all environments (GET /api/1/environments/)')
    .action(async () => {
      const auth = await projectAuth(program);
      const format = program.opts().format as OutputFormat;
      const result = await get(auth, '/api/1/environments/');
      printOutput(result, format);
    });
}
