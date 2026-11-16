export interface Product {
  productName: string;
  description: string;
  regularPrice: number;
  salePrice: number;
  productOffer: number;

  quantity: number;
  productImage: string[];
  isBlocked: boolean;
  status: string;
}

export interface Credentials {
  email: string;
  password: string;
}

export interface Address {
  name: string;
  addressType: string;
  city: string;
  landMark: string;
  state: string;
  pincode: string;
  phone_no: string;
  altPhone_no: string;
}

export type CouponData = {
  name: string;
  code: string;
  startDate: string;
  endDate: string;
  offerPrice: number;
  minPrice: number;
  maxPrice: number;
};

export interface NewUserData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  referalCode?: string;
}
