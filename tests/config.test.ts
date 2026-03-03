import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// We need to mock the config module's internal paths, so we'll test the logic
// by importing and mocking the fs calls
vi.mock('os', async (importOriginal) => {
  const original = await importOriginal<typeof import('os')>();
  return {
    ...original,
    homedir: vi.fn(),
  };
});

import { homedir } from 'os';
import { getAccountToken, getProjectToken, loadConfig, saveConfig } from '../src/config.ts';
import type { Config } from '../src/config.ts';

describe('config', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = join(
      tmpdir(),
      `rollbar-cli-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    );
    mkdirSync(testDir, { recursive: true });
    vi.mocked(homedir).mockReturnValue(testDir);
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  describe('loadConfig', () => {
    it('returns empty config when no config file exists', () => {
      const config = loadConfig();
      expect(config).toEqual({ projects: {} });
    });

    it('loads existing config from file', () => {
      const configDir = join(testDir, '.rollbar-cli');
      mkdirSync(configDir, { recursive: true });
      const data: Config = {
        defaultProject: 'my-app',
        projects: { 'my-app': { accessToken: 'tok_123' } },
      };
      writeFileSync(join(configDir, 'config.json'), JSON.stringify(data));

      const config = loadConfig();
      expect(config.defaultProject).toBe('my-app');
      expect(config.projects['my-app']?.accessToken).toBe('tok_123');
    });
  });

  describe('saveConfig', () => {
    it('creates config directory and file', () => {
      const config: Config = {
        defaultProject: 'test',
        projects: { test: { accessToken: 'abc' } },
      };
      saveConfig(config);

      const configPath = join(testDir, '.rollbar-cli', 'config.json');
      expect(existsSync(configPath)).toBe(true);

      const saved = JSON.parse(readFileSync(configPath, 'utf-8'));
      expect(saved.defaultProject).toBe('test');
      expect(saved.projects.test.accessToken).toBe('abc');
    });

    it('overwrites existing config', () => {
      const config1: Config = { projects: { a: { accessToken: '1' } } };
      saveConfig(config1);

      const config2: Config = { projects: { b: { accessToken: '2' } } };
      saveConfig(config2);

      const configPath = join(testDir, '.rollbar-cli', 'config.json');
      const saved = JSON.parse(readFileSync(configPath, 'utf-8'));
      expect(saved.projects.b.accessToken).toBe('2');
      expect(saved.projects.a).toBeUndefined();
    });
  });

  describe('getProjectToken', () => {
    it('returns token for named project', () => {
      const configDir = join(testDir, '.rollbar-cli');
      mkdirSync(configDir, { recursive: true });
      writeFileSync(
        join(configDir, 'config.json'),
        JSON.stringify({ projects: { app: { accessToken: 'tok_abc' } } }),
      );

      expect(getProjectToken('app')).toBe('tok_abc');
    });

    it('returns token for default project when no name given', () => {
      const configDir = join(testDir, '.rollbar-cli');
      mkdirSync(configDir, { recursive: true });
      writeFileSync(
        join(configDir, 'config.json'),
        JSON.stringify({
          defaultProject: 'app',
          projects: { app: { accessToken: 'tok_def' } },
        }),
      );

      expect(getProjectToken()).toBe('tok_def');
    });

    it('throws when no project specified and no default', () => {
      const configDir = join(testDir, '.rollbar-cli');
      mkdirSync(configDir, { recursive: true });
      writeFileSync(join(configDir, 'config.json'), JSON.stringify({ projects: {} }));

      expect(() => getProjectToken()).toThrow('No project specified');
    });

    it('throws when project not found', () => {
      const configDir = join(testDir, '.rollbar-cli');
      mkdirSync(configDir, { recursive: true });
      writeFileSync(join(configDir, 'config.json'), JSON.stringify({ projects: {} }));

      expect(() => getProjectToken('nonexistent')).toThrow('not found');
    });
  });

  describe('getAccountToken', () => {
    it('returns account token for named project', () => {
      const configDir = join(testDir, '.rollbar-cli');
      mkdirSync(configDir, { recursive: true });
      writeFileSync(
        join(configDir, 'config.json'),
        JSON.stringify({
          projects: { app: { accessToken: 'tok', accountToken: 'acct_tok' } },
        }),
      );

      expect(getAccountToken('app')).toBe('acct_tok');
    });

    it('throws when no account token set', () => {
      const configDir = join(testDir, '.rollbar-cli');
      mkdirSync(configDir, { recursive: true });
      writeFileSync(
        join(configDir, 'config.json'),
        JSON.stringify({ projects: { app: { accessToken: 'tok' } } }),
      );

      expect(() => getAccountToken('app')).toThrow('No account token');
    });
  });
});
