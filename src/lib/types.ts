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

export interface Product {
  id: string;
  name: string;
  unit: string;
  sellingPrice: number;
  purchasePrice: number;
  quantity: number; // stock on hand
}

export interface ProductSale {
  id: string;
  date: string;
  productId: string;
  customer: string;
  quantity: number;
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

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  address?: string;
}

export interface AppData {
  milkTypes: MilkType[];
  milkEntries: MilkEntry[];
  products: Product[];
  productSales: ProductSale[];
  expenses: Expense[];
  customers: Customer[];
}

export const DEFAULT_MILK_TYPES: MilkType[] = [
  { id: "gold", name: "Gold Milk", defaultUnit: "Litre", defaultRate: 60 },
  { id: "sakti", name: "Sakti Milk", defaultUnit: "Litre", defaultRate: 55 },
  {
    id: "buffalo",
    name: "Buffalo Milk",
    defaultUnit: "Litre",
    defaultRate: 70,
  },
];

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "curd",
    name: "Curd",
    unit: "Kg",
    sellingPrice: 80,
    purchasePrice: 60,
    quantity: 0,
  },
  {
    id: "buttermilk",
    name: "Buttermilk",
    unit: "Litre",
    sellingPrice: 30,
    purchasePrice: 20,
    quantity: 0,
  },
  {
    id: "paneer",
    name: "Paneer",
    unit: "Kg",
    sellingPrice: 320,
    purchasePrice: 260,
    quantity: 0,
  },
  {
    id: "ghee",
    name: "Ghee",
    unit: "Kg",
    sellingPrice: 650,
    purchasePrice: 550,
    quantity: 0,
  },
  {
    id: "butter",
    name: "Butter",
    unit: "Kg",
    sellingPrice: 450,
    purchasePrice: 380,
    quantity: 0,
  },
  {
    id: "lassi",
    name: "Lassi",
    unit: "Litre",
    sellingPrice: 40,
    purchasePrice: 25,
    quantity: 0,
  },
];
