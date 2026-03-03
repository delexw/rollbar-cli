import { Command } from 'commander';
import { get, post } from '../client.ts';
import { getProjectToken } from '../config.ts';
import type { OutputFormat } from '../output.ts';
import { printOutput } from '../output.ts';

export function registerPeopleCommand(program: Command): void {
  const people = program.command('people').description('People/GDPR data management');

  people
    .command('delete')
    .description('Request deletion of person data (POST /api/1/person/delete)')
    .requiredOption('--person-id <id>', 'Person ID to delete')
    .action(async (opts: { personId: string }) => {
      const token = program.opts().token ?? getProjectToken(program.opts().project);
      const format = program.opts().format as OutputFormat;
      const result = await post(token, '/api/1/person/delete', { person_id: opts.personId });
      printOutput(result, format);
    });

  people
    .command('delete-status')
    .description('Check person deletion status (GET /api/1/person/delete/status)')
    .requiredOption('--person-id <id>', 'Person ID to check')
    .action(async (opts: { personId: string }) => {
      const token = program.opts().token ?? getProjectToken(program.opts().project);
      const format = program.opts().format as OutputFormat;
      const result = await get(token, '/api/1/person/delete/status', {
        person_id: opts.personId,
      });
      printOutput(result, format);
    });
}
