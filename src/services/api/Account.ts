import { api } from "./index";

export async function getAccount(): Promise<{
  id: number;
  name: string;
  email: string;
  emailVerified: boolean;
  onboarded: boolean;
  isPremium: boolean;
  hash: string;
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

export async function getAccountsIg(body: { access_token: string }): Promise<
  {
    used_by: {
      id: number;
      name: string;
    }[];
    page_id: string;
    page_name: string;
    ig_id: string;
    ig_username: string;
    ig_picture: string;
  }[]
> {
  const { data } = await api.post("/private/accounts-for-ig", body);
  return data.accounts;
}
