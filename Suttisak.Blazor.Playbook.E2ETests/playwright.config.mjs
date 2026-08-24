import { defineConfig, devices } from '@playwright/test';

const configuration = process.env.PLAYBOOK_CONFIGURATION ?? 'Debug';
const noBuild = process.env.PLAYBOOK_NO_BUILD === 'true' ? ' --no-build' : '';
const port = process.env.PLAYBOOK_PORT ?? '5174';
const serverUrl = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: serverUrl,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
  ],
  webServer: {
    command: `dotnet run --project ../Suttisak.Blazor.Playbook/Suttisak.Blazor.Playbook.csproj --configuration ${configuration}${noBuild} -- --urls ${serverUrl}`,
    url: serverUrl,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
});
