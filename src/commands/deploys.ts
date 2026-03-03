import { Command } from 'commander';
import { get, patch, post } from '../client.ts';
import { getProjectToken } from '../config.ts';
import type { OutputFormat } from '../output.ts';
import { parseJsonArg, printOutput } from '../output.ts';

export function registerDeploysCommand(program: Command): void {
  const deploys = program.command('deploys').description('Manage Rollbar deploys');

  deploys
    .command('create')
    .description('Create a deploy (POST /api/1/deploy/)')
    .requiredOption('--data <json>', 'Deploy data as JSON')
    .action(async (opts: { data: string }) => {
      const token = program.opts().token ?? getProjectToken(program.opts().project);
      const format = program.opts().format as OutputFormat;
      const result = await post(token, '/api/1/deploy/', parseJsonArg(opts.data));
      printOutput(result, format);
    });

  deploys
    .command('get')
    .description('Get a deploy (GET /api/1/deploy/:id)')
    .argument('<deploy-id>', 'Deploy ID')
    .action(async (deployId: string) => {
      const token = program.opts().token ?? getProjectToken(program.opts().project);
      const format = program.opts().format as OutputFormat;
      const result = await get(token, `/api/1/deploy/${deployId}`);
      printOutput(result, format);
    });

  deploys
    .command('update')
    .description('Update a deploy (PATCH /api/1/deploy/:id)')
    .argument('<deploy-id>', 'Deploy ID')
    .requiredOption('--data <json>', 'Update data as JSON')
    .action(async (deployId: string, opts: { data: string }) => {
      const token = program.opts().token ?? getProjectToken(program.opts().project);
      const format = program.opts().format as OutputFormat;
      const result = await patch(token, `/api/1/deploy/${deployId}`, parseJsonArg(opts.data));
      printOutput(result, format);
    });

  deploys
    .command('list')
    .description('List deploys (GET /api/1/deploys/)')
    .option('--page <page>', 'Page number')
    .action(async (opts: { page?: string }) => {
      const token = program.opts().token ?? getProjectToken(program.opts().project);
      const format = program.opts().format as OutputFormat;
      const result = await get(token, '/api/1/deploys/', { page: opts.page });
      printOutput(result, format);
    });
}
