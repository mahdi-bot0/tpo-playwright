import { Page } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  async login(email: string, password: string) {
    await this.page.goto('https://button-los-dev.titanbanking.ai/login');

    // Click initial sign in
    await this.page.getByRole('button', { name: 'Sign in' }).click();

    // Fill email and continue
    await this.page.getByRole('textbox', { name: 'Email address' }).fill(email);
    await this.page.getByRole('button', { name: 'Continue' }).click();

    // Fill password and continue
    await this.page.getByRole('textbox', { name: 'Password' }).fill(password);
    await this.page.getByRole('button', { name: 'Continue', exact: true }).click();

    // Confirm login by waiting for Add New Loan button
    await this.page.getByRole('button', { name: 'Add New Loan' }).waitFor();
  }
}