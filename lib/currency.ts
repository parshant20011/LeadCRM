/** Format number as Indian Rupee (INR) */
export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}
