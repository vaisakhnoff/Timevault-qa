import { faker } from '@faker-js/faker';
import { test, expect } from '../../fixtures/admin.fixture';

function categoryName(): string {
  return `Quality ${faker.string.alpha({ length: 8 })}`;
}

const description = 'Quality assurance category created for automated regression coverage.';

test.describe('TimeVault Admin Category Tests', () => {
  test.describe.configure({ mode: 'serial' });

  test('@regression admin can add a new category', async ({ categoryPage }) => {
    await categoryPage.goto();
    const before = await categoryPage.getTotalCount();
    const name = categoryName();

    await categoryPage.addCategory(name, description);

    await expect(categoryPage.totalCountLabel).toHaveText(`${before + 1} Categories`);
    await expect(categoryPage.rowByName(name)).toBeVisible();
  });

  test('@regression @negative duplicate category name is rejected', async ({ categoryPage }) => {
    const name = categoryName();
    await categoryPage.goto();
    await categoryPage.addCategory(name, description);

    await categoryPage.nameInput.fill(name);
    await categoryPage.descriptionInput.fill(description);
    await categoryPage.addButton.click();

    await expect(categoryPage.alert.title).toHaveText('Error');
    await expect(categoryPage.alert.message).toHaveText('Category already exists');
    await categoryPage.alert.dismiss();
  });

  test('@regression @negative empty category fields are blocked in the browser', async ({
    categoryPage,
  }) => {
    await categoryPage.goto();
    await categoryPage.addButton.click();

    await expect(categoryPage.nameError).toHaveText('Category name is required');
    await expect(categoryPage.descriptionError).toHaveText('Description is required');
  });

  test('@regression admin can edit a category', async ({ categoryPage }) => {
    const originalName = categoryName();
    const updatedName = categoryName();
    await categoryPage.goto();
    await categoryPage.addCategory(originalName, description);

    await categoryPage.editCategory(
      originalName,
      updatedName,
      'Updated category description for automated regression coverage.',
    );

    await expect(categoryPage.rowByName(updatedName)).toBeVisible();
  });

  test('@regression admin can unlist then relist a category', async ({ categoryPage }) => {
    const name = categoryName();
    await categoryPage.goto();
    await categoryPage.addCategory(name, description);

    try {
      await categoryPage.toggleListing(name);
      await expect(categoryPage.statusByName(name)).toContainText('Unlisted');
    } finally {
      await categoryPage.goto();

      if (await categoryPage.statusByName(name).isVisible()) {
        const status = await categoryPage.statusByName(name).innerText();
        if (status.includes('Unlisted')) {
          await categoryPage.toggleListing(name);
        }
      }
    }

    await expect(categoryPage.statusByName(name)).toContainText('Listed');
  });
});
