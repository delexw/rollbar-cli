import { readFileSync } from 'fs';
import { basename } from 'path';
import { Command } from 'commander';
import { postForm } from '../client.ts';
import { getProjectToken } from '../config.ts';
import type { OutputFormat } from '../output.ts';
import { printOutput } from '../output.ts';

export function registerSourcemapsCommand(program: Command): void {
  const sm = program.command('sourcemaps').description('Upload source maps and symbol files');

  sm.command('upload-js')
    .description('Upload JavaScript source map')
    .requiredOption('--file <path>', 'Path to source map file')
    .option('--version <version>', 'Code version')
    .option('--minified-url <url>', 'URL of the minified file')
    .action(async (opts: { file: string; version?: string; minifiedUrl?: string }) => {
      const token = program.opts().token ?? getProjectToken(program.opts().project);
      const format = program.opts().format as OutputFormat;
      const form = new FormData();
      const fileContent = readFileSync(opts.file);
      form.append('source_map', new Blob([fileContent]), basename(opts.file));
      form.append('access_token', token);
      if (opts.version) form.append('version', opts.version);
      if (opts.minifiedUrl) form.append('minified_url', opts.minifiedUrl);
      const result = await postForm(token, '/api/1/sourcemap', form);
      printOutput(result, format);
    });

  sm.command('upload-dsym')
    .description('Upload dSYM file for iOS')
    .requiredOption('--file <path>', 'Path to dSYM zip file')
    .option('--version <version>', 'Code version')
    .action(async (opts: { file: string; version?: string }) => {
      const token = program.opts().token ?? getProjectToken(program.opts().project);
      const format = program.opts().format as OutputFormat;
      const form = new FormData();
      const fileContent = readFileSync(opts.file);
      form.append('dsym', new Blob([fileContent]), basename(opts.file));
      form.append('access_token', token);
      if (opts.version) form.append('version', opts.version);
      const result = await postForm(token, '/api/1/dsym', form);
      printOutput(result, format);
    });

  sm.command('upload-proguard')
    .description('Upload ProGuard mapping file for Android')
    .requiredOption('--file <path>', 'Path to ProGuard mapping file')
    .option('--version <version>', 'Code version')
    .action(async (opts: { file: string; version?: string }) => {
      const token = program.opts().token ?? getProjectToken(program.opts().project);
      const format = program.opts().format as OutputFormat;
      const form = new FormData();
      const fileContent = readFileSync(opts.file);
      form.append('proguard', new Blob([fileContent]), basename(opts.file));
      form.append('access_token', token);
      if (opts.version) form.append('version', opts.version);
      const result = await postForm(token, '/api/1/proguard', form);
      printOutput(result, format);
    });

  sm.command('upload-flutter')
    .description('Upload Flutter symbols file')
    .requiredOption('--file <path>', 'Path to Flutter symbols file')
    .option('--version <version>', 'Code version')
    .action(async (opts: { file: string; version?: string }) => {
      const token = program.opts().token ?? getProjectToken(program.opts().project);
      const format = program.opts().format as OutputFormat;
      const form = new FormData();
      const fileContent = readFileSync(opts.file);
      form.append('flutter_symbols', new Blob([fileContent]), basename(opts.file));
      form.append('access_token', token);
      if (opts.version) form.append('version', opts.version);
      const result = await postForm(token, '/api/1/flutter_symbols', form);
      printOutput(result, format);
    });
}
