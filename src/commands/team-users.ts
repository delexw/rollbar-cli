import { Command } from 'commander';
import { del, get, post, put } from '../client.ts';
import { getAccountToken } from '../config.ts';
import type { OutputFormat } from '../output.ts';
import { printOutput } from '../output.ts';

export function registerTeamUsersCommand(program: Command): void {
  const tu = program.command('team-users').description('Manage team-user relationships');

  tu.command('list')
    .description('List users in a team (GET /api/1/team/:id/users)')
    .argument('<team-id>', 'Team ID')
    .action(async (teamId: string) => {
      const token = program.opts().accountToken ?? getAccountToken();
      const format = program.opts().format as OutputFormat;
      const result = await get(token, `/api/1/team/${teamId}/users`);
      printOutput(result, format);
    });

  tu.command('check')
    .description('Check if user is in team (GET /api/1/team/:id/user/:uid)')
    .argument('<team-id>', 'Team ID')
    .argument('<user-id>', 'User ID')
    .action(async (teamId: string, userId: string) => {
      const token = program.opts().accountToken ?? getAccountToken();
      const format = program.opts().format as OutputFormat;
      const result = await get(token, `/api/1/team/${teamId}/user/${userId}`);
      printOutput(result, format);
    });

  tu.command('assign')
    .description('Add user to team (PUT /api/1/team/:id/user/:uid)')
    .argument('<team-id>', 'Team ID')
    .argument('<user-id>', 'User ID')
    .action(async (teamId: string, userId: string) => {
      const token = program.opts().accountToken ?? getAccountToken();
      const format = program.opts().format as OutputFormat;
      const result = await put(token, `/api/1/team/${teamId}/user/${userId}`);
      printOutput(result, format);
    });

  tu.command('remove')
    .description('Remove user from team (DELETE /api/1/team/:id/user/:uid)')
    .argument('<team-id>', 'Team ID')
    .argument('<user-id>', 'User ID')
    .action(async (teamId: string, userId: string) => {
      const token = program.opts().accountToken ?? getAccountToken();
      const format = program.opts().format as OutputFormat;
      const result = await del(token, `/api/1/team/${teamId}/user/${userId}`);
      printOutput(result, format);
    });

  tu.command('user-teams')
    .description("List a user's teams (GET /api/1/user/:id/teams)")
    .argument('<user-id>', 'User ID')
    .action(async (userId: string) => {
      const token = program.opts().accountToken ?? getAccountToken();
      const format = program.opts().format as OutputFormat;
      const result = await get(token, `/api/1/user/${userId}/teams`);
      printOutput(result, format);
    });

  tu.command('invitations')
    .description('List pending invitations for a team (GET /api/1/team/:id/invites)')
    .argument('<team-id>', 'Team ID')
    .action(async (teamId: string) => {
      const token = program.opts().accountToken ?? getAccountToken();
      const format = program.opts().format as OutputFormat;
      const result = await get(token, `/api/1/team/${teamId}/invites`);
      printOutput(result, format);
    });

  tu.command('invite')
    .description('Invite user to team (POST /api/1/team/:id/invites)')
    .argument('<team-id>', 'Team ID')
    .requiredOption('--email <email>', 'Email address to invite')
    .action(async (teamId: string, opts: { email: string }) => {
      const token = program.opts().accountToken ?? getAccountToken();
      const format = program.opts().format as OutputFormat;
      const result = await post(token, `/api/1/team/${teamId}/invites`, { email: opts.email });
      printOutput(result, format);
    });

  tu.command('get-invitation')
    .description('Get invitation details (GET /api/1/invite/:id)')
    .argument('<invite-id>', 'Invitation ID')
    .action(async (inviteId: string) => {
      const token = program.opts().accountToken ?? getAccountToken();
      const format = program.opts().format as OutputFormat;
      const result = await get(token, `/api/1/invite/${inviteId}`);
      printOutput(result, format);
    });

  tu.command('cancel-invitation')
    .description('Cancel an invitation (DELETE /api/1/invite/:id)')
    .argument('<invite-id>', 'Invitation ID')
    .action(async (inviteId: string) => {
      const token = program.opts().accountToken ?? getAccountToken();
      const format = program.opts().format as OutputFormat;
      const result = await del(token, `/api/1/invite/${inviteId}`);
      printOutput(result, format);
    });
}
