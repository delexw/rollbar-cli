import { Command } from 'commander';
import { del, get } from '../client.ts';
import { getProjectToken } from '../config.ts';
import type { OutputFormat } from '../output.ts';
import { printOutput } from '../output.ts';

export function registerReplaysCommand(program: Command): void {
  const replays = program.command('replays').description('Manage session replays');

  replays
    .command('get')
    .description('Get a session replay')
    .argument('<environment>', 'Environment name')
    .argument('<session-id>', 'Session ID')
    .argument('<replay-id>', 'Replay ID')
    .action(async (environment: string, sessionId: string, replayId: string) => {
      const token = program.opts().token ?? getProjectToken(program.opts().project);
      const format = program.opts().format as OutputFormat;
      const result = await get(token, `/api/1/replay/${environment}/${sessionId}/${replayId}`);
      printOutput(result, format);
    });

  replays
    .command('delete')
    .description('Delete a session replay')
    .argument('<environment>', 'Environment name')
    .argument('<session-id>', 'Session ID')
    .argument('<replay-id>', 'Replay ID')
    .action(async (environment: string, sessionId: string, replayId: string) => {
      const token = program.opts().token ?? getProjectToken(program.opts().project);
      const format = program.opts().format as OutputFormat;
      const result = await del(token, `/api/1/replay/${environment}/${sessionId}/${replayId}`);
      printOutput(result, format);
    });
}
