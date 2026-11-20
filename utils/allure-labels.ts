import path from 'path';
import type { TestInfo } from '@playwright/test';
import * as allure from 'allure-js-commons';

/**
 * Allure severity from the test's tags. First match wins.
 * @smoke: the app is unusable if it fails. @security: access-control holes are serious even when the app works.
 */
function severityFor(tags: string[]): allure.Severity {
  if (tags.includes('@smoke')) return allure.Severity.BLOCKER;
  if (tags.includes('@security')) return allure.Severity.CRITICAL;
  return allure.Severity.NORMAL;
}

/**
 * Labels every test from where it lives and how it is tagged, so no spec needs Allure code:
 * - epic:     top folder under tests/ (user, admin, api, e2e). Files directly in tests/ count as "user".
 * - feature:  spec file name without ".spec.ts" (cart, coupon-api, admin-auth)
 * - severity: from tags, see severityFor
 */
export async function applyAllureLabels(testInfo: TestInfo): Promise<void> {
  const relative = path.relative(testInfo.project.testDir, testInfo.file); // e.g. "user/cart.spec.ts"
  const parts = relative.split(path.sep);
  const epic = parts.length > 1 ? parts[0] : 'user';

  await allure.epic(epic);
  await allure.feature(path.basename(relative, '.spec.ts'));
  await allure.severity(severityFor(testInfo.tags));
}
