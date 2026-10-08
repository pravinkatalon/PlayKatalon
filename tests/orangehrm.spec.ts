import { test, expect } from '@playwright/test';
import path from 'path';
import { LoginPage } from '../src/pages/LoginPage';
import { DashboardPage } from '../src/pages/DashboardPage';
import { PimPage } from '../src/pages/PimPage';
import { MyInfoPage } from '../src/pages/MyInfoPage';
import { CREDENTIALS } from '../src/utils/constants';

test.describe('OrangeHRM Tests', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    await loginPage.navigate();
  });

  // Test 1: Successful login with valid credentials
  test('TC01 - Login with valid credentials', async ({ page }) => {
    await loginPage.login(CREDENTIALS.admin.username, CREDENTIALS.admin.password);
    await dashboardPage.expectDashboardVisible();
  });

  // Test 2: Login fails with invalid credentials
  test('TC02 - Login with invalid credentials shows error', async ({ page }) => {
    await loginPage.login('wronguser', 'wrongpassword');
    await loginPage.expectLoginError('Invalid credentials');
  });

  // Test 3: Dashboard loads with expected sidebar menu items
  test('TC03 - Dashboard displays correct navigation menu', async ({ page }) => {
    await loginPage.login(CREDENTIALS.admin.username, CREDENTIALS.admin.password);
    await dashboardPage.expectDashboardVisible();

    await dashboardPage.expectSidebarMenuContains(['Admin', 'PIM', 'Leave', 'Time', 'Recruitment']);
  });

  // Test 4: PIM module - employee list loads and search returns all records
  test('TC04 - PIM module shows employee list and search returns results', async ({ page }) => {
    await loginPage.login(CREDENTIALS.admin.username, CREDENTIALS.admin.password);
    await dashboardPage.expectDashboardVisible();

    const pimPage = new PimPage(page);
    await pimPage.navigate();

    // Verify the employee list table is visible
    await expect(pimPage.employeeTable).toBeVisible();

    // Search with no filter to return all employees
    await pimPage.searchEmployee('');
    await expect(pimPage.employeeRows.first()).toBeVisible({ timeout: 15000 });

    // Verify the Add button is present
    await expect(pimPage.addEmployeeButton).toBeVisible();
  });

  // Test 5: Logout successfully redirects to login page
  test('TC05 - Logout redirects to login page', async ({ page }) => {
    await loginPage.login(CREDENTIALS.admin.username, CREDENTIALS.admin.password);
    await dashboardPage.expectDashboardVisible();

    await dashboardPage.logout();

    // After logout, should be on login page
    await expect(page).toHaveURL(/login/);
    await expect(loginPage.loginButton).toBeVisible();
  });

  // Test 6: Upload a file attachment on My Info > Personal Details page
  test('TC06 - Upload file attachment on My Info page', async ({ page }) => {
    await loginPage.login(CREDENTIALS.admin.username, CREDENTIALS.admin.password);
    await dashboardPage.expectDashboardVisible();

    const myInfoPage = new MyInfoPage(page);
    await myInfoPage.navigate();

    const filePath = path.resolve(__dirname, '../resources/test-photo.png');
    const rowsBefore = await myInfoPage.getAttachmentRowCount('test-photo.png');

    await myInfoPage.uploadAttachment(filePath, 'Automated upload test');
    await myInfoPage.expectUploadSuccess();
    await myInfoPage.expectNewAttachmentAdded('test-photo.png', 'Automated upload test', rowsBefore);
    if (!process.env.CI) {
      await page.waitForTimeout(Number.MAX_SAFE_INTEGER);
    }
  });
});
