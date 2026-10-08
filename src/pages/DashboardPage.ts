import { Page, Locator, expect } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly dashboardHeader: Locator;
  readonly userDropdown: Locator;
  readonly logoutMenuItem: Locator;
  readonly sidebarItems: Locator;
  readonly quickLaunchWidgets: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dashboardHeader = page.locator('.oxd-topbar-header-breadcrumb h6');
    this.userDropdown = page.locator('.oxd-userdropdown-tab');
    this.logoutMenuItem = page.getByRole('menuitem', { name: 'Logout' });
    this.sidebarItems = page.locator('.oxd-main-menu-item--name');
    this.quickLaunchWidgets = page.locator('.quick-launch-icon-section .quick-launch-icon');
  }

  async expectDashboardVisible() {
    await expect(this.page).toHaveURL(/dashboard/, { timeout: 15000 });
    await expect(this.dashboardHeader).toContainText('Dashboard');
  }

  async logout() {
    await this.userDropdown.click();
    await this.logoutMenuItem.click();
  }

  async expectSidebarMenuContains(menuNames: string[]) {
    // Check each item exists as a sidebar link in the DOM — not affected by scroll or viewport clipping
    for (const name of menuNames) {
      await expect(
        this.page.locator('.oxd-main-menu-item', { hasText: name })
      ).toHaveCount(1, { timeout: 10000 });
    }
  }

  async navigateTo(menuItemName: string) {
    await this.page.getByRole('link', { name: menuItemName }).first().click();
  }
}
