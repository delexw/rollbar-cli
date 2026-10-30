import { Command } from 'commander';
import { projectToken, accountToken } from '../auth.ts';
import { del, get, post } from '../client.ts';
import type { OutputFormat } from '../output.ts';
import { printOutput } from '../output.ts';

export function registerProjectsCommand(program: Command): void {
  const projects = program.command('projects').description('Manage Rollbar projects');

  projects
    .command('create')
    .description('Create a project (POST /api/1/projects)')
    .requiredOption('--name <name>', 'Project name')
    .action(async (opts: { name: string }) => {
      const token = accountToken(program);
      const format = program.opts().format as OutputFormat;
      const result = await post(token, '/api/1/projects', { name: opts.name });
      printOutput(result, format);
    });

  projects
    .command('list')
    .description('List all projects (GET /api/1/projects)')
    .action(async () => {
      const token = accountToken(program);
      const format = program.opts().format as OutputFormat;
      const result = await get(token, '/api/1/projects');
      printOutput(result, format);
    });

  projects
    .command('get')
    .description('Get a project (GET /api/1/project/:id)')
    .argument('<project-id>', 'Project ID')
    .action(async (projectId: string) => {
      const token = projectToken(program);
      const format = program.opts().format as OutputFormat;
      const result = await get(token, `/api/1/project/${projectId}`);
      printOutput(result, format);
    });

  projects
    .command('delete')
    .description('Delete a project (DELETE /api/1/project/:id)')
    .argument('<project-id>', 'Project ID')
    .action(async (projectId: string) => {
      const token = projectToken(program);
      const format = program.opts().format as OutputFormat;
      const result = await del(token, `/api/1/project/${projectId}`);
      printOutput(result, format);
    });
}
