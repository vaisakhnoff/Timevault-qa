
export function parsePrice(text :string): number {
      
    const numericText = text.replace(/[^\d.-]/g, '');
      const price = Number(numericText);

      return price

}

export function isSortedAscending(values: number[]): boolean {
  return values.every((value, index) => index === 0 || values[index - 1] <= value);
}

export function isSortedDescending(values: number[]): boolean {
  return values.every((value, index) => index === 0 || values[index - 1] >= value);
}

export function dateFromToday(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split('T')[0];
}