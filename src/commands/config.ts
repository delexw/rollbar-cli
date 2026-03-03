import { Command } from 'commander';
import { loadConfig, saveConfig } from '../config.ts';
import type { OutputFormat } from '../output.ts';
import { printOutput } from '../output.ts';

export function registerConfigCommand(program: Command): void {
  const config = program.command('config').description('Manage Rollbar CLI configuration');

  config
    .command('set-token')
    .description('Set project access token')
    .argument('<project-name>', 'Project name')
    .argument('<access-token>', 'Rollbar project access token')
    .action((projectName: string, accessToken: string) => {
      const cfg = loadConfig();
      cfg.projects[projectName] = { ...cfg.projects[projectName], accessToken };
      saveConfig(cfg);
      const format = program.opts().format as OutputFormat;
      printOutput({ message: `Token set for project "${projectName}"` }, format);
    });

  config
    .command('set-account-token')
    .description('Set account-level token for a project')
    .argument('<project-name>', 'Project name')
    .argument('<token>', 'Rollbar account access token')
    .action((projectName: string, token: string) => {
      const cfg = loadConfig();
      if (!cfg.projects[projectName]) {
        cfg.projects[projectName] = { accessToken: '', accountToken: token };
      } else {
        cfg.projects[projectName]!.accountToken = token;
      }
      saveConfig(cfg);
      const format = program.opts().format as OutputFormat;
      printOutput({ message: `Account token set for project "${projectName}"` }, format);
    });

  config
    .command('set-default')
    .description('Set default project')
    .argument('<project-name>', 'Project name')
    .action((projectName: string) => {
      const cfg = loadConfig();
      if (!cfg.projects[projectName]) {
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
      const projects = Object.entries(cfg.projects).map(([name, p]) => ({
        name,
        hasAccessToken: !!p.accessToken,
        hasAccountToken: !!p.accountToken,
        isDefault: cfg.defaultProject === name,
      }));
      printOutput(projects, format);
    });

  config
    .command('remove')
    .description('Remove a project configuration')
    .argument('<project-name>', 'Project name')
    .action((projectName: string) => {
      const cfg = loadConfig();
      delete cfg.projects[projectName];
      if (cfg.defaultProject === projectName) {
        cfg.defaultProject = undefined;
      }
      saveConfig(cfg);
      const format = program.opts().format as OutputFormat;
      printOutput({ message: `Project "${projectName}" removed` }, format);
    });

  config
    .command('show')
    .description('Show current configuration')
    .action(() => {
      const cfg = loadConfig();
      const format = program.opts().format as OutputFormat;
      const display = {
        defaultProject: cfg.defaultProject ?? '(none)',
        projects: Object.fromEntries(
          Object.entries(cfg.projects).map(([name, p]) => [
            name,
            {
              accessToken: p.accessToken ? `${p.accessToken.slice(0, 8)}...` : '(not set)',
              accountToken: p.accountToken ? `${p.accountToken.slice(0, 8)}...` : '(not set)',
            },
          ]),
        ),
      };
      printOutput(display, format);
    });
}
