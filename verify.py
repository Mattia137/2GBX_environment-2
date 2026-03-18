from playwright.sync_api import sync_playwright

def verify_feature():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Listen for console logs
        page.on("console", lambda msg: print(f"Console {msg.type}: {msg.text}"))
        page.on("pageerror", lambda err: print(f"Page Error: {err}"))

        print("Navigating to http://localhost:8080...")
        page.goto("http://localhost:8080")

        # Wait for the boot screen to disappear
        page.wait_for_selector("#boot.out", timeout=10000)
        print("Boot complete. Waiting for UI updates...")

        # Wait a few more seconds for the app to run some cycles
        page.wait_for_timeout(3000)

        # Check if any errors occurred
        print("Taking screenshot...")
        page.screenshot(path="screenshot2.png")

        print("Verification complete.")
        browser.close()

if __name__ == "__main__":
    verify_feature()
