import sys
import subprocess
import os

def main():
    print("=" * 65)
    print("   THOMAS COOK HOTEL BOOKING - PYTHON SELENIUM E2E SUITE")
    print("   Framework: Python + Selenium WebDriver + PyTest + POM")
    print("=" * 65)

    base_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(base_dir)

    # Allow passing extra args, e.g. python run_tests.py -k test_search
    extra_args = sys.argv[1:]
    
    cmd = [
        sys.executable,
        "-m",
        "pytest",
        "tests",
        "-v",
        "-s",
        "--html=reports/test_execution_report.html",
        "--self-contained-html"
    ] + extra_args

    print(f"Executing: {' '.join(cmd)}\n")
    result = subprocess.run(cmd)

    print("\n" + "=" * 65)
    if result.returncode == 0:
        print("🎉 ALL PYTHON SELENIUM TESTS PASSED SUCCESSFULLY!")
        print(f"📊 Visual HTML Report generated at: {os.path.join(base_dir, 'reports', 'test_execution_report.html')}")
    else:
        print("❌ SOME TESTS FAILED. Inspect the console or HTML report for details.")
    print("=" * 65)

    sys.exit(result.returncode)

if __name__ == "__main__":
    main()

