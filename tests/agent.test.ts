import { execSync } from 'child_process';
import { describe, expect, it } from 'vitest';

function run(args: string): string {
  return execSync(`bun run src/index.ts ${args}`, {
    cwd: import.meta.dirname + '/..',
    encoding: 'utf-8',
    env: { ...process.env, PATH: `${process.env.HOME}/.bun/bin:${process.env.PATH}` },
  });
}

describe('agent command', () => {
  it('outputs full prompt by default', () => {
    const output = run('agent');
    expect(output).toContain('# Rollbar CLI - AI Agent Reference');
    expect(output).toContain('## Setup');
    expect(output).toContain('## Available Commands');
    expect(output).toContain('## Common Workflows');
  });

  it('full prompt covers all command groups', () => {
    const output = run('agent');
    const groups = [
      'Items',
      'Occurrences',
      'Metrics',
      'Deploys',
      'Environments',
      'Source Maps',
      'RQL',
      'Reports',
      'Projects',
      'Access Tokens',
      'Teams',
      'Users',
      'Team-User',
      'Team-Project',
      'User-Project',
      'People',
      'Notifications',
      'Session Replays',
      'Service Links',
      'Versions',
    ];
    for (const group of groups) {
      expect(output).toContain(group);
    }
  });

  it('outputs compact prompt with --compact', () => {
    const output = run('agent --compact');
    expect(output).toContain('# Rollbar CLI Reference (Compact)');
    expect(output).not.toContain('## Common Workflows');
    expect(output).toContain('rollbar config set-token');
  });

  it('compact prompt lists all command names', () => {
    const output = run('agent --compact');
    const commands = [
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
    ];
    for (const cmd of commands) {
      expect(output).toContain(cmd);
    }
  });
});
