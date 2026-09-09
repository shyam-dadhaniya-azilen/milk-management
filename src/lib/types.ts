export type Session = "Morning" | "Afternoon" | "Night";
export type PaymentStatus = "Paid" | "Pending" | "Partial";
export type PaymentMethod = "Cash" | "UPI" | "Bank Transfer" | "Other";

export interface MilkType {
  id: string;
  name: string;
  defaultUnit: string;
  defaultRate: number;
}

export interface MilkEntry {
  id: string;
  date: string; // YYYY-MM-DD
  session: Session;
  milkTypeId: string;
  itemName?: string;
  customer: string;
  quantity: number;
  unit: string;
  rate: number;
  total: number;
  paymentStatus: PaymentStatus;
  notes?: string;
  createdAt: number;
}

export const EXPENSE_CATEGORIES = [
  "Milk Purchase",
  "Transportation",
  "Electricity",
  "Salary",
  "Packaging",
  "Maintenance",
  "Shop Expenses",
  "Other",
] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: number;
}

export interface AppData {
  milkTypes: MilkType[];
  milkEntries: MilkEntry[];
  expenses: Expense[];
}
