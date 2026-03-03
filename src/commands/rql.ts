import { Command } from 'commander';
import { get, post } from '../client.ts';
import { getProjectToken } from '../config.ts';
import type { OutputFormat } from '../output.ts';
import { printOutput } from '../output.ts';

export function registerRqlCommand(program: Command): void {
  const rql = program.command('rql').description('Run RQL queries');

  rql
    .command('create')
    .description('Create an RQL job (POST /api/1/rql/jobs)')
    .requiredOption('--query <rql-string>', 'RQL query string')
    .action(async (opts: { query: string }) => {
      const token = program.opts().token ?? getProjectToken(program.opts().project);
      const format = program.opts().format as OutputFormat;
      const result = await post(token, '/api/1/rql/jobs', { query_string: opts.query });
      printOutput(result, format);
    });

  rql
    .command('check')
    .description('Check RQL job status (GET /api/1/rql/job/:id)')
    .argument('<job-id>', 'RQL job ID')
    .action(async (jobId: string) => {
      const token = program.opts().token ?? getProjectToken(program.opts().project);
      const format = program.opts().format as OutputFormat;
      const result = await get(token, `/api/1/rql/job/${jobId}`);
      printOutput(result, format);
    });

  rql
    .command('list')
    .description('List RQL jobs (GET /api/1/rql/jobs)')
    .action(async () => {
      const token = program.opts().token ?? getProjectToken(program.opts().project);
      const format = program.opts().format as OutputFormat;
      const result = await get(token, '/api/1/rql/jobs');
      printOutput(result, format);
    });

  rql
    .command('results')
    .description('Get RQL job results (GET /api/1/rql/job/:id/result)')
    .argument('<job-id>', 'RQL job ID')
    .action(async (jobId: string) => {
      const token = program.opts().token ?? getProjectToken(program.opts().project);
      const format = program.opts().format as OutputFormat;
      const result = await get(token, `/api/1/rql/job/${jobId}/result`);
      printOutput(result, format);
    });

  rql
    .command('cancel')
    .description('Cancel an RQL job (POST /api/1/rql/job/:id/cancel)')
    .argument('<job-id>', 'RQL job ID')
    .action(async (jobId: string) => {
      const token = program.opts().token ?? getProjectToken(program.opts().project);
      const format = program.opts().format as OutputFormat;
      const result = await post(token, `/api/1/rql/job/${jobId}/cancel`);
      printOutput(result, format);
    });
}
