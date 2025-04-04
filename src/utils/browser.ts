import { chromium, Browser } from 'playwright';

/**
 * Retries an async operation with exponential backoff.
 */
async function retryOperation<T>(
    operation: () => Promise<T>,
    retries: number = 3,
    delay: number = 1000
): Promise<T | null> {
    for (let i = 0; i < retries; i++) {
        try {
            return await operation();
        } catch (error) {
            if (error instanceof Error) {
                console.error(`⚠️ Attempt ${i + 1} failed: ${error.message}`);
                if (i < retries - 1) await new Promise(res => setTimeout(res, delay * (i + 1)));
            }
            else { throw Error }
        }
    }
    console.error('❌ All retries failed.');
    return null;
}

/**
 * Launches a new browser instance with retries.
 */
export async function launchBrowser(): Promise<Browser | null> {
    return retryOperation(() => chromium.launch({ headless: false }));
}
