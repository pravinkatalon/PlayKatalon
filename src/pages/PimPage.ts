import { Page, Locator, expect } from '@playwright/test';

export class PimPage {
  readonly page: Page;
  readonly pageHeader: Locator;
  readonly searchNameInput: Locator;
  readonly searchButton: Locator;
  readonly addEmployeeButton: Locator;
  readonly employeeTable: Locator;
  readonly employeeRows: Locator;
  readonly noRecordsFound: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageHeader = page.locator('.oxd-topbar-header-breadcrumb h6');
    this.searchNameInput = page.locator('input[placeholder="Type for hints..."]').first();
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.addEmployeeButton = page.getByRole('button', { name: 'Add' });
    this.employeeTable = page.locator('.oxd-table');
    this.employeeRows = page.locator('.oxd-table-body .oxd-table-row');
    this.noRecordsFound = page.locator('.oxd-text--span').filter({ hasText: 'No Records Found' });
  }

  async navigate() {
    await this.page.goto('/web/index.php/pim/viewEmployeeList');
    await this.pageHeader.waitFor({ state: 'visible' });
  }

  async searchEmployee(name: string) {
    await this.searchNameInput.scrollIntoViewIfNeeded();
    await this.searchNameInput.fill(name);
    await this.searchButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async expectEmployeeInResults(name: string) {
    await expect(this.employeeRows.first()).toBeVisible();
    const tableText = await this.employeeTable.textContent();
    expect(tableText).toContain(name);
  }

  async expectNoRecords() {
    await expect(this.noRecordsFound).toBeVisible();
  }
}
