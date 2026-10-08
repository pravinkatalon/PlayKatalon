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

  async getSidebarMenuItems(): Promise<string[]> {
    await this.sidebarItems.first().waitFor({ state: 'visible' });
    return this.sidebarItems.allTextContents();
  }

  async navigateTo(menuItemName: string) {
    await this.page.getByRole('link', { name: menuItemName }).first().click();
  }
}
