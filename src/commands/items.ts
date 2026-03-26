import { Command } from 'commander';
import { get, patch, post } from '../client.ts';
import { getProjectToken } from '../config.ts';
import type { OutputFormat } from '../output.ts';
import { parseJsonArg, printOutput } from '../output.ts';

export function registerItemsCommand(program: Command): void {
  const items = program.command('items').description('Manage Rollbar items');

  items
    .command('create')
    .description('Create a new item (POST /api/1/item/)')
    .requiredOption('--data <json>', 'Item data as JSON')
    .action(async (opts: { data: string }) => {
      const token = program.opts().token ?? getProjectToken(program.opts().project);
      const format = program.opts().format as OutputFormat;
      const result = await post(token, '/api/1/item/', parseJsonArg(opts.data));
      printOutput(result, format);
    });

  items
    .command('get')
    .description('Get an item by ID, UUID, or counter')
    .option('--id <id>', 'Item ID')
    .option('--uuid <uuid>', 'Item UUID')
    .option('--counter <counter>', 'Item project counter')
    .action(async (opts: { id?: string; uuid?: string; counter?: string }) => {
      const token = program.opts().token ?? getProjectToken(program.opts().project);
      const format = program.opts().format as OutputFormat;
      let result: unknown;
      if (opts.id) {
        result = await get(token, `/api/1/item/${opts.id}`);
      } else if (opts.uuid) {
        result = await get(token, '/api/1/item_by_uuid', { uuid: opts.uuid });
      } else if (opts.counter) {
        result = await get(token, '/api/1/item_by_counter', { counter: opts.counter });
      } else {
        throw new Error('Provide one of --id, --uuid, or --counter');
      }
      printOutput(result, format);
    });

  items
    .command('list')
    .description('List items (GET /api/1/items/)')
    .option('--status <status>', 'Filter by status (active, resolved, muted, etc.)')
    .option('--level <level>', 'Filter by level (critical, error, warning, info, debug)')
    .option('--environment <environment>', 'Filter by environment (e.g. production, staging)')
    .option('--page <page>', 'Page number')
    .action(async (opts: { status?: string; level?: string; environment?: string; page?: string }) => {
      const token = program.opts().token ?? getProjectToken(program.opts().project);
      const format = program.opts().format as OutputFormat;
      const result = await get(token, '/api/1/items/', {
        status: opts.status,
        level: opts.level,
        environment: opts.environment,
        page: opts.page,
      });
      printOutput(result, format);
    });

  items
    .command('update')
    .description('Update an item (PATCH /api/1/item/:id)')
    .argument('<id>', 'Item ID')
    .requiredOption('--data <json>', 'Update data as JSON')
    .action(async (id: string, opts: { data: string }) => {
      const token = program.opts().token ?? getProjectToken(program.opts().project);
      const format = program.opts().format as OutputFormat;
      const result = await patch(token, `/api/1/item/${id}`, parseJsonArg(opts.data));
      printOutput(result, format);
    });
}
