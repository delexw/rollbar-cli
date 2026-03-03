import { Command } from 'commander';
import { del, get, put } from '../client.ts';
import { getAccountToken } from '../config.ts';
import type { OutputFormat } from '../output.ts';
import { printOutput } from '../output.ts';

export function registerTeamProjectsCommand(program: Command): void {
  const tp = program.command('team-projects').description('Manage team-project relationships');

  tp.command('list-by-team')
    .description('List projects in a team (GET /api/1/team/:id/projects)')
    .argument('<team-id>', 'Team ID')
    .action(async (teamId: string) => {
      const token = program.opts().accountToken ?? getAccountToken(program.opts().project);
      const format = program.opts().format as OutputFormat;
      const result = await get(token, `/api/1/team/${teamId}/projects`);
      printOutput(result, format);
    });

  tp.command('list-by-project')
    .description('List teams for a project (GET /api/1/project/:id/teams)')
    .argument('<project-id>', 'Project ID')
    .action(async (projectId: string) => {
      const token = program.opts().accountToken ?? getAccountToken(program.opts().project);
      const format = program.opts().format as OutputFormat;
      const result = await get(token, `/api/1/project/${projectId}/teams`);
      printOutput(result, format);
    });

  tp.command('check')
    .description('Check if project is in team (GET /api/1/team/:id/project/:pid)')
    .argument('<team-id>', 'Team ID')
    .argument('<project-id>', 'Project ID')
    .action(async (teamId: string, projectId: string) => {
      const token = program.opts().accountToken ?? getAccountToken(program.opts().project);
      const format = program.opts().format as OutputFormat;
      const result = await get(token, `/api/1/team/${teamId}/project/${projectId}`);
      printOutput(result, format);
    });

  tp.command('assign')
    .description('Add project to team (PUT /api/1/team/:id/project/:pid)')
    .argument('<team-id>', 'Team ID')
    .argument('<project-id>', 'Project ID')
    .action(async (teamId: string, projectId: string) => {
      const token = program.opts().accountToken ?? getAccountToken(program.opts().project);
      const format = program.opts().format as OutputFormat;
      const result = await put(token, `/api/1/team/${teamId}/project/${projectId}`);
      printOutput(result, format);
    });

  tp.command('remove')
    .description('Remove project from team (DELETE /api/1/team/:id/project/:pid)')
    .argument('<team-id>', 'Team ID')
    .argument('<project-id>', 'Project ID')
    .action(async (teamId: string, projectId: string) => {
      const token = program.opts().accountToken ?? getAccountToken(program.opts().project);
      const format = program.opts().format as OutputFormat;
      const result = await del(token, `/api/1/team/${teamId}/project/${projectId}`);
      printOutput(result, format);
    });
}
