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
  const { data, status } = await api.get("/private/account");
  if (status === 200) {
    if (data.csrfToken) {
      api.defaults.headers.common["X-XSRF-TOKEN"] = data.csrfToken;
    }
  }
  return data.account;
}

export async function uploadImage(file: File): Promise<{
  filename?: string;
}> {
  const formData = new FormData();
  formData.append("fileImage", file);
  const { data } = await api.post("/private/image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
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
