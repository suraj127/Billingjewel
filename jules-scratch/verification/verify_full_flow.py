from playwright.sync_api import sync_playwright, expect

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            # Navigate to the app's setup screen
            page.goto("http://localhost:8081", timeout=120000)

            # --- Setup ---
            # Wait for the setup screen to load
            expect(page.get_by_text("Store Setup")).to_be_visible()

            # Fill in the store name and PIN
            page.get_by_test_id("store-name-input").fill("My Awesome Store")
            page.get_by_test_id("pin-input").fill("1234")

            # Click the save button
            page.get_by_role("button", name="Save and Continue").click()

            # --- Login ---
            # Wait for the login screen to appear
            expect(page.get_by_role("heading", name="Login")).to_be_visible()

            # Fill in the PIN
            page.get_by_test_id("pin-input").fill("1234")

            # Click the login button
            page.get_by_test_id("login-button").click()

            # Wait for the price entry screen to appear
            expect(page.get_by_role("heading", name="Daily Prices")).to_be_visible()

            # --- Enter Prices ---
            page.get_by_test_id("gold-rate-input").fill("5000")
            page.get_by_test_id("silver-rate-input").fill("70")

            # Handle the alert
            page.on("dialog", lambda dialog: dialog.accept())

            page.get_by_test_id("save-prices-button").click()

            # --- Navigate to Create Invoice ---
            page.get_by_test_id("create-new-invoice-button").click()
            page.wait_for_timeout(10000) # Long wait for navigation
            expect(page.get_by_text("Create New Invoice").first).to_be_visible()

            # --- Fill Customer Details ---
            page.get_by_test_id("customer-name-input").fill("John Doe")

            # --- Add an Invoice Item ---
            page.get_by_test_id("item-name-input").fill("Gold Ring")
            page.get_by_test_id("gross-weight-input").fill("10")
            page.get_by_test_id("add-item-button").click()

            # --- Verify Item Added ---
            expect(page.get_by_text("Gold Ring (Gold) - 10gm @ 22K")).to_be_visible()

            # --- Generate Invoice ---
            page.get_by_test_id("generate-invoice-button").click()

            # Take a screenshot
            page.screenshot(path="jules-scratch/verification/invoice_verification.png")

            print("Verification script completed successfully.")

        except Exception as e:
            print(f"An error occurred during verification: {e}")
            # Take a screenshot even if it fails to see the state
            page.screenshot(path="jules-scratch/verification/login_verification_error.png")

        finally:
            browser.close()

if __name__ == "__main__":
    run_verification()
