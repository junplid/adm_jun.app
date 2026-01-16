import { api } from "./index";

export async function getAccount(token: string): Promise<{
  id: number;
  name: string;
  email: string;
  emailVerified: boolean;
  onboarded: boolean;
  isPremium: boolean;
  businessId: number;
}> {
  const { data } = await api.get("/private/account", {
    headers: { Authorization: token },
  });
  return data.account;
}

export async function updateAccount(body?: {
  onboarded?: boolean;
  currentPassword?: string;
  nextPassword?: string;
  name?: string;
}): Promise<void> {
  await api.put("/private/account", body);
}
