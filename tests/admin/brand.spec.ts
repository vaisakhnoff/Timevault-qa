import { test, expect } from '../../fixtures/admin.fixture';


test.describe('TimeVault Admin Brand Tests', () => {

  test('@regression admin can toggle a brand listing status', async ({ brandPage }) => {
    await brandPage.goto();

    expect(await brandPage.getBrandCount()).toBeGreaterThan(0);

    const originalStatus = await brandPage.getFirstStatusText(); // "Listed" or "Unlisted"
    const expectedAfter = originalStatus === 'Listed' ? 'Unlisted' : 'Listed';

    await brandPage.toggleFirstBrandStatus();
    await expect(brandPage.firstRowStatus).toHaveText(expectedAfter);

    await brandPage.toggleFirstBrandStatus();
    await expect(brandPage.firstRowStatus).toHaveText(originalStatus);
  });
  
});
