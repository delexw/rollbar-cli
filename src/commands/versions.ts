import { Command } from 'commander';
import { get } from '../client.ts';
import { getProjectToken } from '../config.ts';
import type { OutputFormat } from '../output.ts';
import { printOutput } from '../output.ts';

export function registerVersionsCommand(program: Command): void {
  const versions = program.command('versions').description('Query version information');

  versions
    .command('get')
    .description('Get version details (GET /api/1/versions/:version)')
    .argument('<version>', 'Version string')
    .action(async (version: string) => {
      const token = program.opts().token ?? getProjectToken(program.opts().project);
      const format = program.opts().format as OutputFormat;
      const result = await get(token, `/api/1/versions/${version}`);
      printOutput(result, format);
    });

  versions
    .command('items')
    .description('List items for a version (GET /api/1/versions/:version/items)')
    .argument('<version>', 'Version string')
    .action(async (version: string) => {
      const token = program.opts().token ?? getProjectToken(program.opts().project);
      const format = program.opts().format as OutputFormat;
      const result = await get(token, `/api/1/versions/${version}/items`);
      printOutput(result, format);
    });
}
