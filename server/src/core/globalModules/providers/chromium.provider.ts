import * as puppeteer from 'puppeteer';

export const chromiumProvider = {
  provide: 'CHROMIUM_BROWSER',
  useFactory: async () => {
    const browser = await puppeteer.launch({ headless: true, executablePath: '/usr/bin/chromium-browser',
      args: [
        '--no-sandbox',
        '--headless',
        '--disable-gpu',
        '--disable-dev-shm-usage'
      ] });
    return browser;
  },
};
