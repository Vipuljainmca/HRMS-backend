import { resolve, join } from 'path';
const __dirname = resolve();

/**
 * @type {import("puppeteer").Configuration}
 */
export const cacheDirectory = join(__dirname, '.cache', 'puppeteer');
