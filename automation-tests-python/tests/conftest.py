import os
import pytest
from datetime import datetime, timedelta
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

@pytest.fixture(scope="session")
def base_url():
    return os.environ.get("BASE_URL", "http://localhost:5173")

@pytest.fixture(scope="function")
def driver(request):
    """Initializes and tears down Chrome WebDriver with headless support and failure screenshots."""
    options = Options()
    is_headless = os.environ.get("HEADLESS", "true").lower() in ("true", "1", "yes")
    
    if is_headless:
        options.add_argument("--headless=new")

    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1280,800")
    options.add_argument("--log-level=3")
    options.add_argument("--silent")

    driver = webdriver.Chrome(options=options)
    driver.implicitly_wait(5)

    yield driver

    # Capture screenshot if test failed
    if hasattr(request.node, "rep_call") and request.node.rep_call.failed:
        screenshots_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "reports", "screenshots")
        os.makedirs(screenshots_dir, exist_ok=True)
        screenshot_file = os.path.join(screenshots_dir, f"FAIL_{request.node.name}.png")
        driver.save_screenshot(screenshot_file)
        print(f"\n[Artifact] Test failed. Screenshot saved to: {screenshot_file}")

    driver.quit()

@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    """Hook to capture test failure status for screenshot triggering."""
    outcome = yield
    rep = outcome.get_result()
    setattr(item, "rep_" + rep.when, rep)

@pytest.fixture
def future_dates():
    """Generates future ISO date strings for testing."""
    today = datetime.now()
    check_in = (today + timedelta(days=2)).strftime("%Y-%m-%d")
    check_out = (today + timedelta(days=5)).strftime("%Y-%m-%d")  # 3 nights
    long_check_out = (today + timedelta(days=7)).strftime("%Y-%m-%d")  # 5 nights
    past_date = (today - timedelta(days=2)).strftime("%Y-%m-%d")
    return {
        "check_in": check_in,
        "check_out": check_out,
        "long_check_out": long_check_out,
        "past_date": past_date
    }

