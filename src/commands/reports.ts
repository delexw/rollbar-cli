import { Command } from 'commander';
import { get } from '../client.ts';
import { getProjectToken } from '../config.ts';
import type { OutputFormat } from '../output.ts';
import { printOutput } from '../output.ts';

export function registerReportsCommand(program: Command): void {
  const reports = program.command('reports').description('Get Rollbar reports');

  reports
    .command('top-active')
    .description('Get top active items (GET /api/1/reports/top_active_items)')
    .option('--hours <hours>', 'Number of hours to look back')
    .option('--environments <envs>', 'Comma-separated environments')
    .action(async (opts: { hours?: string; environments?: string }) => {
      const token = program.opts().token ?? getProjectToken(program.opts().project);
      const format = program.opts().format as OutputFormat;
      const result = await get(token, '/api/1/reports/top_active_items', {
        hours: opts.hours,
        environments: opts.environments,
      });
      printOutput(result, format);
    });

  reports
    .command('occurrence-counts')
    .description('Get occurrence counts (GET /api/1/reports/occurrence_counts)')
    .option('--hours <hours>', 'Number of hours to look back')
    .option('--bucket-size <size>', 'Bucket size in seconds')
    .action(async (opts: { hours?: string; bucketSize?: string }) => {
      const token = program.opts().token ?? getProjectToken(program.opts().project);
      const format = program.opts().format as OutputFormat;
      const result = await get(token, '/api/1/reports/occurrence_counts', {
        hours: opts.hours,
        bucket_size: opts.bucketSize,
      });
      printOutput(result, format);
    });

  reports
    .command('activated-counts')
    .description('Get activated item counts (GET /api/1/reports/activated_counts)')
    .option('--hours <hours>', 'Number of hours to look back')
    .option('--bucket-size <size>', 'Bucket size in seconds')
    .action(async (opts: { hours?: string; bucketSize?: string }) => {
      const token = program.opts().token ?? getProjectToken(program.opts().project);
      const format = program.opts().format as OutputFormat;
      const result = await get(token, '/api/1/reports/activated_counts', {
        hours: opts.hours,
        bucket_size: opts.bucketSize,
      });
      printOutput(result, format);
    });
}
