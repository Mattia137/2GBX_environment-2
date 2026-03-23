from playwright.sync_api import sync_playwright
import time
import os

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # User 1
        context1 = browser.new_context(viewport={'width': 1280, 'height': 720})
        page1 = context1.new_page()
        page1.goto("http://localhost:8080")
        print("User 1 connected")

        # User 2
        context2 = browser.new_context(viewport={'width': 1280, 'height': 720})
        page2 = context2.new_page()
        page2.goto("http://localhost:8080")
        print("User 2 connected")

        # Wait for map load
        time.sleep(10)

        # Move User 2 around a LOT so they are looking right at the center
        print("Moving User 2 to trigger Liveblocks events")

        page2.mouse.move(640, 360)
        page2.mouse.wheel(delta_y=-500, delta_x=0)
        time.sleep(1)

        page2.mouse.down(button="right")
        page2.mouse.move(640, 600)
        page2.mouse.up(button="right")
        time.sleep(2)

        # Move User 1 away so they can see user 2
        print("Moving User 1 to view User 2")
        page1.mouse.move(640, 360)
        page1.mouse.wheel(delta_y=2000, delta_x=0)
        time.sleep(2)

        page1.mouse.down(button="right")
        page1.mouse.move(640, 100)
        page1.mouse.up(button="right")
        time.sleep(2)

        os.makedirs("/home/jules/verification", exist_ok=True)
        screenshot_path = "/home/jules/verification/cameras.png"
        page1.screenshot(path=screenshot_path, timeout=50000)
        print(f"Saved screenshot to {screenshot_path}")

        browser.close()

if __name__ == "__main__":
    main()
