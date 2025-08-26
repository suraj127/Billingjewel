from playwright.sync_api import sync_playwright, expect

def test_keyboard_focus_on_input(page, locator, text_to_type, screenshot_name):
    """Helper function to test keyboard focus on an input field."""
    input_field = page.get_by_test_id(locator)
    input_field.click()
    expect(input_field).to_be_focused()
    page.screenshot(path=f"jules-scratch/verification/{screenshot_name}_focused.png")
    page.keyboard.type(text_to_type)
    expect(input_field).to_have_value(text_to_type)
    page.screenshot(path=f"jules-scratch/verification/{screenshot_name}_typed.png")

def run_verification():
    with sync_playwright() as p:
        pixel_5 = p.devices['Pixel 5']
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(**pixel_5)
        page = context.new_page()

        try:
            page.goto("http://localhost:8081", timeout=120000)

            # --- Test Setup Screen ---
            expect(page.get_by_text("Store Setup")).to_be_visible()
            test_keyboard_focus_on_input(page, "store-name-input", "My Awesome Store", "setup_store_name")
            test_keyboard_focus_on_input(page, "pin-input", "1234", "setup_pin")
            page.get_by_role("button", name="Save and Continue").click()

            # --- Test Login Screen ---
            expect(page.get_by_role("heading", name="Login")).to_be_visible()
            test_keyboard_focus_on_input(page, "pin-input", "1234", "login_pin")
            page.get_by_test_id("login-button").click()

            # --- Test Price Entry Screen ---
            expect(page.get_by_role("heading", name="Daily Prices")).to_be_visible()
            test_keyboard_focus_on_input(page, "gold-rate-input", "5000", "price_entry_gold")
            test_keyboard_focus_on_input(page, "silver-rate-input", "70", "price_entry_silver")

            print("Verification script completed successfully.")

        except Exception as e:
            print(f"An error occurred during verification: {e}")
            page.screenshot(path="jules-scratch/verification/keyboard_focus_error.png")

        finally:
            browser.close()

if __name__ == "__main__":
    run_verification()
