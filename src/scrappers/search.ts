import { Page, chromium } from 'playwright';
import { saveToFile } from '../utils/helpers.js';


/**
 * Scrapes Amazon search results from a single page.
 */
async function scrapeSearchResults(page: Page): Promise<any[]> {
  try {
    console.log('came inside scrapper function');

    return await page.evaluate(() => {
      return Array.from(document.querySelectorAll('div[role="listitem"]')).map(item => {
        const titleContainer = item.querySelector('div[data-cy="title-recipe"]');
        const linkElement = titleContainer?.querySelector('a') || item.querySelector('a.a-link-normal.s-line-clamp-4') || item.querySelector('a.a-link-normal.s-line-clamp-2');

        return {
          name: titleContainer?.querySelector('h2 span')?.textContent?.trim() || item.querySelector('div[data-cy="title-recipe"] h2.a-size-medium.a-spacing-none.a-color-base.a-text-normal span')?.textContent?.trim() || item.querySelector('h2.a-size-base-plus a-spacing-none a-color-base a-text-normal span')?.textContent?.trim() || 'N/A',
          price: item.querySelector('.a-price .a-offscreen')?.textContent?.trim() || 'N/A',
          link: linkElement ? `https://www.amazon.in${linkElement.getAttribute('href')}` : 'N/A'
        };
      }).slice(0, 10);
    });
  } catch (error) {
    console.error('❌ Error extracting search results:', error);
    return [];
  }
}

/**
 * Handles pagination and retrieves search results from multiple pages.
 */
async function handlePagination(page: Page): Promise<any[]> {
  const results: any[] = [];

  try {
    while (results.length < 11) {
      results.push(...await scrapeSearchResults(page));

      const nextPage = await page.$('.s-pagination-next');
      if (!nextPage) break; // No more pages

      await nextPage.click();
      await page.waitForTimeout(2000);
    }
  } catch (error) {
    console.error('❌ Error handling pagination:', error);
  }

  return results;
}

/**
 * Runs the search scraper.
 */
export async function runSearchScraper(page: Page, query: string) {
  const browser = await chromium.launch({ headless: false });

  try {
    const url = `https://www.amazon.in/s?k=${encodeURIComponent(query)}`;
    await page.goto(url, { timeout: 15000 });
    // await page.waitForLoadState('networkidle')

    console.log(`🔎 Searching for: ${encodeURIComponent(query)}`);
    const results = await handlePagination(page);

    const fileName = `amazon_search_${query.replace(/\s+/g, '_')}.json`;
    await saveToFile(fileName, results);
    console.log(`✅ Results saved to ${fileName}`);
  } catch (error) {
    console.error(`❌ Error running search scraper for "${query}":`, error);
  } finally {
    await browser.close();
  }
}

// Run the scraper with the provided search query
