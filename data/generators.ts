import { faker } from '@faker-js/faker';
import { Address, CouponData, NewUserData } from '../types';
import { dateFromToday } from '../utils/helpers';

export function generateAddress(): Address {
  return {
    name: faker.person.fullName(),
    addressType: 'Home',
    city: faker.location.city(),
    landMark: faker.location.street(),
    state: faker.location.state(),
    pincode: faker.string.numeric(6),
    phone_no: faker.string.numeric(10),
    altPhone_no: faker.string.numeric(10),
  };
}

export function generateCoupon(overrides: Partial<CouponData> = {}): CouponData {
  const code = `TEST${faker.string.alpha({ length: 6, casing: 'upper' })}`;

  const defaults: CouponData = {
    name: `TestCoupon${code}`,
    code,
    startDate: dateFromToday(0),
    endDate: dateFromToday(30),
    offerPrice: 100,
    minPrice: 500,
    maxPrice: 1000,
  };

  return { ...defaults, ...overrides };
}

export function generateUser(): NewUserData {
  const password = 'Test@12345';

  return {
    firstName: faker.string.alpha({ length: 8 }),
    lastName: faker.string.alpha({ length: 8 }),
    email: faker.internet.email(),
    phoneNumber: faker.string.numeric(10),
    password,
    confirmPassword: password,
    referalCode: '',
  };
}
