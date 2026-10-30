import { Command } from 'commander';
import { projectToken } from '../auth.ts';
import { post } from '../client.ts';
import type { OutputFormat } from '../output.ts';
import { parseJsonArg, printOutput } from '../output.ts';

export function registerMetricsCommand(program: Command): void {
  const metrics = program.command('metrics').description('Query Rollbar metrics');

  metrics
    .command('items')
    .description('Get item metrics (POST /api/1/metrics/items)')
    .requiredOption('--data <json>', 'Metrics query as JSON')
    .action(async (opts: { data: string }) => {
      const token = projectToken(program);
      const format = program.opts().format as OutputFormat;
      const result = await post(token, '/api/1/metrics/items', parseJsonArg(opts.data));
      printOutput(result, format);
    });

  metrics
    .command('occurrences')
    .description('Get occurrence metrics (POST /api/1/metrics/occurrences)')
    .requiredOption('--data <json>', 'Metrics query as JSON')
    .action(async (opts: { data: string }) => {
      const token = projectToken(program);
      const format = program.opts().format as OutputFormat;
      const result = await post(token, '/api/1/metrics/occurrences', parseJsonArg(opts.data));
      printOutput(result, format);
    });

  metrics
    .command('ttr')
    .description('Get time-to-resolve metrics (POST /api/1/metrics/ttr)')
    .requiredOption('--data <json>', 'Metrics query as JSON')
    .action(async (opts: { data: string }) => {
      const token = projectToken(program);
      const format = program.opts().format as OutputFormat;
      const result = await post(token, '/api/1/metrics/ttr', parseJsonArg(opts.data));
      printOutput(result, format);
    });
}
