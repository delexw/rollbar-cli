import { Command } from 'commander';
import { del, get } from '../client.ts';
import { getProjectToken } from '../config.ts';
import type { OutputFormat } from '../output.ts';
import { printOutput } from '../output.ts';

export function registerOccurrencesCommand(program: Command): void {
  const occ = program.command('occurrences').description('Manage Rollbar occurrences');

  occ
    .command('list')
    .description('List all occurrences (GET /api/1/instances)')
    .option('--page <page>', 'Page number')
    .action(async (opts: { page?: string }) => {
      const token = program.opts().token ?? getProjectToken(program.opts().project);
      const format = program.opts().format as OutputFormat;
      const result = await get(token, '/api/1/instances', { page: opts.page });
      printOutput(result, format);
    });

  occ
    .command('list-by-item')
    .description('List occurrences for an item (GET /api/1/item/:item_id/instances)')
    .argument('<item-id>', 'Item ID')
    .option('--page <page>', 'Page number')
    .action(async (itemId: string, opts: { page?: string }) => {
      const token = program.opts().token ?? getProjectToken(program.opts().project);
      const format = program.opts().format as OutputFormat;
      const result = await get(token, `/api/1/item/${itemId}/instances`, { page: opts.page });
      printOutput(result, format);
    });

  occ
    .command('get')
    .description('Get a single occurrence (GET /api/1/instance/:id)')
    .argument('<id>', 'Occurrence ID')
    .action(async (id: string) => {
      const token = program.opts().token ?? getProjectToken(program.opts().project);
      const format = program.opts().format as OutputFormat;
      const result = await get(token, `/api/1/instance/${id}`);
      printOutput(result, format);
    });

  occ
    .command('delete')
    .description('Delete an occurrence (DELETE /api/1/instance/:id)')
    .argument('<id>', 'Occurrence ID')
    .action(async (id: string) => {
      const token = program.opts().token ?? getProjectToken(program.opts().project);
      const format = program.opts().format as OutputFormat;
      const result = await del(token, `/api/1/instance/${id}`);
      printOutput(result, format);
    });
}
