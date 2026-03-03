import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('os', async (importOriginal) => {
  const original = await importOriginal<typeof import('os')>();
  return {
    ...original,
    homedir: vi.fn(),
  };
});

// Mock the keyring so tests don't interact with real OS keychain
const mockPasswords = new Map<string, string>();
vi.mock('@napi-rs/keyring', () => ({
  Entry: class MockEntry {
    service: string;
    key: string;
    constructor(service: string, key: string) {
      this.service = service;
      this.key = key;
    }
    setPassword(password: string) {
      mockPasswords.set(`${this.service}:${this.key}`, password);
    }
    getPassword(): string | null {
      return mockPasswords.get(`${this.service}:${this.key}`) ?? null;
    }
    deletePassword() {
      if (!mockPasswords.has(`${this.service}:${this.key}`)) {
        throw new Error('not found');
      }
      mockPasswords.delete(`${this.service}:${this.key}`);
    }
  },
}));

import { homedir } from 'os';
import {
  getAccountToken,
  getProjectToken,
  hasAccessToken,
  hasAccountToken,
  loadConfig,
  removeAccountToken,
  removeProject,
  saveConfig,
  setAccountToken,
  setToken,
} from '../src/config.ts';
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
    mockPasswords.clear();
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  describe('loadConfig', () => {
    it('returns empty config when no config file exists', () => {
      const config = loadConfig();
      expect(config).toEqual({ projects: [] });
    });

    it('loads existing config from file', () => {
      const configDir = join(testDir, '.rollbar-cli');
      mkdirSync(configDir, { recursive: true });
      const data: Config = {
        defaultProject: 'my-app',
        projects: ['my-app'],
      };
      writeFileSync(join(configDir, 'config.json'), JSON.stringify(data));

      const config = loadConfig();
      expect(config.defaultProject).toBe('my-app');
      expect(config.projects).toEqual(['my-app']);
    });
  });

  describe('saveConfig', () => {
    it('creates config directory and file', () => {
      const config: Config = {
        defaultProject: 'test',
        projects: ['test'],
      };
      saveConfig(config);

      const configPath = join(testDir, '.rollbar-cli', 'config.json');
      expect(existsSync(configPath)).toBe(true);

      const saved = JSON.parse(readFileSync(configPath, 'utf-8'));
      expect(saved.defaultProject).toBe('test');
      expect(saved.projects).toEqual(['test']);
    });
  });

  describe('setToken', () => {
    it('stores project access token in keychain and adds project to config', () => {
      setToken('my-app', 'tok_abc');

      const config = loadConfig();
      expect(config.projects).toContain('my-app');
      expect(hasAccessToken('my-app')).toBe(true);
    });

    it('does not duplicate project name on repeated set', () => {
      setToken('my-app', 'tok_1');
      setToken('my-app', 'tok_2');

      const config = loadConfig();
      expect(config.projects.filter((p) => p === 'my-app').length).toBe(1);
    });
  });

  describe('setAccountToken / getAccountToken', () => {
    it('stores and retrieves a global account token', () => {
      setAccountToken('acct_xyz');
      expect(getAccountToken()).toBe('acct_xyz');
    });

    it('throws when no account token is set', () => {
      expect(() => getAccountToken()).toThrow('No account token configured');
    });

    it('account token is independent of projects', () => {
      setAccountToken('acct_global');
      setToken('app-a', 'tok_a');
      setToken('app-b', 'tok_b');

      // Same account token regardless of project context
      expect(getAccountToken()).toBe('acct_global');
    });
  });

  describe('removeAccountToken', () => {
    it('removes the global account token', () => {
      setAccountToken('acct_xyz');
      expect(hasAccountToken()).toBe(true);

      removeAccountToken();
      expect(hasAccountToken()).toBe(false);
    });

    it('does not throw when no account token exists', () => {
      expect(() => removeAccountToken()).not.toThrow();
    });
  });

  describe('getProjectToken', () => {
    it('returns token for named project from keychain', () => {
      setToken('app', 'tok_abc');
      expect(getProjectToken('app')).toBe('tok_abc');
    });

    it('returns token for default project when no name given', () => {
      setToken('app', 'tok_def');
      const config = loadConfig();
      config.defaultProject = 'app';
      saveConfig(config);

      expect(getProjectToken()).toBe('tok_def');
    });

    it('throws when no project specified and no default', () => {
      expect(() => getProjectToken()).toThrow('No project specified');
    });

    it('throws when project not found in config', () => {
      expect(() => getProjectToken('nonexistent')).toThrow('not found');
    });

    it('throws when token not in keychain', () => {
      const config = loadConfig();
      config.projects.push('orphan');
      saveConfig(config);

      expect(() => getProjectToken('orphan')).toThrow('No access token stored');
    });
  });

  describe('removeProject', () => {
    it('removes project token from keychain and project from config', () => {
      setToken('app', 'tok');
      removeProject('app');

      const config = loadConfig();
      expect(config.projects).not.toContain('app');
      expect(hasAccessToken('app')).toBe(false);
    });

    it('does not affect the global account token', () => {
      setToken('app', 'tok');
      setAccountToken('acct_global');

      removeProject('app');

      expect(hasAccountToken()).toBe(true);
      expect(getAccountToken()).toBe('acct_global');
    });

    it('clears default if removed project was default', () => {
      setToken('app', 'tok');
      const config = loadConfig();
      config.defaultProject = 'app';
      saveConfig(config);

      removeProject('app');
      expect(loadConfig().defaultProject).toBeUndefined();
    });
  });

  describe('hasAccessToken / hasAccountToken', () => {
    it('returns false when no token stored', () => {
      expect(hasAccessToken('nope')).toBe(false);
      expect(hasAccountToken()).toBe(false);
    });

    it('returns true when tokens are stored', () => {
      setToken('app', 'tok');
      setAccountToken('acct');
      expect(hasAccessToken('app')).toBe(true);
      expect(hasAccountToken()).toBe(true);
    });
  });
});
