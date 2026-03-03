import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { Entry } from '@napi-rs/keyring';

const SERVICE_NAME = 'rollbar-cli';
const ACCOUNT_KEY = 'account';

export interface Config {
  defaultProject?: string;
  projects: string[];
}

function getConfigDir(): string {
  return join(homedir(), '.rollbar-cli');
}

function getConfigFile(): string {
  return join(getConfigDir(), 'config.json');
}

export function loadConfig(): Config {
  if (!existsSync(getConfigFile())) {
    return { projects: [] };
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

function projectKey(project: string): string {
  return `project:${project}`;
}

export function setToken(project: string, token: string): void {
  const entry = new Entry(SERVICE_NAME, projectKey(project));
  entry.setPassword(token);

  const config = loadConfig();
  if (!config.projects.includes(project)) {
    config.projects.push(project);
  }
  saveConfig(config);
}

export function setAccountToken(token: string): void {
  const entry = new Entry(SERVICE_NAME, ACCOUNT_KEY);
  entry.setPassword(token);
}

export function removeProject(project: string): void {
  try {
    new Entry(SERVICE_NAME, projectKey(project)).deletePassword();
  } catch {
    // ignore if not found
  }

  const config = loadConfig();
  config.projects = config.projects.filter((p) => p !== project);
  if (config.defaultProject === project) {
    config.defaultProject = undefined;
  }
  saveConfig(config);
}

export function removeAccountToken(): void {
  try {
    new Entry(SERVICE_NAME, ACCOUNT_KEY).deletePassword();
  } catch {
    // ignore if not found
  }
}

function resolveProject(name?: string): string {
  const config = loadConfig();
  const projectName = name ?? config.defaultProject;
  if (!projectName) {
    throw new Error(
      'No project specified and no default project set. Use --project or run: rollbar config set-default <name>',
    );
  }
  if (!config.projects.includes(projectName)) {
    throw new Error(
      `Project "${projectName}" not found. Run: rollbar config set-token ${projectName} <token>`,
    );
  }
  return projectName;
}

export function getProjectToken(name?: string): string {
  const projectName = resolveProject(name);
  try {
    const entry = new Entry(SERVICE_NAME, projectKey(projectName));
    const password = entry.getPassword();
    if (!password) {
      throw new Error('empty');
    }
    return password;
  } catch {
    throw new Error(
      `No access token stored for "${projectName}". Run: rollbar config set-token ${projectName} <token>`,
    );
  }
}

export function getAccountToken(): string {
  try {
    const entry = new Entry(SERVICE_NAME, ACCOUNT_KEY);
    const password = entry.getPassword();
    if (!password) {
      throw new Error('empty');
    }
    return password;
  } catch {
    throw new Error('No account token configured. Run: rollbar config set-account-token <token>');
  }
}

export function hasAccessToken(project: string): boolean {
  try {
    const entry = new Entry(SERVICE_NAME, projectKey(project));
    return !!entry.getPassword();
  } catch {
    return false;
  }
}

export function hasAccountToken(): boolean {
  try {
    const entry = new Entry(SERVICE_NAME, ACCOUNT_KEY);
    return !!entry.getPassword();
  } catch {
    return false;
  }
}
