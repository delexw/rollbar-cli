import { mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { Command } from 'commander';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('os', async (importOriginal) => {
  const original = await importOriginal<typeof import('os')>();
  return {
    ...original,
    homedir: vi.fn(),
  };
});

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
      mockPasswords.delete(`${this.service}:${this.key}`);
    }
  },
}));

import { homedir } from 'os';
import { accountAuth, projectAuth } from '../src/auth.ts';
import { loadConfig, saveConfig, setAccountToken, setToken } from '../src/config.ts';

function makeProgram(args: string[] = []): Command {
  const program = new Command()
    .option('--project <name>')
    .option('--token <token>')
    .option('--account-token <token>')
    .exitOverride();
  program.parse(args, { from: 'user' });
  return program;
}

describe('auth', () => {
  let testDir: string;
  const mockFetch = vi.fn();

  function mockProjects(projects: { id: number; name: string | null }[]) {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify({ err: 0, result: projects })),
    });
  }

  beforeEach(() => {
    testDir = join(
      tmpdir(),
      `rollbar-cli-auth-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    );
    mkdirSync(testDir, { recursive: true });
    vi.mocked(homedir).mockReturnValue(testDir);
    mockPasswords.clear();
    mockFetch.mockReset();
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
    vi.unstubAllGlobals();
  });

  describe('projectAuth', () => {
    it('uses an explicit --token as-is', async () => {
      setAccountToken('acct');
      const auth = await projectAuth(makeProgram(['--token', 'explicit', '--project', 'app']));
      expect(auth).toEqual({ token: 'explicit' });
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("prefers the project's own token over the account token", async () => {
      setToken('app', 'proj_tok');
      setAccountToken('acct');
      const auth = await projectAuth(makeProgram(['--project', 'app']));
      expect(auth).toEqual({ token: 'proj_tok' });
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('uses the default project token when no --project is given', async () => {
      setToken('app', 'proj_tok');
      saveConfig({ ...loadConfig(), defaultProject: 'app' });
      const auth = await projectAuth(makeProgram());
      expect(auth).toEqual({ token: 'proj_tok' });
    });

    it('falls back to the account token and looks the project up by name', async () => {
      setAccountToken('acct');
      mockProjects([
        { id: 1, name: 'elements-backend' },
        { id: 7, name: 'rss' },
        { id: 9, name: null },
      ]);
      const auth = await projectAuth(makeProgram(['--project', 'rss']));
      expect(auth).toEqual({ token: 'acct', projectId: 7 });
      const [url, opts] = mockFetch.mock.calls[0]!;
      expect(url).toBe('https://api.rollbar.com/api/1/projects');
      expect(opts.headers['X-Rollbar-Access-Token']).toBe('acct');
    });

    it('matches a project name case-insensitively when only one project fits', async () => {
      setAccountToken('acct');
      mockProjects([{ id: 3, name: 'SSO' }]);
      const auth = await projectAuth(makeProgram(['--project', 'sso']));
      expect(auth).toEqual({ token: 'acct', projectId: 3 });
    });

    it('prefers an exact name over a case-insensitive one', async () => {
      setAccountToken('acct');
      mockProjects([
        { id: 3, name: 'SSO' },
        { id: 4, name: 'sso' },
      ]);
      const auth = await projectAuth(makeProgram(['--project', 'sso']));
      expect(auth).toEqual({ token: 'acct', projectId: 4 });
    });

    it('rejects a name that matches several projects case-insensitively', async () => {
      setAccountToken('acct');
      mockProjects([
        { id: 3, name: 'SSO' },
        { id: 4, name: 'Sso' },
      ]);
      await expect(projectAuth(makeProgram(['--project', 'sso']))).rejects.toThrow(
        'Project "sso" not found among the 2 projects',
      );
    });

    it('uses a numeric --project as the project ID without a lookup', async () => {
      setAccountToken('acct');
      const auth = await projectAuth(makeProgram(['--project', '12345']));
      expect(auth).toEqual({ token: 'acct', projectId: 12345 });
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('uses an explicit --account-token when no account token is stored', async () => {
      const auth = await projectAuth(
        makeProgram(['--account-token', 'flag_acct', '--project', '5']),
      );
      expect(auth).toEqual({ token: 'flag_acct', projectId: 5 });
    });

    it('reports an unknown project name', async () => {
      setAccountToken('acct');
      mockProjects([{ id: 1, name: 'elements-backend' }]);
      await expect(projectAuth(makeProgram(['--project', 'nope']))).rejects.toThrow(
        'Project "nope" not found among the 1 projects this account token can access',
      );
    });

    it('asks for a project when an account token is set but none is chosen', async () => {
      setAccountToken('acct');
      await expect(projectAuth(makeProgram())).rejects.toThrow('No project specified');
    });

    it('keeps the old error when there is neither a project token nor an account token', async () => {
      await expect(projectAuth(makeProgram(['--project', 'app']))).rejects.toThrow(
        'Project "app" not found. Run: rollbar config set-token app <token>',
      );
    });
  });

  describe('accountAuth', () => {
    it('uses the stored account token', () => {
      setAccountToken('acct');
      expect(accountAuth(makeProgram())).toEqual({ token: 'acct' });
    });

    it('prefers an explicit --account-token', () => {
      setAccountToken('acct');
      expect(accountAuth(makeProgram(['--account-token', 'flag_acct']))).toEqual({
        token: 'flag_acct',
      });
    });
  });
});
