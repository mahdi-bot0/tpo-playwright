import { Page } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

    async login(email: string, password: string, baseUrl: string) {
    await this.page.goto(baseUrl);

    await this.page.getByLabel(/email/i).fill(email);
    await this.page.getByLabel(/password/i).fill(password);

    await this.page.getByRole('button', { name: /login/i }).click();

    await this.page.getByRole('button', { name: /add new loan/i }).waitFor();
    }
}