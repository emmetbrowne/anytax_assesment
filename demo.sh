#!/bin/bash

# Demo script to showcase the API mocking tests

echo "=================================================="
echo "   API Automation - Mock Testing Demo"
echo "=================================================="
echo ""

echo "📦 Step 1: Installing dependencies..."
echo "Command: npm install"
echo ""
echo "This will install:"
echo "  - @playwright/test"
echo "  - Playwright browsers"
echo ""

echo "=================================================="
echo ""

echo "🎭 Step 2: What we're testing"
echo ""
echo "HTML Interface (transfer-page.html):"
echo "  └─ Money transfer form"
echo "     ├─ Recipient input"
echo "     ├─ Amount input"
echo "     └─ Submit button"
echo ""
echo "API Endpoint (mocked):"
echo "  └─ POST /api/transfer"
echo "     ├─ Request: { recipient, amount }"
echo "     └─ Response: Success or Failure"
echo ""

echo "=================================================="
echo ""

echo "🧪 Step 3: Test Scenarios"
echo ""
echo "Test A - Success (200 OK):"
echo "  Request:  POST /api/transfer"
echo "  Mock:     { status: 'success', transactionId: '12345' }"
echo "  Expect:   UI shows 'Transaction ID: 12345'"
echo "  Verify:   Console logs '✅ Transfer successful!'"
echo ""

echo "Test B - Failure (400 Bad Request):"
echo "  Request:  POST /api/transfer"
echo "  Mock:     { error: 'Insufficient funds' }"
echo "  Expect:   UI shows 'Error: Insufficient funds'"
echo "  Verify:   Console logs '❌ Transfer failed'"
echo ""

echo "Test C - Request Validation:"
echo "  Captures: Request method, headers, payload"
echo "  Verifies: Correct data sent to API"
echo ""

echo "Test D - Network Timeout:"
echo "  Simulates: Connection failure"
echo "  Verifies:  Error handling works"
echo ""

echo "=================================================="
echo ""

echo "🚀 Step 4: Run the tests"
echo ""
echo "Commands available:"
echo "  npm test              # Run all tests (headless)"
echo "  npm run test:headed   # Run with visible browser"
echo "  npm run test:ui       # Interactive UI mode"
echo ""

echo "=================================================="
echo ""

echo "📋 Key Code Snippet - API Mocking:"
echo ""
cat << 'EOF'
// Mock success response
await page.route('**/api/transfer', async (route) => {
    await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
            status: 'success',
            transactionId: '12345'
        })
    });
});

// Mock failure response
await page.route('**/api/transfer', async (route) => {
    await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
            error: 'Insufficient funds'
        })
    });
});
EOF

echo ""
echo "=================================================="
echo ""

echo "✨ Benefits of this approach:"
echo ""
echo "  ✅ No real backend needed"
echo "  ✅ Tests run during maintenance"
echo "  ✅ Fast and reliable"
echo "  ✅ Complete control over responses"
echo "  ✅ Easy to test edge cases"
echo ""

echo "=================================================="
echo ""
echo "Ready to run! Execute: npm install && npm test"
echo ""
