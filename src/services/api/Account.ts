import { api } from "./index";

export async function getAccount(token: string): Promise<{
  id: number;
  email: string;
  name: string;
  emailVerified: boolean;
  isCustomer: boolean;
  createAt: Date;
  number: string;
  Plan: { type: "paid" | "free" } | null;
}> {
  const { data } = await api.get("/private/account", {
    headers: { Authorization: token },
  });
  return data.account;
}
