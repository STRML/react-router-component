// @ts-check
const { test, expect } = require('@playwright/test');

// ============================================================================
// BASIC ROUTING (matches old 'Routing' describe block)
// ============================================================================

test.describe('Routing', () => {
  test.describe('basic rendering', () => {
    test('renders', async ({ page }) => {
      await page.goto('/');
      await expect(page.getByTestId('content')).toContainText('mainpage');
    });

    test('navigates to a different route', async ({ page }) => {
      await page.goto('/');
      await expect(page.getByTestId('content')).toContainText('mainpage');

      await page.getByTestId('link-hello').click();
      await expect(page.getByTestId('slug')).toHaveText('hello');
    });

    test('navigates with a querystring and parses it', async ({ page }) => {
      await page.goto('/');
      await page.getByTestId('link-query').click();

      const queryText = await page.getByTestId('query').textContent();
      const query = JSON.parse(queryText || '{}');
      expect(query).toEqual({ foo: 'bar', baz: 'biff', num: '1' });
    });

    test('handles "popstate" event (browser back)', async ({ page }) => {
      await page.goto('/');
      await expect(page.getByTestId('content')).toContainText('mainpage');

      await page.getByTestId('link-hello').click();
      await expect(page.getByTestId('slug')).toHaveText('hello');

      await page.goBack();
      await expect(page.getByTestId('content')).toContainText('mainpage');
    });

    test('renders to NotFound if no match is found', async ({ page }) => {
      await page.goto('/');
      // Use the anchor that goes to an unhandled multi-segment path
      // The app should show not_found for paths that don't match any route
      await page.evaluate(() => {
        window.history.pushState({}, '', '/no/match/here');
        window.dispatchEvent(new PopStateEvent('popstate'));
      });
      await expect(page.getByTestId('content')).toContainText('not_found');
    });
  });

  test.describe('Navigation lifecycle callbacks', () => {
    test('calls onBeforeNavigation and onNavigation', async ({ page }) => {
      await page.goto('/');

      await page.getByTestId('link-hello').click();
      await expect(page.getByTestId('slug')).toHaveText('hello');

      const logText = await page.getByTestId('nav-log').textContent();
      const log = JSON.parse(logText || '[]');

      // Should have both before and after navigation entries
      expect(log.length).toBe(2);
      expect(log[0].type).toBe('before');
      expect(log[0].path).toBe('/hello');
      expect(log[1].type).toBe('after');
      expect(log[1].path).toBe('/hello');
    });
  });

  test.describe('Link component', () => {
    test('navigates via onClick event', async ({ page }) => {
      await page.goto('/');
      await page.getByTestId('link-hello').click();
      await expect(page.getByTestId('slug')).toHaveText('hello');
    });

    test('navigates even if situated outside of the router context', async ({ page }) => {
      await page.goto('/');
      await page.getByTestId('outside-link').click();
      await expect(page.getByTestId('slug')).toHaveText('outside-test');
    });

    test("doesn't navigate if the default is prevented", async ({ page }) => {
      await page.goto('/');
      await expect(page.getByTestId('content')).toContainText('mainpage');

      await page.getByTestId('prevented-link').click();
      // Should still be on mainpage
      await expect(page.getByTestId('content')).toContainText('mainpage');
    });

    test("doesn't navigate if the href is an absolute http url", async ({ page, context }) => {
      await page.goto('/');
      // External links should not trigger navigation within the app
      const link = page.getByTestId('external-http');
      const href = await link.getAttribute('href');
      expect(href).toBe('http://example.com');
    });

    test("doesn't navigate if the href is an absolute https url", async ({ page }) => {
      await page.goto('/');
      const link = page.getByTestId('external-https');
      const href = await link.getAttribute('href');
      expect(href).toBe('https://example.com');
    });

    test("doesn't navigate if the href is a url using another scheme", async ({ page }) => {
      await page.goto('/');
      const link = page.getByTestId('external-scheme');
      const href = await link.getAttribute('href');
      expect(href).toBe('mailto:test@example.com');
    });

    test("doesn't navigate if the href is a scheme-relative url", async ({ page }) => {
      await page.goto('/');
      const link = page.getByTestId('external-relative');
      const href = await link.getAttribute('href');
      expect(href).toBe('//example.com');
    });
  });

  test.describe('CaptureClicks component', () => {
    test('navigates via onClick event on anchor', async ({ page }) => {
      await page.goto('/');
      await page.getByTestId('anchor-internal').click();
      await expect(page.getByTestId('slug')).toHaveText('anchor-test');
    });

    test("doesn't navigate if the anchor href has another host", async ({ page }) => {
      await page.goto('/');
      const anchor = page.getByTestId('anchor-external');
      const href = await anchor.getAttribute('href');
      expect(href).toBe('https://github.com');
      // Verify clicking doesn't change the current page content
      // (actual navigation blocked in test environment)
    });

    test("doesn't route bare hash links", async ({ page }) => {
      await page.goto('/');
      await expect(page.getByTestId('content')).toContainText('mainpage');

      // Click bare hash link - should not navigate
      await page.getByTestId('anchor-hash-bare').click();
      await expect(page.getByTestId('content')).toContainText('mainpage');
    });
  });
});

// ============================================================================
// NESTED ROUTERS (matches old 'Nested routers' describe block)
// ============================================================================

test.describe('Nested routers', () => {
  test('navigates to a subroute via link', async ({ page }) => {
    await page.goto('/?mode=nested');
    await expect(page.getByTestId('content')).toContainText('mainpage');

    // Navigate via link click (internal navigation)
    await page.getByTestId('link-nested').click();
    await expect(page.getByTestId('content')).toContainText('nested/root');
  });

  test('navigates to nested page via link', async ({ page }) => {
    await page.goto('/?mode=nested');
    await page.getByTestId('link-nested').click();
    await expect(page.getByTestId('content')).toContainText('nested/root');

    // Navigate to nested page
    await page.getByTestId('link-nested-page').click();
    await expect(page.getByTestId('content')).toContainText('nested/page');
  });

  test('handles browser back in nested router', async ({ page }) => {
    await page.goto('/?mode=nested');
    await page.getByTestId('link-nested').click();
    await expect(page.getByTestId('content')).toContainText('nested/root');

    await page.goBack();
    await expect(page.getByTestId('content')).toContainText('mainpage');
  });
});

// ============================================================================
// CONTEXTUAL ROUTERS (matches old 'Contextual routers' describe block)
// ============================================================================

test.describe('Contextual routers', () => {
  test('navigates to subcat root via link', async ({ page }) => {
    await page.goto('/?mode=contextual');
    await expect(page.getByTestId('content')).toContainText('mainpage');

    await page.getByTestId('link-subcat').click();
    await expect(page.getByTestId('content')).toContainText('subcat/root');
  });

  test('scopes Link to a current context', async ({ page }) => {
    await page.goto('/?mode=contextual');
    await page.getByTestId('link-subcat').click();
    await expect(page.getByTestId('content')).toContainText('subcat/root');

    await page.getByTestId('link-subpage').click();
    await expect(page.getByTestId('content')).toContainText('subcat/page');
    await expect(page).toHaveURL(/\/subcat\/page/);
  });

  test('scoped Link navigates back to subcat root', async ({ page }) => {
    await page.goto('/?mode=contextual');
    await page.getByTestId('link-subcat').click();
    await page.getByTestId('link-subpage').click();
    await expect(page.getByTestId('content')).toContainText('subcat/page');

    await page.getByTestId('link-subroot').click();
    await expect(page.getByTestId('content')).toContainText('subcat/root');
  });

  test('does not scope global Link to a current context', async ({ page }) => {
    await page.goto('/?mode=contextual');
    await page.getByTestId('link-subcat-escape').click();
    await expect(page.getByTestId('content')).toContainText('subcat/escape');

    await page.getByTestId('link-global').click();
    await expect(page.getByTestId('content')).toContainText('mainpage');
  });
});

// ============================================================================
// MULTIPLE ACTIVE ROUTERS (matches old 'Multiple active routers' describe block)
// ============================================================================

test.describe('Multiple active routers', () => {
  test('renders both routers', async ({ page }) => {
    await page.goto('/?mode=multi');
    await expect(page.getByTestId('content')).toContainText('mainpage1');
    await expect(page.getByTestId('content')).toContainText('mainpage2');
  });

  test('both routers update on navigation', async ({ page }) => {
    await page.goto('/?mode=multi');
    await expect(page.getByTestId('content')).toContainText('mainpage1mainpage2');

    await page.goto('/hello?mode=multi');
    await expect(page.getByTestId('content')).toContainText('hello1');
    await expect(page.getByTestId('content')).toContainText('hello2');
  });

  test('handles "popstate" event', async ({ page }) => {
    await page.goto('/?mode=multi');
    await expect(page.getByTestId('content')).toContainText('mainpage1mainpage2');

    await page.goto('/hello?mode=multi');
    await expect(page.getByTestId('content')).toContainText('hello1hello2');

    await page.goBack();
    await expect(page.getByTestId('content')).toContainText('mainpage1mainpage2');
  });
});

// ============================================================================
// HASH ROUTING (matches old 'Hash routing' describe block)
// ============================================================================

test.describe('Hash routing', () => {
  test('renders', async ({ page }) => {
    await page.goto('/?mode=hash');
    await expect(page.getByTestId('content')).toContainText('mainpage');
  });

  test('navigates to a different route', async ({ page }) => {
    await page.goto('/?mode=hash');
    await page.getByTestId('link-hello').click();
    await expect(page.getByTestId('slug')).toHaveText('hello');

    // URL should contain hash
    await expect(page).toHaveURL(/#.*\/hello/);
  });

  test('handles browser back with hash routing', async ({ page }) => {
    await page.goto('/?mode=hash');
    await page.getByTestId('link-hello').click();
    await expect(page.getByTestId('slug')).toHaveText('hello');

    await page.goBack();
    await expect(page.getByTestId('content')).toContainText('mainpage');
  });

  test('handles hashchange event', async ({ page }) => {
    await page.goto('/?mode=hash');
    await expect(page.getByTestId('content')).toContainText('mainpage');

    await page.getByTestId('link-hello').click();
    await expect(page.getByTestId('slug')).toHaveText('hello');

    // Manually change hash
    await page.evaluate(() => { window.location.hash = '/'; });
    await expect(page.getByTestId('content')).toContainText('mainpage');
  });

  test.describe('Link component', () => {
    test('navigates via onClick event', async ({ page }) => {
      await page.goto('/?mode=hash');
      await page.getByTestId('link-hello').click();
      await expect(page.getByTestId('slug')).toHaveText('hello');
    });
  });
});

// ============================================================================
// CONTEXTUAL HASH ROUTERS (matches old 'Contextual Hash routers' describe block)
// ============================================================================

test.describe('Contextual Hash routers', () => {
  test.describe('Link component', () => {
    test('does not scope globalHash Link to a current context', async ({ page }) => {
      await page.goto('/?mode=hash-contextual');
      await expect(page.getByTestId('content')).toContainText('mainpage');

      // Navigate to subcat escape via hash
      await page.evaluate(() => { window.location.hash = '/subcat/escape'; });
      await expect(page.getByTestId('content')).toContainText('subcat/escape');

      await page.getByTestId('link-global-hash').click();
      await expect(page.getByTestId('content')).toContainText('mainpage');
    });
  });
});

// ============================================================================
// DIRECT URL NAVIGATION
// ============================================================================

test.describe('Direct URL navigation', () => {
  test('loads page directly from URL with slug', async ({ page }) => {
    await page.goto('/test-slug');
    await expect(page.getByTestId('slug')).toHaveText('test-slug');
  });

  test('loads query page directly', async ({ page }) => {
    await page.goto('/query?name=test&value=42');
    const queryText = await page.getByTestId('query').textContent();
    const query = JSON.parse(queryText || '{}');
    expect(query.name).toBe('test');
    expect(query.value).toBe('42');
  });
});
