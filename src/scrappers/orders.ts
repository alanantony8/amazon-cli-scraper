import { Page } from 'playwright';
import { saveToFile } from '../utils/helpers.js';

/**
 * Scrapes Amazon order history.
 */
async function scrapeOrderHistory(page: Page): Promise<any[]> {
  return await page.evaluate(() => {
    // return Array.from(document.querySelectorAll('.order-card__list'))
    //   .map(order => ({
    //     name: order.querySelector('.yohtmlc-product-title a')?.textContent?.trim() || 'N/A',
    //     price: order.querySelector('.a-column.a-span2 .a-size-base')?.textContent?.trim() || 'N/A',
    //     link: order.querySelector('.yohtmlc-product-title a')?.getAttribute('href')
    //       ? `https://www.amazon.in${order.querySelector('.yohtmlc-product-title a')?.getAttribute('href')}`
    //       : 'N/A'
    //   })).slice(0, 10);
    return Array.from(document.querySelectorAll('.order-card__list')).map(order => ({
      name: order.querySelector(' .yohtmlc-product-title .a-link-normal')?.textContent?.trim() || 'N/A',
      link: order.querySelector(' .yohtmlc-product-title .a-link-normal')?.getAttribute('href') 
              ? `https://www.amazon.in${order.querySelector('.a-link-normal')?.getAttribute('href')}` 
              : 'N/A',
      price: order.querySelector(' .a-column.a-span2 .a-size-base.a-color-secondary.aok-break-word')?.textContent?.trim() || 'N/A'
    }));
  });
}

/**
 * Runs the order scraper.
 */
export async function runOrderScraper(page: Page) {
  const url = `https://www.amazon.in/gp/your-account/order-history`;
  await page.goto(url, { timeout: 15000 });

  const results = await scrapeOrderHistory(page);
  await saveToFile('orders.json', results);
}