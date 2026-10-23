export function parsePrice(text: string): number {
  const numericText = text.replace(/[^\d.-]/g, '');
  const price = Number(numericText);

  if (Number.isNaN(price)) {
    throw new Error(`Could not parse price from "${text}"`);
  }

  return price;
}

export function isSortedAscending(values: number[]): boolean {
  return values.every((value, index) => index === 0 || values[index - 1] <= value);
}

export function isSortedDescending(values: number[]): boolean {
  return values.every((value, index) => index === 0 || values[index - 1] >= value);
}

export function dateFromToday(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
