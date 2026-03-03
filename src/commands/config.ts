import { Command } from 'commander';
import {
  hasAccessToken,
  hasAccountToken,
  loadConfig,
  removeAccountToken,
  removeProject,
  saveConfig,
  setAccountToken,
  setToken,
} from '../config.ts';
import type { OutputFormat } from '../output.ts';
import { printOutput } from '../output.ts';

export function registerConfigCommand(program: Command): void {
  const config = program.command('config').description('Manage Rollbar CLI configuration');

  config
    .command('set-token')
    .description('Set project access token (stored in OS keychain)')
    .argument('<project-name>', 'Project name')
    .argument('<access-token>', 'Rollbar project access token')
    .action((projectName: string, accessToken: string) => {
      setToken(projectName, accessToken);
      const format = program.opts().format as OutputFormat;
      printOutput(
        { message: `Token set for project "${projectName}" (stored in OS keychain)` },
        format,
      );
    });

  config
    .command('set-account-token')
    .description('Set global account-level token (stored in OS keychain)')
    .argument('<token>', 'Rollbar account access token')
    .action((token: string) => {
      setAccountToken(token);
      const format = program.opts().format as OutputFormat;
      printOutput({ message: 'Account token set (stored in OS keychain)' }, format);
    });

  config
    .command('remove-account-token')
    .description('Remove the global account-level token from OS keychain')
    .action(() => {
      removeAccountToken();
      const format = program.opts().format as OutputFormat;
      printOutput({ message: 'Account token removed from keychain' }, format);
    });

  config
    .command('set-default')
    .description('Set default project')
    .argument('<project-name>', 'Project name')
    .action((projectName: string) => {
      const cfg = loadConfig();
      if (!cfg.projects.includes(projectName)) {
        console.error(`Warning: project "${projectName}" has no token configured yet.`);
      }
      cfg.defaultProject = projectName;
      saveConfig(cfg);
      const format = program.opts().format as OutputFormat;
      printOutput({ message: `Default project set to "${projectName}"` }, format);
    });

  config
    .command('list')
    .description('List all configured projects')
    .action(() => {
      const cfg = loadConfig();
      const format = program.opts().format as OutputFormat;
      const projects = cfg.projects.map((name) => ({
        name,
        hasAccessToken: hasAccessToken(name),
        isDefault: cfg.defaultProject === name,
      }));
      printOutput(projects, format);
    });

  config
    .command('remove')
    .description('Remove a project configuration and its token from OS keychain')
    .argument('<project-name>', 'Project name')
    .action((projectName: string) => {
      removeProject(projectName);
      const format = program.opts().format as OutputFormat;
      printOutput(
        { message: `Project "${projectName}" removed (token deleted from keychain)` },
        format,
      );
    });

  config
    .command('show')
    .description('Show current configuration')
    .action(() => {
      const cfg = loadConfig();
      const format = program.opts().format as OutputFormat;
      const display = {
        defaultProject: cfg.defaultProject ?? '(none)',
        accountToken: hasAccountToken() ? '(stored in keychain)' : '(not set)',
        projects: Object.fromEntries(
          cfg.projects.map((name) => [
            name,
            {
              accessToken: hasAccessToken(name) ? '(stored in keychain)' : '(not set)',
            },
          ]),
        ),
      };
      printOutput(display, format);
    });
}
