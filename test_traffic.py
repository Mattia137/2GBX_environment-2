from playwright.sync_api import sync_playwright
import time

def run_cuj(page):
    page.goto("http://localhost:8080/")

    # Wait for the boot sequence to finish
    page.wait_for_selector("#boot.out", timeout=15000)
    page.wait_for_timeout(1000)

    # We want to zoom in on the traffic so we can see the cars
    # The default view might be too zoomed out. Let's use the UI buttons.
    page.locator('[data-view="top"]').click()
    page.wait_for_timeout(2000)

    # Zoom in multiple times to see the cars clearly
    for _ in range(5):
        page.locator('#nav-btns .nb:has-text("+")').click()
        page.wait_for_timeout(500)

    # Check if there are any errors in the console
    page.on("console", lambda msg: print(f"Console message: {msg.text}"))
    page.on("pageerror", lambda err: print(f"Page error: {err}"))

    # Wait a bit longer to allow MapTiler to load road data before checking cars
    page.wait_for_timeout(20000)

    page.screenshot(path="/tmp/screenshot.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use a large viewport to see plenty of map
        context = browser.new_context(
            record_video_dir="/tmp/videos",
            viewport={"width": 1280, "height": 720}
        )
        page = context.new_page()
        try:
            run_cuj(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="/tmp/screenshot_error.png")
            raise
        finally:
            context.close()
            browser.close()
