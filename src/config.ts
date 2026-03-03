import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

export interface ProjectConfig {
  accessToken: string;
  accountToken?: string;
}

export interface Config {
  defaultProject?: string;
  projects: Record<string, ProjectConfig>;
}

function getConfigDir(): string {
  return join(homedir(), '.rollbar-cli');
}

function getConfigFile(): string {
  return join(getConfigDir(), 'config.json');
}

export function loadConfig(): Config {
  if (!existsSync(getConfigFile())) {
    return { projects: {} };
  }
  const raw = readFileSync(getConfigFile(), 'utf-8');
  return JSON.parse(raw) as Config;
}

export function saveConfig(config: Config): void {
  if (!existsSync(getConfigDir())) {
    mkdirSync(getConfigDir(), { recursive: true });
  }
  writeFileSync(getConfigFile(), JSON.stringify(config, null, 2) + '\n');
}

export function getProjectToken(name?: string): string {
  const config = loadConfig();
  const projectName = name ?? config.defaultProject;
  if (!projectName) {
    throw new Error(
      'No project specified and no default project set. Use --project or run: rollbar config set-default <name>',
    );
  }
  const project = config.projects[projectName];
  if (!project) {
    throw new Error(
      `Project "${projectName}" not found. Run: rollbar config set-token ${projectName} <token>`,
    );
  }
  return project.accessToken;
}

export function getAccountToken(name?: string): string {
  const config = loadConfig();
  const projectName = name ?? config.defaultProject;
  if (!projectName) {
    throw new Error(
      'No project specified and no default project set. Use --project or run: rollbar config set-default <name>',
    );
  }
  const project = config.projects[projectName];
  if (!project?.accountToken) {
    throw new Error(
      `No account token for "${projectName}". Run: rollbar config set-account-token ${projectName} <token>`,
    );
  }
  return project.accountToken;
}
