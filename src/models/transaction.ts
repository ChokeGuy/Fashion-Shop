import { Order } from "./order";

type Transaction = {
  transactionId: string;
  order: Order;
  transactionType: string;
  amount: number;
  content: string;
  createdAt: Date;
};
type TransactionRequest = Transaction;

export type { Transaction, TransactionRequest };
