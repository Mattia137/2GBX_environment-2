const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
    // Ensure directories exist
    const videoDir = path.join(__dirname, 'videos');
    const screenshotDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });
    if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

    const browser = await chromium.launch({ headless: true });

    // We must use a context to record video in Playwright
    const context = await browser.newContext({
        recordVideo: {
            dir: videoDir,
            size: { width: 1280, height: 720 }
        }
    });

    const page = await context.newPage();

    // Route to bypass liveblocks
    await page.route('https://api.liveblocks.io/**', route => route.abort());

    // Serve locally (assuming python3 -m http.server 8080 is running from a previous step, or we will start it)
    await page.goto('http://localhost:8080/');

    // Wait for the map and models to load
    await page.waitForTimeout(5000);

    // Take a screenshot of the initial state
    await page.screenshot({ path: path.join(screenshotDir, 'traffic_initial.png') });

    // Wait for traffic to simulate and move
    await page.waitForTimeout(10000);

    // Take a screenshot of the final state to prove movement
    await page.screenshot({ path: path.join(screenshotDir, 'traffic_final.png') });

    // Close context to ensure the video is saved
    await context.close();
    await browser.close();

    console.log("Video and screenshots captured successfully.");
})();
