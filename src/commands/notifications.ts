import { Command } from 'commander';
import { del, get, post, put } from '../client.ts';
import { getProjectToken } from '../config.ts';
import type { OutputFormat } from '../output.ts';
import { parseJsonArg, printOutput } from '../output.ts';

const VALID_CHANNELS = ['slack', 'webhook', 'pagerduty', 'email'];

function validateChannel(channel: string): string {
  if (!VALID_CHANNELS.includes(channel)) {
    throw new Error(`Invalid channel "${channel}". Must be one of: ${VALID_CHANNELS.join(', ')}`);
  }
  return channel;
}

export function registerNotificationsCommand(program: Command): void {
  const notif = program
    .command('notifications')
    .description('Manage notification channels and rules');

  notif
    .command('configure')
    .description('Configure a notification channel (PUT /api/1/notifications/<channel>)')
    .argument('<channel>', 'Channel: slack, webhook, pagerduty, email')
    .requiredOption('--data <json>', 'Channel configuration as JSON')
    .action(async (channel: string, opts: { data: string }) => {
      validateChannel(channel);
      const token = program.opts().token ?? getProjectToken(program.opts().project);
      const format = program.opts().format as OutputFormat;
      const result = await put(token, `/api/1/notifications/${channel}`, parseJsonArg(opts.data));
      printOutput(result, format);
    });

  const rules = notif.command('rules').description('Manage notification rules');

  rules
    .command('list')
    .description('List notification rules (GET /api/1/notifications/<channel>/rules)')
    .argument('<channel>', 'Channel: slack, webhook, pagerduty, email')
    .action(async (channel: string) => {
      validateChannel(channel);
      const token = program.opts().token ?? getProjectToken(program.opts().project);
      const format = program.opts().format as OutputFormat;
      const result = await get(token, `/api/1/notifications/${channel}/rules`);
      printOutput(result, format);
    });

  rules
    .command('create')
    .description('Create a notification rule (POST /api/1/notifications/<channel>/rules)')
    .argument('<channel>', 'Channel: slack, webhook, pagerduty, email')
    .requiredOption('--data <json>', 'Rule data as JSON')
    .action(async (channel: string, opts: { data: string }) => {
      validateChannel(channel);
      const token = program.opts().token ?? getProjectToken(program.opts().project);
      const format = program.opts().format as OutputFormat;
      const result = await post(
        token,
        `/api/1/notifications/${channel}/rules`,
        parseJsonArg(opts.data),
      );
      printOutput(result, format);
    });

  rules
    .command('replace')
    .description('Replace all notification rules (PUT /api/1/notifications/<channel>/rules)')
    .argument('<channel>', 'Channel: slack, webhook, pagerduty, email')
    .requiredOption('--data <json>', 'Rules array as JSON')
    .action(async (channel: string, opts: { data: string }) => {
      validateChannel(channel);
      const token = program.opts().token ?? getProjectToken(program.opts().project);
      const format = program.opts().format as OutputFormat;
      const result = await put(
        token,
        `/api/1/notifications/${channel}/rules`,
        parseJsonArg(opts.data),
      );
      printOutput(result, format);
    });

  rules
    .command('get')
    .description('Get a notification rule (GET /api/1/notifications/<channel>/rule/:id)')
    .argument('<channel>', 'Channel: slack, webhook, pagerduty, email')
    .argument('<rule-id>', 'Rule ID')
    .action(async (channel: string, ruleId: string) => {
      validateChannel(channel);
      const token = program.opts().token ?? getProjectToken(program.opts().project);
      const format = program.opts().format as OutputFormat;
      const result = await get(token, `/api/1/notifications/${channel}/rule/${ruleId}`);
      printOutput(result, format);
    });

  rules
    .command('update')
    .description('Update a notification rule (PUT /api/1/notifications/<channel>/rule/:id)')
    .argument('<channel>', 'Channel: slack, webhook, pagerduty, email')
    .argument('<rule-id>', 'Rule ID')
    .requiredOption('--data <json>', 'Rule data as JSON')
    .action(async (channel: string, ruleId: string, opts: { data: string }) => {
      validateChannel(channel);
      const token = program.opts().token ?? getProjectToken(program.opts().project);
      const format = program.opts().format as OutputFormat;
      const result = await put(
        token,
        `/api/1/notifications/${channel}/rule/${ruleId}`,
        parseJsonArg(opts.data),
      );
      printOutput(result, format);
    });

  rules
    .command('delete')
    .description('Delete a notification rule (DELETE /api/1/notifications/<channel>/rule/:id)')
    .argument('<channel>', 'Channel: slack, webhook, pagerduty, email')
    .argument('<rule-id>', 'Rule ID')
    .action(async (channel: string, ruleId: string) => {
      validateChannel(channel);
      const token = program.opts().token ?? getProjectToken(program.opts().project);
      const format = program.opts().format as OutputFormat;
      const result = await del(token, `/api/1/notifications/${channel}/rule/${ruleId}`);
      printOutput(result, format);
    });
}
