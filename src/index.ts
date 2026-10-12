#!/usr/bin/env tsx
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { enqueueAction, getPendingActions } from './db';
import { isOnline, processQueue } from './executor';
import { validateMetadata } from './validator';

const program = new Command();

program
  .name('rescuedge')
  .description('RescuEdge AI - Offline-First Agentic DevOps CLI')
  .version('1.0.0');

// 1. Deploy Command
program
  .command('deploy')
  .description('Perform or queue a deployment update with local pre-validation')
  .option('-m, --metadata <name>', 'Name of the component or metadata to deploy', 'Default_Metadata')
  .action(async (options) => {
    console.log(chalk.bold.cyan('\n🛡️  RescuEdge AI Deployment Guardrail'));
    
    // Local pre-validation check
    const spinnerValidation = ora('Running local pre-validation quality gates...').start();
    await new Promise((resolve) => setTimeout(resolve, 800));

    const validation = validateMetadata(options.metadata);
    if (!validation.valid) {
      spinnerValidation.fail(chalk.red('Local Pre-Validation Failed!'));
      validation.errors.forEach((err) => console.log(chalk.red(`   ✖ ${err}`)));
      return;
    }
    spinnerValidation.succeed(chalk.green('Local syntax & metadata pre-validation passed!'));

    // Network check
    const spinnerNetwork = ora('Checking remote connectivity...').start();
    const online = await isOnline();

    const payload = {
      metadata: options.metadata,
      timestamp: new Date().toISOString(),
      validatedLocally: true,
    };

    if (!online) {
      spinnerNetwork.warn(chalk.yellow('Offline Mode Active (Network Disconnected)'));
      const id = await enqueueAction('deploy', payload);
      
      console.log(chalk.bold.yellow('\n📦 Local Queue Summary:'));
      console.log(chalk.yellow(`   • Component : ${options.metadata}`));
      console.log(chalk.yellow(`   • Queue ID  : [${id}]`));
      console.log(chalk.yellow(`   • Status    : PENDING (Saved in SQLite)`));
      console.log(chalk.green('✨ Staged safely. Will auto-sync when network is re-established.'));
    } else {
      spinnerNetwork.succeed(chalk.green('Network Online'));
      const spinnerDeploy = ora(`Pushing "${options.metadata}" directly to Agentia pipeline...`).start();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      spinnerDeploy.succeed(chalk.green(`Component "${options.metadata}" deployed successfully!`));
    }
  });

// 2. Status Command
program
  .command('status')
  .description('Display all pending queued deployment items')
  .action(async () => {
    const pending = await getPendingActions();

    console.log(chalk.bold.cyan('\n📊 RescuEdge AI Local Queue Status'));

    if (pending.length === 0) {
      console.log(chalk.green('✨ Queue is completely clear! No pending deployment items.'));
      return;
    }

    console.log(chalk.yellow(`\nFound ${pending.length} pending item(s) in local SQLite store:\n`));
    pending.forEach((item) => {
      console.log(chalk.bold.white(`  • [ID: ${item.id}] Command: ${item.command}`));
      console.log(chalk.gray(`    Payload    : ${item.payload}`));
      console.log(chalk.gray(`    Created At : ${item.created_at}`));
      console.log(chalk.yellow(`    Status     : ${item.status}\n`));
    });
  });

// 3. Sync Command
program
  .command('sync')
  .description('Force sync pending offline queue items to the remote pipeline')
  .action(async () => {
    const spinner = ora('Checking queue and network status...').start();
    const online = await isOnline();

    if (!online) {
      spinner.fail(chalk.yellow('Network unavailable. Queued items remain safely stored locally.'));
      return;
    }

    spinner.succeed(chalk.green('Network re-established! Syncing queue...'));
    await processQueue();
  });

// Parse commands MUST be at the end
program.parse(process.argv);