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

// add stealth plugin and use defaults (all evasion techniques)
import StealthPlugin from "puppeteer-extra-plugin-stealth";
puppeteer.use(StealthPlugin());

import { USERNAME, PASSWORD } from "./credentials";
const cookiesFilePath = "cookies.json";
const __dirname = "./scrape-images";
const LOOKING_FOR_MON = "Apr";
const LOOKING_FOR_YEAR = "2022";

const wait = async (duration) => {
  console.log("waiting", duration);
  return new Promise((resolve) => setTimeout(resolve, duration));
};

const scrollUpUntilFindString = async (page, lookingForText, times) => {
  // attempt scroll up
  await page.evaluate(async () => {
    const scrollies = document.querySelectorAll(".x1rife3k");
    scrollies[1].scroll(0, 0);
    // const scrollies = await document.querySelectorAll(".x1rife3k");
    // console.log("scrollies", scrollies);
    // await new Promise((resolve) => setTimeout(resolve, 15000));
    // const scroll = await scrollies.pop();
    // scroll.scroll(0, 0);
  });

  // await page.evaluate(async () => {
  //   function getElementByXpath(path) {
  //     return document.evaluate(
  //       path,
  //       document,
  //       null,
  //       XPathResult.FIRST_ORDERED_NODE_TYPE,
  //       null
  //     ).singleNodeValue;
  //   }

  //   const scrollContainerPath =
  //     '//*[@id="mount_0_0_HI"]/div/div/div[2]/div/div/div/div[1]/div[1]/div[2]/section/div/div/div/div[1]/div/div[2]/div/div/div/div/div/div[2]/div/div/div[1]/div/div/div/div/div/div';
  //   // "#mount_0_0_HI > div > div > div.x9f619.x1n2onr6.x1ja2u2z > div > div > div > div.x78zum5.xdt5ytf.x1t2pt76.x1n2onr6.x1ja2u2z.x10cihs4 > div.x9f619.xvbhtw8.x78zum5.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.x1uhb9sk.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.x1q0g3np.xqjyukv.x1qjc9v5.x1oa3qoh.x1qughib > div.x1gryazu.xh8yej3.x10o80wk.x14k21rp.x1v4esvl > section > div > div > div > div.xjp7ctv > div > div.x9f619.x1n2onr6.x1ja2u2z.x78zum5.xdt5ytf.x193iq5w.xeuugli.x1r8uery.x1iyjqo2.xs83m0k > div > div > div > div > div > div.x1uvtmcs.x4k7w5x.x1h91t0o.x1beo9mf.xaigb6o.x12ejxvf.x3igimt.xarpa2k.xedcshv.x1lytzrv.x1t2pt76.x7ja8zs.x1n2onr6.x1qrby5j.x1jfb8zj > div > div > div.x78zum5.x1r8uery.xdt5ytf.x1iyjqo2.xmz0i5r.x6ikm8r.x10wlt62.x1n2onr6 > div > div > div > div > div > div";

  //   const scrollContainer = await getElementByXpath(scrollContainerPath);
  //   await scrollContainer.scroll(0, 0); // scroll to top of this container (y = 0 is top currently), triggering more content to load
  // });
  console.log(`Scrolled up ${times} times...`);

  // wait for content to load
  await wait(500);

  // check for lookingForText
  const lookingForElements = await page.$x(
    // `//*[contains(text(), ${lookingForText})]/span[contains(concat(' ',normalize-space(@class),' '),' xk50ysn ')]`,
    `//span[(contains(text(), '4/26/22')) and (contains(concat(' ',normalize-space(@class),' '),' xk50ysn '))]`
  );
  console.log("lookingForElement", lookingForElements);

  if (lookingForElements.length > 0 || times > 15) {
    return;
  } else {
    await scrollUpUntilFindString(page, lookingForText, ++times);
  }
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
    await new Promise((r) => setTimeout(r, 1020));
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

const videoPostUrls = [];

// puppeteer usage as normal
puppeteer
  .launch({
    headless: false,
    userDataDir: "./userdata",
    args: ["--enable-logging", "--v=1"],
  })
  .then(async (browser) => {
    const page = await browser.newPage();

    page.on("console", (message) => {
      console.log(`Browser console: \`${message.text()}\``);
    });

    // await page.goto("https://instagram.com/");
    // await new Promise((r) => setTimeout(r, 1033));

    await loginOrReturn(page);

    await page.goto("https://www.instagram.com/direct/t/3067482383267282/");
    await new Promise((r) => setTimeout(r, 1033));
    console.log("Got to aesthetic pics only B)");

    // on image request
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

    // page.on("response", (response) => {
    //   // if (response.url().endsWith("your/match"))
    //   if (response.url().includes("cdninstagram.com")) {
    //     console.log("response code: ", response.status());
    //   }

    //   // do something here
    // });

    // await page.setRequestInterception(true);
    // page.on("request", (interceptedRequest) => {
    //   if (interceptedRequest.isInterceptResolutionHandled()) return;
    //   if (
    //     interceptedRequest.url().includes("cdninstagram.com")
    //     // interceptedRequest.url().endsWith(".png") ||
    //     // interceptedRequest.url().endsWith(".jpg")
    //   )
    //     // interceptedRequest.abort();
    //     interceptedRequest.interceptResolutionState
    //   else interceptedRequest.continue();
    // });

    // class of each dm entry x1n2onr6
    await wait(5000);
    console.log("Starting scroll up process");
    await scrollUpUntilFindString(page, LOOKING_FOR_MON, 0);
    console.log("Scrolled all the way up finally");
    await page.screenshot({ path: "topresult.png", fullPage: true });

    // get a list of all elements in
    // const messageElements = await getAllMessageElements(page);
    // console.log("messageElements outer", messageElements);
    // await messageElements.forEach(async (messageElement) => {
    //   await messageElement.scrollIntoView();
    //   // await page.evaluate((messageElement) => {
    //   //   messageElement.scrollToView(false);
    //   // }, messageElement);

    //   const clickableMessageElement = await messageElement.$$(
    //     ">>> .x1iyjqo2.xt7dq6l.x193iq5w.xl1xv1r"
    //   );
    //   console.log("clickableMessageElement", clickableMessageElement);
    //   await clickableMessageElement.click();
    //   await wait(100);
    //   const closeButton = (
    //     await page.$$(
    //       "body > div.x1n2onr6.xzkaem6 > div.x9f619.x1n2onr6.x1ja2u2z > div > div.x160vmok.x10l6tqk.x1eu8d0j.x1vjfegm > div > div > svg"
    //     )
    //   )[0];
    //   await closeButton.click();
    //   await wait(100);
    //   // messageElement
    // });
    const checkForVideo = async (page) => {
      const videos = await page.$$("video.x1lliihq.x5yr21d.xh8yej3");
      if (videos.length > 0) {
        // console.log("Video found");
        if (!videoPostUrls.includes(page.url())) {
          videoPostUrls.push(page.url());
          process.stdout.write(` (stashed video)`);
        }
      }
    };

    let place = 1;
    const messageElementsLength = (await getAllMessageElements2(page)).length;
    // console.log("messageElements", messageElements);
    console.log("messageElementsLength", messageElementsLength);
    for (let i = messageElementsLength - 1; i > 0; i--) {
      const messageElementProbablyEmpty = await getNthMessageElement(
        page,
        i + 1
      );
      // const messageElement = messageElements[i];
      let className = await (
        await messageElementProbablyEmpty.getProperty("className")
      ).jsonValue();
      console.log("messageElement className", className);
      console.log("messageElement", messageElementProbablyEmpty);
      await messageElementProbablyEmpty.scrollIntoView();
      await messageElementProbablyEmpty.scrollIntoView();
      await messageElementProbablyEmpty.scrollIntoView();
      await messageElementProbablyEmpty.scrollIntoView();

      await new Promise((r) => setTimeout(r, 2000));
      const messageElement = await getNthMessageElement(page, i + 1);
      await new Promise((r) => setTimeout(r, 2000));
      const innerHTML = await (
        await messageElement.getProperty("innerHTML")
      ).jsonValue();
      console.log("messageElement innerHtml", innerHTML);
      await page.evaluate(async (e) => {
        const clickables = await e.querySelectorAll(
          ".x1iyjqo2.xt7dq6l.x193iq5w.xl1xv1r"
        );
        console.log("clickables", clickables);
        const clickable = clickables[0];
        await clickable.click();
      }, messageElement);
      // const clickable = await messageElement.$(
      //   "* > .x1iyjqo2.xt7dq6l.x193iq5w.xl1xv1r"
      // );
      // let clickableClassName = await (
      //   await clickable.getProperty("className")
      // ).jsonValue();
      // console.log("clickable", clickable);
      // console.log("clickable className", clickableClassName);

      // const clickables = await getAllPicturesToClick(page);
      // // console.log("clickables", clickables);
      // let place = 1;
      // for (const clickable of clickables) {
      console.log(`Post ${place}/${messageElementsLength}`);
      await new Promise((r) => setTimeout(r, 2000));
      // await clickable.scrollIntoView();
      // await clickable.evaluate((e) => e.click());
      let checkingForButton = true;
      let pageNumber = 1;
      process.stdout.write("  ");
      while (checkingForButton) {
        process.stdout.write(`${pageNumber}`);
        // console.log(`  ${pageNumber}`);
        await new Promise((r) => setTimeout(r, 2000)); // give enough time for stuff to load

        await checkForVideo(page);
        process.stdout.write(`...`);
        //
        const nextPageImageButtons = await page.$$(
          ".x9f619.xjbqb8w.x78zum5.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.x10l6tqk.x1ey2m1c.x13vifvy.x17qophe.xds687c.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.xdt5ytf.xqjyukv.x1qjc9v5.x1oa3qoh.x1nhvcw1 > div > button._afxw._al46._al47"
        );
        // const nextPageVideoButtons = await page.$$(
        //   "div.x9f619.xjbqb8w.x78zum5.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.x10l6tqk.x1ey2m1c.x13vifvy.x17qophe.xds687c.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.xdt5ytf.xqjyukv.x1qjc9v5.x1oa3qoh.x1nhvcw1 > div > button._afxw._al46._al47"
        // );
        // console.log("nextPageImageButtons", nextPageImageButtons);
        // console.log("nextPageVideoButtons", nextPageVideoButtons);
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
        // else {
        //   if (nextPageVideoButtons.length > 0) {
        //     const nextPageButton = nextPageVideoButtons[0];
        //     console.log("Continue to next page", nextPageButton);
        //     await nextPageButton.evaluate((e) => e.click());
        //   }
        // }
      }

      await new Promise((r) => setTimeout(r, 2000));

      const closeButton = (
        await page.$$(
          "body > div.x1n2onr6.xzkaem6 > div.x9f619.x1n2onr6.x1ja2u2z > div > div.x160vmok.x10l6tqk.x1eu8d0j.x1vjfegm > div > div"
        )
      )[0];

      // console.log("closeButton", closeButton);
      await closeButton.evaluate((e2) => e2.click());
      place = place + 1;
      process.stdout.write(`\n`);
      await new Promise((r) => setTimeout(r, 334));
    }

    console.log(
      `There were ${videoPostUrls.length} video posts found. Writing to videoUrls.txt...`
    );
    await fs.writeFile(
      "./videoUrls.txt",
      videoPostUrls.join("\n"),
      function (err) {
        console.log(err ? "Error :" + err : "ok");
      }
    );
    console.log("Wrote videoUrls.txt");

    await wait(10000);

    // It's generally recommended to not wait for a number of seconds, but instead use Frame.waitForSelector, Frame.waitForXPath or Frame.waitForFunction to wait for exactly the conditions you want.
    await page.screenshot({ path: "testresult.png", fullPage: true });
    await browser.close();
    console.log(`All done, check the screenshot. ✨`);
  });

const getAllPicturesToClick = async (page) => {
  return await page.$$(".x1iyjqo2.xt7dq6l.x193iq5w.xl1xv1r");
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

const getAllMessageElements = async (page) => {
  const scrollContainer = (await page.$$(".x1rife3k"))[1];
  console.log("scrollContainer", scrollContainer);
  const messageElementsContainer = (
    await scrollContainer.$$(":scope > div > .x1n2onr6")
  )[0];
  console.log("messageElementsContainer", messageElementsContainer);
  const messageElements = await messageElementsContainer.$$(".x1n2onr6");
  console.log("messageElements", messageElements);
  return messageElements;

  // const messageElements = await page.evaluate(async () => {
  //   const scrollContainer = document.querySelectorAll(".x1rife3k")[1];
  //   console.log("scrollContainer", scrollContainer);
  //   const messageElementsContainer = scrollContainer.querySelector(
  //     ":scope > div > .x1n2onr6"
  //   );
  //   console.log("messageElementsContainer", messageElementsContainer);
  //   // await new Promise((r) => setTimeout(r, 5000));
  //   const messageElements =
  //     messageElementsContainer.querySelectorAll(".x1n2onr6");
  //   console.log("messageElements", messageElements);
  //   // await new Promise((r) => setTimeout(r, 5000));
  //   return messageElements;
  // });
  // console.log("messageElements getAll", messageElements);
  // return messageElements;

  // const scrollContainer = scrollContainers[1];

  // document.querySelectorAll(".x1rife3k");
  // const parentElement = x1n2onr6;
};
