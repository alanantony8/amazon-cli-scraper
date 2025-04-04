import * as fs from 'fs/promises';

/**
 * Logs errors to a file.
 */
export async function logErrors(errorMessage: string) {
  await fs.appendFile('error.log', `${new Date().toISOString()} - ${errorMessage}\n`);
}

/**
 * Validates if we have meaningful results.
 */
export function validateResults(results: any[]): boolean {
  return results.length > 0 && results.some(item => item.name !== 'N/A');
}

/**
 * Saves data to a JSON file.
 */
export async function saveToFile(filename: string, data: any): Promise<void> {
  if (!validateResults(data)) {
    console.error(`❌ No valid data found, skipping save for ${filename}`);
    await logErrors(`No valid data for ${filename}`);
    return;
  }
  
  await fs.writeFile(filename, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`✅ Data saved to ${filename}`);
}
