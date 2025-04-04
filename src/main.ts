import { loginToAmazon } from "./auth.js";
import { runSearchScraper } from "./scrappers/search.js";
import { launchBrowser } from "./utils/browser.js";
import figlet from 'figlet';
import chalk from 'chalk';
import inquirer from "inquirer";
import { runOrderScraper } from "./scrappers/orders.js";

/**
 * Some predefined delay values (in milliseconds).
 */
export enum Delays {
  Short = 500,
  Medium = 2000,
  Long = 5000,
}

/**
 * Returns a Promise<string> that resolves after a given time.
 *
 * @param {string} name - A name.
 * @param {number=} [delay=Delays.Medium] - A number of milliseconds to delay resolution of the Promise.
 * @returns {Promise<string>}
 */

function displayBanner() {
  console.log(chalk.blue(figlet.textSync('Amazon Scraper', { horizontalLayout: 'full' })));
  console.log(chalk.green('🚀 Welcome to the Amazon Scraper CLI!'));
  console.log(chalk.yellow('🔎 Search, filter, and scrape Amazon products effortlessly!'));
}

export async function greeter() {

  displayBanner()

  const credentials = await inquirer.prompt([
    { type: 'input', name: 'username', message: '📧 Enter your Amazon email:' },
    { type: 'password', name: 'password', message: '🔑 Enter your Amazon password:', mask: '*' }
  ]);
  

  console.log('🚀 Starting Scraperrr::');

  const browser = await launchBrowser();
  if (!browser) return;

  const page = await browser.newPage();

  const isLoggedIn = await loginToAmazon(page, credentials.username, credentials.password);
  if (!isLoggedIn) return;

  while (isLoggedIn) {
    const { choice } = await inquirer.prompt([
      {
        type: 'list',
        name: 'choice',
        message: '🛍️ Choose an option:',
        choices: [
          { name: '1️⃣ Scrape Purchased Orders', value: 'orders' },
          { name: '2️⃣ Search for Products', value: 'search' }
        ]
      }
    ]);

    if (choice === 'orders') {
      await runOrderScraper(page);
    } else {
      const { searchQuery } = await inquirer.prompt([
        { type: 'input', name: 'searchQuery', message: '🔎 Enter the product to search:' }
      ]);
      await runSearchScraper(page, searchQuery);
    }

    const { continueSession } = await inquirer.prompt([
      { type: 'confirm', name: 'continueSession', message: '🔄 Do you want to continue with the same login?', default: true }
    ]);

    if (!continueSession) {
      break;
    }
  }

}
greeter().then(() => {
  process.exit(0)
})