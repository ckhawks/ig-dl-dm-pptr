// got to 1491 before 429

// import puppeteer from "puppeteer";

// (async () => {
//   // Launch the browser and open a new blank page
//   // const browser = await puppeteer.launch({ headless: "new" });
//   const browser = await puppeteer.launch({ headless: false });
//   const page = await browser.newPage();

//   // Navigate the page to a URL
//   await page.goto("https://developer.chrome.com/");

//   // Set screen size
//   await page.setViewport({ width: 1080, height: 1024 });

//   // Type into search box
//   await page.type(".search-box__input", "automate beyond recorder");

//   // Wait and click on first result
//   const searchResultSelector = ".search-box__link";
//   await page.waitForSelector(searchResultSelector);
//   await page.click(searchResultSelector);

//   // Locate the full title with a unique string
//   const textSelector = await page.waitForSelector(
//     "text/Customize and automate"
//   );
//   const fullTitle = await textSelector?.evaluate((el) => el.textContent);

//   // Print the full title
//   console.log('The title of this blog post is "%s".', fullTitle);

//   await browser.close();
// })();

// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
import puppeteer from "puppeteer-extra";
import fs from "fs";
import path from "path";

import wait_randomly from "./random_wait.js";

// add stealth plugin and use defaults (all evasion techniques)
import StealthPlugin from "puppeteer-extra-plugin-stealth";
puppeteer.use(StealthPlugin());

import { USERNAME, PASSWORD } from "./credentials";
const cookiesFilePath = "cookies.json";
const __dirname = "./scrape-images";

const TARGET_TEXT = "4/26/22"; // [ "4/26/22" || "Sep 26, 2023" || "Thu 1:03 AM" ] (depends on time since)

const scrollUpTwiceThenToBottom = async (page) => {
  await page.evaluate(async () => {
    const scrollies = document.querySelectorAll(".x1rife3k");
    if (scrollies[1].scrollHeight < 10000) scrollies[1].scroll(0, 0); // scroll to top
    await new Promise((resolve) => setTimeout(resolve, 1023)); // can't use wait_randomly here because it's in the browser
    scrollies[1].scroll(0, scrollies[1].scrollHeight); // scroll to bottom
    // console.log(scrollies[1].scrollHeight);
  });
};

const checkForFinishText = async (element) => {
  // check for lookingForText
  const lookingForElements = await element.$x(
    // `//*[contains(text(), ${lookingForText})]/span[contains(concat(' ',normalize-space(@class),' '),' xk50ysn ')]`,
    `//*[(contains(text(), '${TARGET_TEXT}')) and (contains(concat(' ',normalize-space(@class),' '),' xk50ysn '))]`
  );
  // console.log("lookingForElement", lookingForElements);

  return lookingForElements.length > 0;
};

const loginOrReturn = async (page) => {
  await page.goto("https://www.instagram.com/direct/t/3067482383267282/");
  const dmTitle = await page.waitForSelector(
    '::-p-text("aesthetic pics only")',
    {
      timeout: 3000,
    }
  );
  console.log(dmTitle);

  if (dmTitle) {
    return;
  }

  // check if cookies.json exists
  const previousSession = fs.existsSync(cookiesFilePath);
  if (previousSession) {
    // If file exist load the cookies
    const cookiesString = fs.readFileSync(cookiesFilePath);
    const parsedCookies = JSON.parse(cookiesString);
    if (parsedCookies.length !== 0) {
      for (let cookie of parsedCookies) {
        await page.setCookie(cookie);
      }
      console.log("Session has been loaded in the browser.");
    }
  } else {
    // cookies.json doesn't exist so we gotta log this bitch in
    console.log("Logging into Instagram web...");
    await page.goto("https://instagram.com/");

    await new Promise((r) => setTimeout(r, 5000));
    //
    // div._ab32:nth-child(1) > div:nth-child(1) > label:nth-child(1) > input:nth-child(2)

    console.log("Looking for login fields");
    const usernameField = await page.waitForSelector(
      "::-p-xpath(/html/body/div[2]/div/div/div[2]/div/div/div/div[1]/section/main/article/div[2]/div[1]/div[2]/form/div/div[1]/div/label/input)"
    );

    const passwordField = await page.waitForSelector(
      "::-p-xpath(/html/body/div[2]/div/div/div[2]/div/div/div/div[1]/section/main/article/div[2]/div[1]/div[2]/form/div/div[2]/div/label/input)"
    );

    const loginButton = await page.waitForSelector(
      "::-p-xpath(/html/body/div[2]/div/div/div[2]/div/div/div/div[1]/section/main/article/div[2]/div[1]/div[2]/form/div/div[3]/button)"
    );

    console.log("Found fields, typing login information...");
    await page.type(
      "::-p-xpath(/html/body/div[2]/div/div/div[2]/div/div/div/div[1]/section/main/article/div[2]/div[1]/div[2]/form/div/div[1]/div/label/input)",
      USERNAME,
      { delay: 120 }
    );
    await page.type(
      "::-p-xpath(/html/body/div[2]/div/div/div[2]/div/div/div/div[1]/section/main/article/div[2]/div[1]/div[2]/form/div/div[2]/div/label/input)",
      PASSWORD,
      { delay: 111 }
    );
    await wait_randomly(1000);
    console.log("Logging in...");
    await page.click(
      "::-p-xpath(/html/body/div[2]/div/div/div[2]/div/div/div/div[1]/section/main/article/div[2]/div[1]/div[2]/form/div/div[3]/button)"
    );
    console.log("Waiting for user to do 2FA");
    await new Promise((r) => setTimeout(r, 30030));

    // write da cookies to a file

    // Save Session Cookies
    const cookiesObject = await page.cookies();
    // Write cookies to temp file to be used in other profile pages
    await fs.writeFile(
      cookiesFilePath,
      JSON.stringify(cookiesObject),
      function (err) {
        if (err) {
          console.log("The file could not be written.", err);
        }
        console.log("Session has been successfully saved");
      }
    );
  }
};

const getNthMessageElement = async (page, n) => {
  return await page.$(
    `div > div > div.x9f619.x1n2onr6.x1ja2u2z > div > div > div > div.x78zum5.xdt5ytf.x1t2pt76.x1n2onr6.x1ja2u2z.x10cihs4 > div.x9f619.xvbhtw8.x78zum5.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.x1uhb9sk.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.x1q0g3np.xqjyukv.x1qjc9v5.x1oa3qoh.x1qughib > div.x1gryazu.xh8yej3.x10o80wk.x14k21rp.x1v4esvl > section > div > div > div > div.xjp7ctv > div > div.x9f619.x1n2onr6.x1ja2u2z.x78zum5.xdt5ytf.x193iq5w.xeuugli.x1r8uery.x1iyjqo2.xs83m0k > div > div > div > div > div > div.x1uvtmcs.x4k7w5x.x1h91t0o.x1beo9mf.xaigb6o.x12ejxvf.x3igimt.xarpa2k.xedcshv.x1lytzrv.x1t2pt76.x7ja8zs.x1n2onr6.x1qrby5j.x1jfb8zj > div > div > div.x78zum5.x1r8uery.xdt5ytf.x1iyjqo2.xmz0i5r.x6ikm8r.x10wlt62.x1n2onr6 > div > div > div > div > div > div > div:nth-child(3) > div > div:nth-child(${n})`
  );
};

const getAllMessageElements2 = async (page) => {
  const messageRows = await page.$$(
    "div > div > div.x9f619.x1n2onr6.x1ja2u2z > div > div > div > div.x78zum5.xdt5ytf.x1t2pt76.x1n2onr6.x1ja2u2z.x10cihs4 > div.x9f619.xvbhtw8.x78zum5.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.x1uhb9sk.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.x1q0g3np.xqjyukv.x1qjc9v5.x1oa3qoh.x1qughib > div.x1gryazu.xh8yej3.x10o80wk.x14k21rp.x1v4esvl > section > div > div > div > div.xjp7ctv > div > div.x9f619.x1n2onr6.x1ja2u2z.x78zum5.xdt5ytf.x193iq5w.xeuugli.x1r8uery.x1iyjqo2.xs83m0k > div > div > div > div > div > div.x1uvtmcs.x4k7w5x.x1h91t0o.x1beo9mf.xaigb6o.x12ejxvf.x3igimt.xarpa2k.xedcshv.x1lytzrv.x1t2pt76.x7ja8zs.x1n2onr6.x1qrby5j.x1jfb8zj > div > div > div.x78zum5.x1r8uery.xdt5ytf.x1iyjqo2.xmz0i5r.x6ikm8r.x10wlt62.x1n2onr6 > div > div > div > div > div > div > div:nth-child(3) > div > div"
  );
  return messageRows;
};

const checkForVideo = async (page) => {
  const videos = await page.$$("video.x1lliihq.x5yr21d.xh8yej3");
  if (videos.length > 0) {
    // console.log("Video found");
    // if (!videoPostUrls.includes(page.url())) {
    writeVideoURL(page.url());
    // videoPostUrls.push(page.url());
    process.stdout.write(` (stashed video)`);
    // }
  }
};

const writeVideoURL = async (url) => {
  var streamVideoUrl = fs.createWriteStream("videoUrls.txt", { flags: "a" });
  streamVideoUrl.write(url + "\n");
  streamVideoUrl.end();
};

const getBottomMessageRow = async (page) => {
  const messageElementsRows = await getAllMessageElements2(page);
  return await getNthMessageElement(page, messageElementsRows.length - 1);
};

const checkIsStory = async (element) => {
  const lookingForElements = await element.$x(
    // `//*[contains(text(), ${lookingForText})]/span[contains(concat(' ',normalize-space(@class),' '),' xk50ysn ')]`,
    `//*[(contains(text(), "'s story")) and (contains(concat(' ',normalize-space(@class),' '),' x1fhwpqd '))]`
  );
  // console.log("lookingForElement", lookingForElements);

  return lookingForElements.length > 0;
};

// const videoPostUrls = [];

// puppeteer usage as normal
puppeteer
  .launch({
    headless: false,
    userDataDir: "./userdata",
    args: ["--enable-logging", "--v=1"],
  })
  .then(async (browser) => {
    const page = await browser.newPage();

    // log browser console.logs to our console
    page.on("console", (message) => {
      console.log(`Browser console: \`${message.text()}\``);
    });

    // await loginOrReturn(page);

    // load the direct message thread
    await page.goto("https://www.instagram.com/direct/t/3067482383267282/");
    await wait_randomly(1000);
    console.log("Got to aesthetic pics only B)");

    // on image request, save images to folder
    page.on("response", async (response) => {
      const url = response.url();
      if (response.request().resourceType() === "image") {
        response.buffer().then((file) => {
          const fileName = url.split("/").pop().split("?").reverse().pop();
          const filePath = path.resolve(__dirname, fileName);
          const writeStream = fs.createWriteStream(filePath);
          writeStream.write(file);
        });
      }
    });

    await wait_randomly(2500);

    let times = 0;
    const MAX_DOWNLOADS = 100000;
    let finished = false;
    let skipNumber = 1470;

    // repeat checking element flow until we reach our target
    while (times < MAX_DOWNLOADS && finished === false) {
      // scroll up so we continue the lazy load if needed
      await scrollUpTwiceThenToBottom(page);
      await wait_randomly(skipNumber > 0 ? 100 : 300);

      // get the bottom row element
      const bottomElement = await getBottomMessageRow(page);

      if (times % 50 === 0 && times != 0) {
        console.log("holding for 10m");
        await wait_randomly(600000);
      }

      if (skipNumber === 0) {
        // let innerHTML = await (
        //   await bottomElement.getProperty("innerHTML")
        // ).jsonValue();
        // console.log("bottomElement innerHtml1", innerHTML);
        const isStoryPost = await checkIsStory(bottomElement);

        if (isStoryPost) {
          console.log("Skipping story >:(");
        } else {
          await wait_randomly(1000, 700);

          // find the image we click to open the post
          const imageToClick = await bottomElement.$(
            ".x1iyjqo2.xt7dq6l.x193iq5w.xl1xv1r"
          );
          // console.log("imageToClick", imageToClick);
          if (imageToClick !== null) {
            // if it exists
            await imageToClick.click();

            await wait_randomly(1000);

            let checkingForButton = true;
            let pageNumber = 1;
            process.stdout.write("  Pages: ");

            // click through each of the pages flow
            while (checkingForButton) {
              process.stdout.write(`${pageNumber}`);
              if (pageNumber === 1) {
                await wait_randomly(2000, 1200); // give enough time for stuff to load
              } else {
                await wait_randomly(500);
              }

              await checkForVideo(page); // checking if the page has a video on it, and saves the url if so

              process.stdout.write(`...`);

              // check if there is a next page button
              const nextPageImageButtons = await page.$$(
                ".x9f619.xjbqb8w.x78zum5.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.x10l6tqk.x1ey2m1c.x13vifvy.x17qophe.xds687c.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.xdt5ytf.xqjyukv.x1qjc9v5.x1oa3qoh.x1nhvcw1 > div > button._afxw._al46._al47"
              );

              if (
                nextPageImageButtons.length === 0
                // & (nextPageVideoButtons.length === 0)
              ) {
                checkingForButton = false;
                // console.log("break");
              }
              if (nextPageImageButtons.length === 1) {
                const nextPageButton = nextPageImageButtons[0];
                // console.log("Continue to next page", nextPageButton);
                await nextPageButton.evaluate((e) => e.click());
                pageNumber = pageNumber + 1;
              } else if (nextPageImageButtons.length >= 2) {
                // stupid ass puppet is detecting more and less than it should
                const nextPageButton =
                  nextPageImageButtons[nextPageImageButtons.length - 1];
                // console.log("Continue to next page", nextPageButton);
                await nextPageButton.evaluate((e) => e.click());
                pageNumber = pageNumber + 1;
              }
            }

            // find the X close button in the top right
            const closeButton = (
              await page.$$(
                "body > div.x1n2onr6.xzkaem6 > div.x9f619.x1n2onr6.x1ja2u2z > div > div.x160vmok.x10l6tqk.x1eu8d0j.x1vjfegm > div > div"
              )
            )[0];

            if (!(closeButton === null || closeButton === undefined)) {
              // console.log("closeButton", closeButton);
              await closeButton.evaluate((e2) => e2.click());
            } else {
              console.log("Couldn't find closeButton");
            }

            // place = place + 1;
            process.stdout.write(`\n`);
            await wait_randomly(334);
          } else {
            // console.log("Couldn't find clickMe");
          }
        }
      } else {
        skipNumber--;
      }

      // detect if we have found our target text in the current row
      finished = await checkForFinishText(bottomElement);

      await wait_randomly(skipNumber > 0 ? 100 : 300);

      // remove the bottom row element so we can go next, chomp
      await page.evaluate(async (e) => {
        e.remove();
      }, bottomElement);
      console.log(times + 1, "Removed");

      times++;
    }

    // write the video urls to file
    // console.log(
    //   `There were ${videoPostUrls.length} video posts found. Writing to videoUrls.txt...`
    // );
    // await fs.writeFile(
    //   "./videoUrls.txt",
    //   videoPostUrls.join("\n"),
    //   function (err) {
    //     console.log(err ? "Error :" + err : "ok");
    //   }
    // );
    // console.log("Wrote videoUrls.txt");

    await wait_randomly(10000);

    // It's generally recommended to not wait for a number of seconds, but instead use Frame.waitForSelector, Frame.waitForXPath or Frame.waitForFunction to wait for exactly the conditions you want.
    await page.screenshot({ path: "testresult.png", fullPage: true });
    await browser.close();
    console.log(`All done, check the screenshot. ✨`);
  });
