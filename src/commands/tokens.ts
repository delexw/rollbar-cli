import { Command } from 'commander';
import { del, get, patch, post } from '../client.ts';
import { getProjectToken } from '../config.ts';
import type { OutputFormat } from '../output.ts';
import { parseJsonArg, printOutput } from '../output.ts';

export function registerTokensCommand(program: Command): void {
  const tokens = program.command('tokens').description('Manage project access tokens');

  tokens
    .command('list')
    .description('List access tokens (GET /api/1/project/:id/access_tokens)')
    .argument('<project-id>', 'Project ID')
    .action(async (projectId: string) => {
      const token = program.opts().token ?? getProjectToken(program.opts().project);
      const format = program.opts().format as OutputFormat;
      const result = await get(token, `/api/1/project/${projectId}/access_tokens`);
      printOutput(result, format);
    });

  tokens
    .command('create')
    .description('Create an access token (POST /api/1/project/:id/access_tokens)')
    .argument('<project-id>', 'Project ID')
    .requiredOption('--data <json>', 'Token configuration as JSON')
    .action(async (projectId: string, opts: { data: string }) => {
      const token = program.opts().token ?? getProjectToken(program.opts().project);
      const format = program.opts().format as OutputFormat;
      const result = await post(
        token,
        `/api/1/project/${projectId}/access_tokens`,
        parseJsonArg(opts.data),
      );
      printOutput(result, format);
    });

  tokens
    .command('update-rate-limit')
    .description('Update token rate limit (PATCH /api/1/project/:id/access_token/:token)')
    .argument('<project-id>', 'Project ID')
    .argument('<access-token>', 'Access token to update')
    .requiredOption('--data <json>', 'Rate limit data as JSON')
    .action(async (projectId: string, accessToken: string, opts: { data: string }) => {
      const token = program.opts().token ?? getProjectToken(program.opts().project);
      const format = program.opts().format as OutputFormat;
      const result = await patch(
        token,
        `/api/1/project/${projectId}/access_token/${accessToken}`,
        parseJsonArg(opts.data),
      );
      printOutput(result, format);
    });

  tokens
    .command('delete')
    .description('Delete an access token (DELETE /api/1/project/:id/access_token/:token)')
    .argument('<project-id>', 'Project ID')
    .argument('<access-token>', 'Access token to delete')
    .action(async (projectId: string, accessToken: string) => {
      const token = program.opts().token ?? getProjectToken(program.opts().project);
      const format = program.opts().format as OutputFormat;
      const result = await del(token, `/api/1/project/${projectId}/access_token/${accessToken}`);
      printOutput(result, format);
    });

  tokens
    .command('update-rate-limit-body')
    .description('Update token rate limit via body (PATCH /api/1/project/:id/access_tokens)')
    .argument('<project-id>', 'Project ID')
    .requiredOption('--data <json>', 'Rate limit data with token in body as JSON')
    .action(async (projectId: string, opts: { data: string }) => {
      const token = program.opts().token ?? getProjectToken(program.opts().project);
      const format = program.opts().format as OutputFormat;
      const result = await patch(
        token,
        `/api/1/project/${projectId}/access_tokens`,
        parseJsonArg(opts.data),
      );
      printOutput(result, format);
    });

  tokens
    .command('delete-body')
    .description('Delete token via body (DELETE /api/1/project/:id/access_tokens)')
    .argument('<project-id>', 'Project ID')
    .requiredOption('--data <json>', 'Token data in body as JSON')
    .action(async (projectId: string, opts: { data: string }) => {
      const token = program.opts().token ?? getProjectToken(program.opts().project);
      const format = program.opts().format as OutputFormat;
      const result = await del(
        token,
        `/api/1/project/${projectId}/access_tokens`,
        parseJsonArg(opts.data),
      );
      printOutput(result, format);
    });
}
