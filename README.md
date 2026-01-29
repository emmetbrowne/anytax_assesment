# API Mocking Tests with Playwright

Test suite for frontend financial transaction logic using Playwright's route mocking. No backend required.

## Setup

```bash
npm install
npx playwright install
```

## Run Tests

```bash
npx playwright test transfer-api-final.spec.js --workers=1
```

The `--workers=1` flag is required because the test file starts an HTTP server that must run on a single port.

## Test Scenarios

**Test A: Success Response (200 OK)**
- Mocks successful transfer with transaction ID
- Validates UI success message and console logs

**Test B: Failure Response (400 Bad Request)**  
- Mocks "Insufficient funds" error
- Validates error message display

**Test C: Request Payload Validation**
- Captures outgoing POST request
- Verifies method, headers, and payload structure

**Test D: Network Timeout**
- Simulates connection failure
- Validates error handling

## How It Works

The test file (`transfer-api-final.spec.js`) uses `beforeAll()` to start an HTTP server on port 3000, then intercepts API calls using Playwright's `page.route()`:

```javascript
await page.route('**/api/transfer', async (route) => {
    await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'success', transactionId: '12345' })
    });
});
```

The server shuts down in `afterAll()`, keeping tests isolated.

## Files

- `transfer-api-final.spec.js` - Test suite with embedded server
- `transfer-page.html` - Money transfer UI
- `playwright-final.config.js` - Playwright configuration
- `package.json` - Dependencies

## Notes

- Tests must run with `--workers=1` to avoid port conflicts
- The HTML file must be in the same directory as the test file
- No external server configuration needed - everything is self-contained in the test file