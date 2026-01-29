const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Money Transfer API Mocking', () => {
    
    test('Test A: Success - Mock 200 OK response', async ({ page }) => {
        // Listen for console messages to verify UI logging
        const consoleMessages = [];
        page.on('console', msg => {
            consoleMessages.push({
                type: msg.type(),
                text: msg.text()
            });
        });

        // Mock the POST /api/transfer endpoint with success response
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

        // Navigate to the transfer page using proper Windows path
        const htmlPath = path.join(__dirname, 'transfer-page.html');
        await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`);

        // Fill in the transfer form
        await page.fill('#recipient', 'john.doe@example.com');
        await page.fill('#amount', '100.50');

        // Submit the form
        await page.click('button[type="submit"]');

        // Wait for the success message to appear with longer timeout
        await page.waitForSelector('.message.success', { timeout: 10000 });

        // Assert the success message is displayed
        const successMessage = await page.textContent('.message.success');
        expect(successMessage).toContain('Success!');
        expect(successMessage).toContain('Transaction ID: 12345');

        // Assert console logs reflect success
        await page.waitForTimeout(1000); // Give time for console logs
        const successLog = consoleMessages.find(msg => 
            msg.text.includes('Transfer successful') || msg.text.includes('✅')
        );
        expect(successLog).toBeTruthy();
        console.log('\n✅ Test A Passed: Success scenario validated');
        console.log('   - UI shows success message with transaction ID: 12345');
        console.log('   - Console logs indicate successful transfer');
    });

    test('Test B: Failure - Mock 400 Bad Request response', async ({ page }) => {
        // Listen for console messages to verify error logging
        const consoleMessages = [];
        page.on('console', msg => {
            consoleMessages.push({
                type: msg.type(),
                text: msg.text()
            });
        });

        // Mock the POST /api/transfer endpoint with failure response BEFORE navigation
        await page.route('**/api/transfer', async (route) => {
            console.log('Route intercepted - returning 400 error');
            await route.fulfill({
                status: 400,
                contentType: 'application/json',
                body: JSON.stringify({
                    error: 'Insufficient funds'
                })
            });
        });

        // Navigate to the transfer page using proper Windows path
        const htmlPath = path.join(__dirname, 'transfer-page.html');
        await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`);

        // Wait for page to be fully loaded
        await page.waitForLoadState('networkidle');

        // Fill in the transfer form
        await page.fill('#recipient', 'jane.smith@example.com');
        await page.fill('#amount', '5000.00');

        // Submit the form
        await page.click('button[type="submit"]');

        // Wait for the error message to appear
        await page.waitForSelector('.message.error', { timeout: 10000 });

        // Assert the error message is displayed
        const errorMessage = await page.textContent('.message.error');
        expect(errorMessage).toContain('Error: Insufficient funds');

        // Assert console logs reflect failure
        await page.waitForTimeout(1000); // Give time for console logs
        const errorLog = consoleMessages.find(msg => 
            msg.text.includes('Transfer failed') || msg.text.includes('❌')
        );
        expect(errorLog).toBeTruthy();
        console.log('\n✅ Test B Passed: Failure scenario validated');
        console.log('   - UI shows error message: "Insufficient funds"');
        console.log('   - Console logs indicate failed transfer');
    });

    test('Test C: Additional - Verify request payload', async ({ page }) => {
        let capturedRequest = null;

        // Capture and mock the request
        await page.route('**/api/transfer', async (route) => {
            const postData = route.request().postData();
            console.log('Request intercepted, postData:', postData);
            
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

        // Navigate using proper Windows path
        const htmlPath = path.join(__dirname, 'transfer-page.html');
        await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`);

        // Wait for page to be ready
        await page.waitForLoadState('networkidle');

        // Fill in specific values
        await page.fill('#recipient', 'test@example.com');
        await page.fill('#amount', '250.75');
        await page.click('button[type="submit"]');

        // Wait for success message to ensure request completed
        await page.waitForSelector('.message.success', { timeout: 10000 });

        // Assert request details
        expect(capturedRequest).toBeTruthy();
        expect(capturedRequest.method).toBe('POST');
        expect(capturedRequest.postData.recipient).toBe('test@example.com');
        expect(capturedRequest.postData.amount).toBe(250.75);
        expect(capturedRequest.headers['content-type']).toContain('application/json');

        console.log('\n✅ Test C Passed: Request payload validation');
        console.log('   - Method: POST');
        console.log('   - Payload:', capturedRequest.postData);
    });

    test('Test D: Network timeout scenario', async ({ page }) => {
        const consoleMessages = [];
        page.on('console', msg => {
            consoleMessages.push({
                type: msg.type(),
                text: msg.text()
            });
        });

        // Mock a delayed/timeout scenario
        await page.route('**/api/transfer', async (route) => {
            console.log('Route intercepted - aborting to simulate network failure');
            // Abort the request to simulate network failure
            await route.abort('failed');
        });

        // Navigate using proper Windows path
        const htmlPath = path.join(__dirname, 'transfer-page.html');
        await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`);

        await page.waitForLoadState('networkidle');

        await page.fill('#recipient', 'timeout@example.com');
        await page.fill('#amount', '100');
        await page.click('button[type="submit"]');

        // Wait for error message
        await page.waitForSelector('.message.error', { timeout: 10000 });

        const errorMessage = await page.textContent('.message.error');
        expect(errorMessage).toContain('Network error');

        console.log('\n✅ Test D Passed: Network timeout handled');
        console.log('   - UI shows network error message');
    });
});
