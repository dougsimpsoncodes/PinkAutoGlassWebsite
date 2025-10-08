# /test - Run Playwright Tests

Runs automated tests using the Test Runner agent.

## Usage

```
/test [options]
```

## Options

- No arguments: Run all tests across all browsers
- `--file <filename>`: Run specific test file
- `--grep "<pattern>"`: Run tests matching pattern
- `--project <name>`: Run tests on specific browser/device
- `--headed`: Run with visible browser
- `--ui`: Run in UI mode
- `--debug`: Run in debug mode

## Examples

```
/test
/test --project="Mobile Safari"
/test --grep "Homepage"
/test --file comprehensive.spec.js
/test --headed
```

## What it does

1. Launches the Test Runner agent
2. Executes the requested tests
3. Monitors test execution
4. Reports results with detailed analysis
5. Suggests fixes for any failures

## Agent Used

`test-runner` - Expert Playwright testing agent
