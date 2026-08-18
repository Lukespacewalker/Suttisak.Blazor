import { defineConfig, devices } from '@playwright/test';

const configuration = process.env.PLAYBOOK_CONFIGURATION ?? 'Debug';
const noBuild = process.env.PLAYBOOK_NO_BUILD === 'true' ? ' --no-build' : '';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://127.0.0.1:5174',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
  ],
  webServer: {
    command: `dotnet run --project ../Suttisak.Blazor.Playbook/Suttisak.Blazor.Playbook.csproj --configuration ${configuration}${noBuild} -- --urls http://127.0.0.1:5174`,
    url: 'http://127.0.0.1:5174',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
});
