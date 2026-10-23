import { faker } from '@faker-js/faker';
import { Address, CouponData, NewUserData } from '../types/index';

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
  // build the same data the coupon spec builds today,
  // then return { ...defaults, ...overrides }
}

export function generateUser(): NewUserData {
  // firstName, lastName, email, phoneNumber, password
}
