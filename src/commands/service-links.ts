import { Command } from 'commander';
import { del, get, post, put } from '../client.ts';
import { getProjectToken } from '../config.ts';
import type { OutputFormat } from '../output.ts';
import { parseJsonArg, printOutput } from '../output.ts';

export function registerServiceLinksCommand(program: Command): void {
  const sl = program.command('service-links').description('Manage service links');

  sl.command('list')
    .description('List service links (GET /api/1/service_links)')
    .action(async () => {
      const token = program.opts().token ?? getProjectToken(program.opts().project);
      const format = program.opts().format as OutputFormat;
      const result = await get(token, '/api/1/service_links');
      printOutput(result, format);
    });

  sl.command('create')
    .description('Create a service link (POST /api/1/service_links)')
    .requiredOption('--data <json>', 'Service link data as JSON')
    .action(async (opts: { data: string }) => {
      const token = program.opts().token ?? getProjectToken(program.opts().project);
      const format = program.opts().format as OutputFormat;
      const result = await post(token, '/api/1/service_links', parseJsonArg(opts.data));
      printOutput(result, format);
    });

  sl.command('get')
    .description('Get a service link (GET /api/1/service_links/:id)')
    .argument('<id>', 'Service link ID')
    .action(async (id: string) => {
      const token = program.opts().token ?? getProjectToken(program.opts().project);
      const format = program.opts().format as OutputFormat;
      const result = await get(token, `/api/1/service_links/${id}`);
      printOutput(result, format);
    });

  sl.command('update')
    .description('Update a service link (PUT /api/1/service_links/:id)')
    .argument('<id>', 'Service link ID')
    .requiredOption('--data <json>', 'Service link data as JSON')
    .action(async (id: string, opts: { data: string }) => {
      const token = program.opts().token ?? getProjectToken(program.opts().project);
      const format = program.opts().format as OutputFormat;
      const result = await put(token, `/api/1/service_links/${id}`, parseJsonArg(opts.data));
      printOutput(result, format);
    });

  sl.command('delete')
    .description('Delete a service link (DELETE /api/1/service_links/:id)')
    .argument('<id>', 'Service link ID')
    .action(async (id: string) => {
      const token = program.opts().token ?? getProjectToken(program.opts().project);
      const format = program.opts().format as OutputFormat;
      const result = await del(token, `/api/1/service_links/${id}`);
      printOutput(result, format);
    });
}
