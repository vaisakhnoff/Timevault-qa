import { faker } from '@faker-js/faker';
import { test, expect } from '../../fixtures/base.fixture';
import envConfig from '../../config/env.config';
import { generateUser } from '../../data/generators';

const validationCases = [
  {
    name: 'first name below the minimum length',
    error: 'firstNameError',
    message: 'First Name can only contain alphabets and must be between 3 to 20 characters',
    overrides: { firstName: 'ab' },
  },
  {
    name: 'phone number below ten digits',
    error: 'phoneError',
    message: 'Phone Number is invalid',
    overrides: { phoneNumber: '123456789' },
  },
  {
    name: 'password below the minimum length',
    error: 'passwordError',
    message: 'Password must be at least 8 characters long',
    overrides: { password: 'Test@1', confirmPassword: 'Test@1' },
  },
  {
    name: 'password without an uppercase letter',
    error: 'passwordError',
    message: 'Password must contain at least one uppercase letter',
    overrides: { password: 'test@1234', confirmPassword: 'test@1234' },
  },
  {
    name: 'password without a digit',
    error: 'passwordError',
    message: 'Password must contain at least one number',
    overrides: { password: 'Test@abcd', confirmPassword: 'Test@abcd' },
  },
] as const;

test.describe('Signup and Forgot Password Tests', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('@auth @negative existing email is rejected during signup', async ({ signupPage }) => {
    const user = generateUser();
    user.email = envConfig.userEmail;

    await signupPage.goto();
    await signupPage.fillForm(user);
    await signupPage.submit();

    await signupPage.expectSignupPage();
    await expect(signupPage.alert).toContainText('User with this email already exists');
  });

  test('@auth @negative invalid referral code is rejected during signup', async ({
    signupPage,
  }) => {
    const user = generateUser();
    user.referalCode = `INVALID${faker.string.alphanumeric({ length: 8 })}`;

    await signupPage.goto();
    await signupPage.fillForm(user);
    await signupPage.submit();

    await signupPage.expectSignupPage();
    await expect(signupPage.alert).toContainText('Invalid referral code');
  });

  for (const testCase of validationCases) {
    test(`@auth @negative signup validation: ${testCase.name}`, async ({ signupPage }) => {
      const user = {
        ...generateUser(),
        ...testCase.overrides,
      };

      await signupPage.goto();
      await signupPage.fillForm(user);
      await signupPage.submit();

      await signupPage.expectSignupPage();
      await expect(signupPage[testCase.error]).toContainText(testCase.message);
    });
  }

  test('@auth @negative unknown email is rejected by forgot password', async ({
    forgotPasswordPage,
  }) => {
    const unknownEmail = `${faker.string.uuid()}@example.invalid`;

    await forgotPasswordPage.goto();
    await forgotPasswordPage.submitForEmail(unknownEmail);

    await expect(forgotPasswordPage.alert).toContainText('Email not found');
  });
});
