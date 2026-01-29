const { test, expect } = require('@playwright/test');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Global server instance
let server;
const PORT = 3000;

// Start server before all tests
test.beforeAll(async () => {
    return new Promise((resolve) => {
        server = http.createServer((req, res) => {
            console.log(`[Server] ${req.method} ${req.url}`);
            
            if (req.url === '/' || req.url === '/index.html') {
                const filePath = path.join(__dirname, 'transfer-page.html');
                const content = fs.readFileSync(filePath, 'utf8');
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(content);
            } else {
                res.writeHead(404);
                res.end('Not found');
            }
        });

        server.listen(PORT, () => {
            console.log(`\n[Test Setup] Server started on http://localhost:${PORT}\n`);
            resolve();
        });
    });
});

// Stop server after all tests
test.afterAll(async () => {
    if (server) {
        await new Promise((resolve) => {
            server.close(() => {
                console.log('\n[Test Cleanup] Server stopped\n');
                resolve();
            });
        });
    }
});

const BASE_URL = `http://localhost:${PORT}`;

test.describe('Money Transfer API Mocking', () => {
    
    test('Test A: Success - Mock 200 OK response', async ({ page }) => {
        const consoleMessages = [];
        page.on('console', msg => {
            consoleMessages.push({ type: msg.type(), text: msg.text() });
        });

        // Set up the mock
        await page.route('**/api/transfer', async (route) => {
            console.log('[Mock] Intercepted transfer request - returning success');
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    status: 'success',
                    transactionId: '12345'
                })
            });
        });

        await page.goto(BASE_URL);
        await page.waitForLoadState('load');

        await page.fill('#recipient', 'john.doe@example.com');
        await page.fill('#amount', '100.50');
        await page.click('button[type="submit"]');

        await page.waitForSelector('.message.success', { timeout: 10000 });

        const successMessage = await page.textContent('.message.success');
        expect(successMessage).toContain('Success!');
        expect(successMessage).toContain('Transaction ID: 12345');

        await page.waitForTimeout(500);
        const successLog = consoleMessages.find(msg => 
            msg.text.includes('Transfer successful') || msg.text.includes('✅')
        );
        expect(successLog).toBeTruthy();
        
        console.log('✅ Test A Passed: Success scenario validated');
    });

    test('Test B: Failure - Mock 400 Bad Request response', async ({ page }) => {
        const consoleMessages = [];
        page.on('console', msg => {
            consoleMessages.push({ type: msg.type(), text: msg.text() });
        });

        await page.route('**/api/transfer', async (route) => {
            console.log('[Mock] Intercepted transfer request - returning 400 error');
            await route.fulfill({
                status: 400,
                contentType: 'application/json',
                body: JSON.stringify({
                    error: 'Insufficient funds'
                })
            });
        });

        await page.goto(BASE_URL);
        await page.waitForLoadState('load');

        await page.fill('#recipient', 'jane.smith@example.com');
        await page.fill('#amount', '5000.00');
        await page.click('button[type="submit"]');

        await page.waitForSelector('.message.error', { timeout: 10000 });

        const errorMessage = await page.textContent('.message.error');
        expect(errorMessage).toContain('Error: Insufficient funds');

        await page.waitForTimeout(500);
        const errorLog = consoleMessages.find(msg => 
            msg.text.includes('Transfer failed') || msg.text.includes('❌')
        );
        expect(errorLog).toBeTruthy();
        
        console.log('✅ Test B Passed: Failure scenario validated');
    });

    test('Test C: Additional - Verify request payload', async ({ page }) => {
        let capturedRequest = null;

        await page.route('**/api/transfer', async (route) => {
            const postData = route.request().postData();
            console.log('[Mock] Intercepted transfer request - capturing payload');
            
            capturedRequest = {
                method: route.request().method(),
                headers: route.request().headers(),
                postData: postData ? JSON.parse(postData) : null
            };

            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    status: 'success',
                    transactionId: '99999'
                })
            });
        });

        await page.goto(BASE_URL);
        await page.waitForLoadState('load');

        await page.fill('#recipient', 'test@example.com');
        await page.fill('#amount', '250.75');
        await page.click('button[type="submit"]');

        await page.waitForSelector('.message.success', { timeout: 10000 });

        expect(capturedRequest).toBeTruthy();
        expect(capturedRequest.method).toBe('POST');
        expect(capturedRequest.postData.recipient).toBe('test@example.com');
        expect(capturedRequest.postData.amount).toBe(250.75);
        
        console.log('✅ Test C Passed: Request payload validated');
        console.log('   Payload:', capturedRequest.postData);
    });

    test('Test D: Network timeout scenario', async ({ page }) => {
        await page.route('**/api/transfer', async (route) => {
            console.log('[Mock] Intercepted transfer request - aborting to simulate failure');
            await route.abort('failed');
        });

        await page.goto(BASE_URL);
        await page.waitForLoadState('load');

        await page.fill('#recipient', 'timeout@example.com');
        await page.fill('#amount', '100');
        await page.click('button[type="submit"]');

        await page.waitForSelector('.message.error', { timeout: 10000 });

        const errorMessage = await page.textContent('.message.error');
        expect(errorMessage).toContain('Network error');

        console.log('✅ Test D Passed: Network timeout handled');
    });
});
