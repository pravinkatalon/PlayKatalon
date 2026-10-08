import { Page, Locator, expect } from '@playwright/test';

export class MyInfoPage {
  readonly page: Page;
  readonly pageHeader: Locator;
  readonly addAttachmentButton: Locator;
  readonly fileInput: Locator;
  readonly commentInput: Locator;
  readonly saveAttachmentButton: Locator;
  readonly successToast: Locator;
  readonly attachmentsSection: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageHeader = page.locator('.oxd-topbar-header-breadcrumb h6');
    this.attachmentsSection = page.locator('.orangehrm-attachment');
    this.addAttachmentButton = this.attachmentsSection.getByRole('button', { name: 'Add' });
    this.fileInput = page.locator('input[type="file"]');
    // The comment textarea inside the inline Add Attachment form
    this.commentInput = page.getByPlaceholder('Type comment here');
    // Save inside the attachments section (scoped to avoid matching Personal Details Save)
    this.saveAttachmentButton = this.attachmentsSection.getByRole('button', { name: 'Save' });
    this.successToast = page.locator('.oxd-toast--success');
  }

  async navigate() {
    await this.page.goto('/web/index.php/pim/viewMyDetails');
    await this.pageHeader.waitFor({ state: 'visible' });
  }

  async uploadAttachment(filePath: string, comment: string = 'Test upload') {
    await this.addAttachmentButton.click();
    await this.commentInput.waitFor({ state: 'visible' });
    await this.fileInput.setInputFiles(filePath);
    await this.commentInput.fill(comment);
    await this.saveAttachmentButton.click();
  }

  async expectUploadSuccess() {
    await expect(this.successToast).toBeVisible({ timeout: 15000 });
  }

  async getAttachmentRowCount(fileName: string): Promise<number> {
    // Wait for network to settle so the table is fully populated before we count
    await this.page.waitForLoadState('networkidle');
    return this.attachmentsSection.locator('.oxd-table-row', { hasText: fileName }).count();
  }

  async expectNewAttachmentAdded(fileName: string, comment: string, countBefore: number) {
    // Assert a new row was actually added (not just an old one present)
    await expect(this.attachmentsSection.locator('.oxd-table-row', { hasText: fileName }))
      .toHaveCount(countBefore + 1, { timeout: 10000 });

    // Verify the newest row (last) contains both filename and comment
    const newRow = this.attachmentsSection.locator('.oxd-table-row', { hasText: fileName }).last();
    await expect(newRow).toContainText(fileName);
    await expect(newRow).toContainText(comment);
  }
}
