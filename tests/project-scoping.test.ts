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
import { registerItemsCommand } from '../src/commands/items.ts';
import { registerRqlCommand } from '../src/commands/rql.ts';
import { setAccountToken, setToken } from '../src/config.ts';

function makeProgram(): Command {
  const program = new Command()
    .option('--project <name>')
    .option('--token <token>')
    .option('--account-token <token>')
    .option('--format <format>', '', 'json')
    .exitOverride();
  registerItemsCommand(program);
  registerRqlCommand(program);
  return program;
}

describe('project scoping with an account token', () => {
  let testDir: string;
  const mockFetch = vi.fn();

  beforeEach(() => {
    testDir = join(
      tmpdir(),
      `rollbar-cli-scope-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    );
    mkdirSync(testDir, { recursive: true });
    vi.mocked(homedir).mockReturnValue(testDir);
    mockPasswords.clear();
    mockFetch.mockReset();
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify({ err: 0, result: {} })),
    });
    vi.stubGlobal('fetch', mockFetch);
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('items list sends project_ids, which GET /api/1/items requires', async () => {
    setAccountToken('acct');
    await makeProgram().parseAsync(['--project', '2519', 'items', 'list', '--status', 'active'], {
      from: 'user',
    });
    const url = new URL(mockFetch.mock.calls[0]![0]);
    expect(url.pathname).toBe('/api/1/items/');
    expect(url.searchParams.get('project_ids')).toBe('2519');
    expect(url.searchParams.get('status')).toBe('active');
  });

  it('rql create puts project_id in the request body', async () => {
    setAccountToken('acct');
    await makeProgram().parseAsync(['--project', '2519', 'rql', 'create', '--query', 'select 1'], {
      from: 'user',
    });
    const [, opts] = mockFetch.mock.calls[0]!;
    expect(JSON.parse(opts.body)).toEqual({ query_string: 'select 1', project_id: 2519 });
  });

  it('sends no project parameters when the project has its own token', async () => {
    setToken('sso', 'proj_tok');
    await makeProgram().parseAsync(['--project', 'sso', 'items', 'list'], { from: 'user' });
    await makeProgram().parseAsync(['--project', 'sso', 'rql', 'create', '--query', 'select 1'], {
      from: 'user',
    });
    const itemsUrl = new URL(mockFetch.mock.calls[0]![0]);
    expect(itemsUrl.searchParams.has('project_ids')).toBe(false);
    expect(itemsUrl.searchParams.has('project_id')).toBe(false);
    expect(JSON.parse(mockFetch.mock.calls[1]![1].body)).toEqual({ query_string: 'select 1' });
  });
});
