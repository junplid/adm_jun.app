import { api } from "./index";

export async function getAccount(): Promise<{
  id: number;
  name: string;
  email: string;
  emailVerified: boolean;
  onboarded: boolean;
  isPremium: boolean;
  businessId: number;
}> {
  const { data } = await api.get("/private/account");
  return data.account;
}

export async function updateAccount(body?: {
  onboarded?: boolean;
  currentPassword?: string;
  newPassword?: string;
  repeatNewPassword?: string;
  name?: string;
  email?: string;
  number?: string;
}): Promise<void> {
  await api.put("/private/account", body);
}

export async function closeAccount(body: { password: string }): Promise<void> {
  await api.post("/private/close-account", body);
}
