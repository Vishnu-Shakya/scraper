const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

/**
 * Utility function to scrape trending topics from X.com.
 * @param {string} authToken - The authentication token for X.com.
 * @returns {Promise<string[]>} - A promise that resolves to an array of trending topic titles.
 */
async function scrapeTrendingTopics(authToken) {

  const options = new chrome.Options();
  options.addArguments('--headless');
  options.addArguments('--disable-gpu');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--disable-blink-features');
  options.addArguments('--disable-blink-features=AutomationControlled');
  options.addArguments('--disable-infobars');
  options.addArguments('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');


  // Build WebDriver
  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
  try {
    // Navigate to X.com
    await driver.get('https://x.com');

    // Wait for the page to load
    await driver.wait(until.elementLocated(By.css('body')), 15000);

    // Set the auth token in cookies
    await driver.manage().addCookie({
      name: 'auth_token',
      value: authToken,
      domain: '.x.com',
      path: '/',
      secure: true,
      httpOnly: true,
    });

    // Reload the page to authenticate
    await driver.navigate().refresh();

    // Wait for the page to reload and the user to be logged in
    await driver.wait(until.urlContains('/home'), 20000);

    console.log("Login successfully")

    // Navigate to the trending topics page
    await driver.get('https://x.com/explore/tabs/trending');
    await driver.wait(until.urlContains('trending'), 15000);

    // Wait for trending topics to load
    await driver.wait(
      until.elementsLocated(By.css('div[data-testid="trend"]')),
      20000
    );

    console.log("data scrap from twitter..")

    // Get the trending topics
    const trendingTopics = await driver.findElements(By.css('div[data-testid="trend"]'));
    const topFiveTrendingTopics = trendingTopics.slice(0, 5);

    // Extract and return the text content of each topic
    const trendingTopicsArray = [];
    for (const topic of topFiveTrendingTopics) {
      const topicText = (await topic.getText()).split('\n')[3]; // Adjust index if necessary
      trendingTopicsArray.push(topicText);
    }

    return trendingTopicsArray;
  } catch (err) {
    console.error(`Error: ${err.message}`);
    return []; // Return an empty array on error
  } finally {
    await driver.quit();
  }
}

module.exports = { scrapeTrendingTopics };
