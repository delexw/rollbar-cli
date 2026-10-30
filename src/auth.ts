import type { Command } from 'commander';
import type { Auth } from './client.ts';
import { get } from './client.ts';
import {
  getAccountToken,
  getProjectToken,
  hasAccessToken,
  hasAccountToken,
  loadConfig,
} from './config.ts';

interface RollbarProject {
  id: number;
  name: string | null;
}

async function resolveProjectId(token: string, project: string): Promise<number> {
  if (/^\d+$/.test(project)) return Number(project);

  const projects = await get<RollbarProject[]>({ token }, '/api/1/projects');
  const named = projects.filter((p) => p.name);
  const exact = named.find((p) => p.name === project);
  if (exact) return exact.id;

  const caseInsensitive = named.filter((p) => p.name!.toLowerCase() === project.toLowerCase());
  if (caseInsensitive.length === 1) return caseInsensitive[0]!.id;

  throw new Error(
    `Project "${project}" not found among the ${named.length} projects this account token can access. Run: rollbar projects list`,
  );
}

export async function projectAuth(program: Command): Promise<Auth> {
  const opts = program.opts();
  if (opts.token) return { token: opts.token };

  const config = loadConfig();
  const project: string | undefined = opts.project ?? config.defaultProject;
  if (project && config.projects.includes(project) && hasAccessToken(project)) {
    return { token: getProjectToken(project) };
  }

  const account: string | undefined =
    opts.accountToken ?? (hasAccountToken() ? getAccountToken() : undefined);
  if (!account) return { token: getProjectToken(opts.project) };

  if (!project) {
    throw new Error(
      'No project specified and no default project set. Use --project <name|id> or run: rollbar config set-default <name>',
    );
  }
  return { token: account, projectId: await resolveProjectId(account, project) };
}

export function accountAuth(program: Command): Auth {
  return { token: program.opts().accountToken ?? getAccountToken() };
}
