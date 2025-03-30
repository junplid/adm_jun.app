import { api } from "./index";

export interface Account {
  id: number;
  email: string;
  name: string;
  emailVerified: boolean;
  isCustomer: boolean;
  createAt: Date;
  number: string;
  Plan: { type: "paid" | "free" } | null;
}

export async function getAccount(token: string): Promise<Account> {
  const { data } = await api.get("/private/account-user", {
    headers: { Authorization: token },
  });
  return data.account;
}
