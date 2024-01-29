import puppeteer from "puppeteer-extra";

// add stealth plugin and use defaults (all evasion techniques)
import StealthPlugin from "puppeteer-extra-plugin-stealth";
puppeteer.use(StealthPlugin());

puppeteer
  .launch({ headless: false, userDataDir: "./userdata" })
  .then(async (browser) => {
    const page = await browser.newPage();

    await page.goto("https://www.instagram.com/");
    await new Promise((r) => setTimeout(r, 1000 * 5 * 60));
    await browser.close();
  });
