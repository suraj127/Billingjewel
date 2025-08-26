from playwright.sync_api import sync_playwright, expect

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            # The app should already be on the login screen, but we navigate just in case.
            page.goto("http://localhost:8081", timeout=120000)

            # Wait for the login screen to load
            expect(page.get_by_role("heading", name="Login")).to_be_visible()

            # Fill in the PIN
            page.get_by_test_id("pin-input").fill("1234")

            # Click the login button
            page.get_by_test_id("login-button").click()

            # Wait for the price entry screen to appear
            expect(page.get_by_role("heading", name="Daily Prices")).to_be_visible()

            # Take a screenshot
            page.screenshot(path="jules-scratch/verification/login_verification.png")

            print("Verification script completed successfully.")

        except Exception as e:
            print(f"An error occurred during verification: {e}")
            # Take a screenshot even if it fails to see the state
            page.screenshot(path="jules-scratch/verification/login_verification_error.png")

        finally:
            browser.close()

if __name__ == "__main__":
    run_verification()
