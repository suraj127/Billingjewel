from playwright.sync_api import sync_playwright, expect

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            # Navigate to the app's setup screen
            # Using 19006 as it's a common Expo web port.
            page.goto("http://localhost:8081", timeout=120000)

            # Wait for the setup screen to load
            expect(page.get_by_text("Store Setup")).to_be_visible()

            # Fill in the store name and PIN
            page.get_by_test_id("store-name-input").fill("My Awesome Store")
            page.get_by_test_id("pin-input").fill("1234")

            # Click the save button
            page.get_by_role("button", name="Save and Continue").click()

            # Wait for the login screen to appear
            expect(page.get_by_role("heading", name="Login")).to_be_visible()

            # Take a screenshot
            page.screenshot(path="jules-scratch/verification/setup_verification.png")

            print("Verification script completed successfully.")

        except Exception as e:
            print(f"An error occurred during verification: {e}")
            # Take a screenshot even if it fails to see the state
            page.screenshot(path="jules-scratch/verification/setup_verification_error.png")

        finally:
            browser.close()

if __name__ == "__main__":
    run_verification()
