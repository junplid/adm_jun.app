import { api } from "./index";

export async function getAccount(): Promise<{
  id: number;
  name: string;
  email: string;
  emailVerified: boolean;
  onboarded: boolean;
  isPremium: boolean;
  businessId: number;
  isSub: boolean;
  subStatus?:
    | "active"
    | "canceled"
    | "incomplete"
    | "incomplete_expired"
    | "past_due"
    | "paused"
    | "trialing"
    | "unpaid"
    | null;
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

export async function createSetupIntentsStripe(): Promise<{
  client_secret: string;
}> {
  const { data } = await api.post("/private/setup-intents-stripe");
  return data;
}

export async function createSubscriptionStripe(body: {
  paymentMethodId?: string;
  planId: number;
}): Promise<void> {
  await api.post("/private/subscription-stripe", body);
}

export async function getSubscription(): Promise<{
  planName: string;
  autoRenew: boolean;
  status:
    | "active"
    | "canceled"
    | "incomplete"
    | "incomplete_expired"
    | "past_due"
    | "paused"
    | "trialing"
    | "unpaid";
  currentPeriodEnd: string;
  cardBrand?: string;
  cardLast4?: string;
} | null> {
  const { data } = await api.get("/private/subscription");
  return data.subscription;
}
