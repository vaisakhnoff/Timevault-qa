export const PRODUCTS = {
  titan: { id: '6aad1146c76606074021e7ec', stock: 18, maxAllowed: 4 },
};
export const INVALID_PRODUCT_ID = '000000000000000000000000';

export const TINY_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
  'base64',
);

export const CATALOG = { brand: 'Casio', category: 'Classic Watches' } as const;
