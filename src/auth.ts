import type { Command } from 'commander';
import { getAccountToken, getProjectToken } from './config.ts';

export function projectToken(program: Command): string {
  return program.opts().token ?? getProjectToken(program.opts().project);
}

export function accountToken(program: Command): string {
  return program.opts().accountToken ?? getAccountToken();
}
