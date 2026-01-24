import { api } from "./index";

export type TypeProviderPayment = "mercadopago" | "itau";

export async function getPaymentIntegrations(params: {}): Promise<
  {
    name: string;
    provider: "mercadopago" | "itau";
    status: boolean;
    id: number;
    createAt: Date;
    updateAt: Date;
  }[]
> {
  const { data } = await api.get("/private/integration/payments", { params });
  return data.integrations;
}

export async function getOptionsPaymentIntegrations(params: {}): Promise<
  { name: string; provider: "mercadopago"; status: boolean; id: number }[]
> {
  const { data } = await api.get("/private/integration/payments/options", {
    params,
  });
  return data.integrations;
}

export async function createPaymentIntegration(body: {
  name: string;
  provider: TypeProviderPayment;
  status?: boolean;
  access_token?: string;
}): Promise<{ id: number; createAt: Date }> {
  const { data } = await api.post("/private/integration/payments", body);
  return data.integration;
}

// export async function getConnectionWADetails(id: number): Promise<{
//   id: number;
//   name: string;
//   business: { name: string; id: number }[];
//   value: string | null;
//   type: ConnectionWAType;
// }> {
//   const { data } = await api.get(`/private/connections-wa/${id}/details`);
//   return data.connectionWA;
// }

export async function getPaymentIntegration(id: number): Promise<{
  name: string;
  provider: "mercadopago";
  status: boolean;
}> {
  const { data } = await api.get(`/private/integration/payments/${id}`);
  return data.integration;
}

export async function updatePaymentIntegration(
  id: number,
  body: {
    name?: string;
    provider?: TypeProviderPayment;
    status?: boolean;
    access_token?: string;
  },
): Promise<void> {
  await api.put(`/private/integration/payments/${id}`, body);
}

export async function deletePaymentIntegration(id: number): Promise<void> {
  await api.delete(`/private/integration/payments/${id}`);
}
