import { faker } from '@faker-js/faker';
import { Address, CouponData, NewUserData } from '../types';

function isoDate(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

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
    startDate: isoDate(0),
    endDate: isoDate(30),
    offerPrice: 100,
    minPrice: 500,
    maxPrice: 1000,
  };

  return { ...defaults, ...overrides };
}

export function generateUser(): NewUserData {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    phoneNumber: faker.string.numeric(10),
    password: 'Test@12345',
  };
}
