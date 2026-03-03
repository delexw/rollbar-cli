import { Command } from 'commander';
import { del, get, post } from '../client.ts';
import { getAccountToken, getProjectToken } from '../config.ts';
import type { OutputFormat } from '../output.ts';
import { printOutput } from '../output.ts';

export function registerProjectsCommand(program: Command): void {
  const projects = program.command('projects').description('Manage Rollbar projects');

  projects
    .command('create')
    .description('Create a project (POST /api/1/projects)')
    .requiredOption('--name <name>', 'Project name')
    .action(async (opts: { name: string }) => {
      const token = program.opts().accountToken ?? getAccountToken(program.opts().project);
      const format = program.opts().format as OutputFormat;
      const result = await post(token, '/api/1/projects', { name: opts.name });
      printOutput(result, format);
    });

  projects
    .command('list')
    .description('List all projects (GET /api/1/projects)')
    .action(async () => {
      const token = program.opts().accountToken ?? getAccountToken(program.opts().project);
      const format = program.opts().format as OutputFormat;
      const result = await get(token, '/api/1/projects');
      printOutput(result, format);
    });

  projects
    .command('get')
    .description('Get a project (GET /api/1/project/:id)')
    .argument('<project-id>', 'Project ID')
    .action(async (projectId: string) => {
      const token = program.opts().token ?? getProjectToken(program.opts().project);
      const format = program.opts().format as OutputFormat;
      const result = await get(token, `/api/1/project/${projectId}`);
      printOutput(result, format);
    });

  projects
    .command('delete')
    .description('Delete a project (DELETE /api/1/project/:id)')
    .argument('<project-id>', 'Project ID')
    .action(async (projectId: string) => {
      const token = program.opts().token ?? getProjectToken(program.opts().project);
      const format = program.opts().format as OutputFormat;
      const result = await del(token, `/api/1/project/${projectId}`);
      printOutput(result, format);
    });
}
