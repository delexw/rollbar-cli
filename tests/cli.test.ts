import { execSync } from 'child_process';
import { describe, expect, it } from 'vitest';

function run(args: string): string {
  return execSync(`bun run src/index.ts ${args}`, {
    cwd: import.meta.dirname + '/..',
    encoding: 'utf-8',
    env: { ...process.env, PATH: `${process.env.HOME}/.bun/bin:${process.env.PATH}` },
  });
}

function runCode(args: string): { stdout: string; code: number } {
  try {
    const stdout = execSync(`bun run src/index.ts ${args}`, {
      cwd: import.meta.dirname + '/..',
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, PATH: `${process.env.HOME}/.bun/bin:${process.env.PATH}` },
    });
    return { stdout, code: 0 };
  } catch (e: unknown) {
    const err = e as { status: number; stdout: string };
    return { stdout: err.stdout ?? '', code: err.status };
  }
}

describe('CLI integration', () => {
  describe('rollbar --help', () => {
    it('shows all command groups', () => {
      const output = run('--help');
      const expected = [
        'config',
        'items',
        'occurrences',
        'metrics',
        'deploys',
        'environments',
        'sourcemaps',
        'rql',
        'reports',
        'projects',
        'tokens',
        'teams',
        'users',
        'team-users',
        'team-projects',
        'user-projects',
        'people',
        'notifications',
        'replays',
        'service-links',
        'versions',
        'agent',
      ];
      for (const cmd of expected) {
        expect(output).toContain(cmd);
      }
    });

    it('shows version option', () => {
      const output = run('--help');
      expect(output).toContain('--version');
    });

    it('shows global options', () => {
      const output = run('--help');
      expect(output).toContain('--project');
      expect(output).toContain('--token');
      expect(output).toContain('--account-token');
      expect(output).toContain('--format');
    });
  });

  describe('subcommand --help', () => {
    const commands = [
      'items',
      'occurrences',
      'metrics',
      'deploys',
      'environments',
      'sourcemaps',
      'rql',
      'reports',
      'projects',
      'tokens',
      'teams',
      'users',
      'team-users',
      'team-projects',
      'user-projects',
      'people',
      'notifications',
      'replays',
      'service-links',
      'versions',
      'config',
    ];

    it.each(commands)('rollbar %s --help exits successfully', (cmd) => {
      const { code } = runCode(`${cmd} --help`);
      expect(code).toBe(0);
    });
  });

  describe('items subcommands', () => {
    it('items --help shows create, get, list, update', () => {
      const output = run('items --help');
      expect(output).toContain('create');
      expect(output).toContain('get');
      expect(output).toContain('list');
      expect(output).toContain('update');
    });

    it('items list --help shows filter options', () => {
      const output = run('items list --help');
      expect(output).toContain('--status');
      expect(output).toContain('--level');
      expect(output).toContain('--page');
    });
  });

  describe('notifications subcommands', () => {
    it('notifications --help shows configure and rules', () => {
      const output = run('notifications --help');
      expect(output).toContain('configure');
      expect(output).toContain('rules');
    });

    it('notifications rules --help shows CRUD operations', () => {
      const output = run('notifications rules --help');
      expect(output).toContain('list');
      expect(output).toContain('create');
      expect(output).toContain('replace');
      expect(output).toContain('get');
      expect(output).toContain('update');
      expect(output).toContain('delete');
    });
  });

  describe('team-users subcommands', () => {
    it('team-users --help shows all 9 subcommands', () => {
      const output = run('team-users --help');
      expect(output).toContain('list');
      expect(output).toContain('check');
      expect(output).toContain('assign');
      expect(output).toContain('remove');
      expect(output).toContain('user-teams');
      expect(output).toContain('invitations');
      expect(output).toContain('invite');
      expect(output).toContain('get-invitation');
      expect(output).toContain('cancel-invitation');
    });
  });
});
