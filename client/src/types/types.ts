export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Transaction {
  _id: string;
  title: string;
  description: string;
  amount: number;
  buyer: User;
  seller?: User;
  sellerEmail: string;
  status:
    | "pending"
    | "funded"
    | "delivered"
    | "completed"
    | "disputed"
    | "resolved";
  paystackReference?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
