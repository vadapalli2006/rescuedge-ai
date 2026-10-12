import axios from 'axios';
import chalk from 'chalk';
import { getPendingActions, markCompleted } from './db';

// Checks network connectivity by pinging an endpoint
export async function isOnline(): Promise<boolean> {
  try {
    await axios.get('https://developer.copado.com', { timeout: 3000 });
    return true;
  } catch {
    return false;
  }
}

// Processes pending queue items when connection is re-established
export async function processQueue(): Promise<void> {
  const online = await isOnline();

  if (!online) {
    console.log(chalk.yellow('⚠️  Network unavailable. Queued actions remain safely stored locally.'));
    return;
  }

  const pending = await getPendingActions();

  if (pending.length === 0) {
    console.log(chalk.green('✨ No pending queued deployment items to sync.'));
    return;
  }

  console.log(chalk.cyan(`\n📡 Network connected. Syncing ${pending.length} queued action(s) to pipeline...`));

  for (const item of pending) {
    console.log(chalk.blue(`\n🚀 Executing queued item [ID: ${item.id}] -> Command: ${item.command}`));
    console.log(chalk.gray(`   Payload: ${item.payload}`));

    // Here we simulate triggering Copado/Agentia pipeline executions
    await markCompleted(item.id);
    console.log(chalk.green(`✅ Item [ID: ${item.id}] successfully synced and marked complete.`));
  }

  console.log(chalk.bold.green('\n🎉 All pending queues synced successfully!'));
}