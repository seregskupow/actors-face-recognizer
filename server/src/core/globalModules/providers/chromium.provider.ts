import * as puppeteer from 'puppeteer';
console.log({ AAA: process.platform });
export const chromiumProvider = {
  provide: 'CHROMIUM_BROWSER',
  useFactory: async () => {
    const platform = process.platform;
    let config = {};
    if (platform === 'linux') {
      config = {
        executablePath: '/usr/bin/chromium-browser',
        args: [
          '--no-sandbox',
          '--headless',
          '--disable-gpu',
          '--disable-dev-shm-usage',
        ],
      };
    }
    const browser = await puppeteer.launch({
      headless: true,
      ...config
    });
    return browser;
  },
};
