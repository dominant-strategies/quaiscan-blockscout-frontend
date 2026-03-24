import { test as base, expect } from '@playwright/experimental-ct-react';
import React from 'react';

import { buildExternalAssetFilePath } from 'configs/app/utils';
import { FOOTER_LINKS } from 'mocks/config/footerLinks';
import contextWithEnvs from 'playwright/fixtures/contextWithEnvs';
import TestApp from 'playwright/TestApp';
import * as app from 'playwright/utils/app';
import buildApiUrl from 'playwright/utils/buildApiUrl';
import * as configs from 'playwright/utils/configs';

import Footer from './Footer';

const FOOTER_LINKS_URL = app.url + buildExternalAssetFilePath('NEXT_PUBLIC_FOOTER_LINKS', 'https://localhost:3000/footer-links.json') || '';
const FOOTER_ATTRIBUTION_ENVS = [
  { name: 'NEXT_PUBLIC_GIT_TAG', value: 'v2.7.0' },
];
const BACKEND_VERSION_RESPONSE = {
  backend_version: 'v10.2.1',
};

const BACKEND_VERSION_API_URL = buildApiUrl('config_backend_version');
const INDEXING_ALERT_API_URL = buildApiUrl('homepage_indexing_status');

base.describe('with custom links, max cols', () => {
  const test = base.extend({
    context: contextWithEnvs([
      { name: 'NEXT_PUBLIC_FOOTER_LINKS', value: FOOTER_LINKS_URL },
      ...FOOTER_ATTRIBUTION_ENVS,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ]) as any,
  });

  test.beforeEach(async({ page, mount }) => {
    await page.route(FOOTER_LINKS_URL, (route) => {
      return route.fulfill({
        body: JSON.stringify(FOOTER_LINKS),
      });
    });

    await page.route(BACKEND_VERSION_API_URL, (route) => {
      return route.fulfill({
        body: JSON.stringify(BACKEND_VERSION_RESPONSE),
      });
    });

    await page.evaluate(() => {
      window.ethereum = {
        isMetaMask: true,
        _events: {},
      };
    });

    await page.route(INDEXING_ALERT_API_URL, (route) => route.fulfill({
      status: 200,
      body: JSON.stringify({ finished_indexing: false, indexed_internal_transactions_ratio: 0.1 }),
    }));

    await mount(
      <TestApp>
        <Footer/>
      </TestApp>,
    );
  });

  test('+@mobile +@dark-mode', async({ page }) => {
    await expect(page).toHaveScreenshot();
  });

  test.describe('screen xl', () => {
    test.use({ viewport: configs.viewport.xl });

    test('', async({ page }) => {
      await expect(page).toHaveScreenshot();
    });
  });
});

base.describe('with custom links, min cols', () => {
  const test = base.extend({
    context: contextWithEnvs([
      { name: 'NEXT_PUBLIC_FOOTER_LINKS', value: FOOTER_LINKS_URL },
      ...FOOTER_ATTRIBUTION_ENVS,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ]) as any,
  });

  test('base view +@dark-mode +@mobile', async({ mount, page }) => {
    await page.route(FOOTER_LINKS_URL, (route) => {
      return route.fulfill({
        body: JSON.stringify([ FOOTER_LINKS[0] ]),
      });
    });

    await page.route(BACKEND_VERSION_API_URL, (route) => {
      return route.fulfill({
        body: JSON.stringify(BACKEND_VERSION_RESPONSE),
      });
    });

    await mount(
      <TestApp>
        <Footer/>
      </TestApp>,
    );

    await expect(page).toHaveScreenshot();
  });
});

base.describe('without custom links', () => {
  const test = base.extend({
    context: contextWithEnvs([
      ...FOOTER_ATTRIBUTION_ENVS,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ]) as any,
  });

  test('base view +@dark-mode +@mobile', async({ mount, page }) => {
    await page.evaluate(() => {
      window.ethereum = {
        isMetaMask: true,
        _events: {},
      };
    });
    await page.route(BACKEND_VERSION_API_URL, (route) => {
      return route.fulfill({
        body: JSON.stringify(BACKEND_VERSION_RESPONSE),
      });
    });

    await mount(
      <TestApp>
        <Footer/>
      </TestApp>,
    );

    await expect(page).toHaveScreenshot();
  });

  test('with indexing alert +@dark-mode +@mobile', async({ mount, page }) => {
    await page.evaluate(() => {
      window.ethereum = {
        providers: [ { isMetaMask: true, _events: {} } ],
      };
    });

    await page.route(BACKEND_VERSION_API_URL, (route) => route.fulfill({
      body: JSON.stringify(BACKEND_VERSION_RESPONSE),
    }));

    await page.route(INDEXING_ALERT_API_URL, (route) => route.fulfill({
      status: 200,
      body: JSON.stringify({ finished_indexing: false, indexed_internal_transactions_ratio: 0.1 }),
    }));

    const component = await mount(
      <TestApp>
        <Footer/>
      </TestApp>,
    );

    await expect(component).toHaveScreenshot();
  });
});
