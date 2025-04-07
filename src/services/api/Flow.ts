import { api } from "./index";

export type FlowType = "marketing" | "chatbot" | "universal";

export async function createFlow(body: {
  name: string;
  type: FlowType;
  businessIds?: number[];
}): Promise<{
  id: number;
  createAt: Date;
  updateAt: Date;
  businesses: { id: number; name: string }[];
}> {
  const { data } = await api.post("/private/flows", body);
  return data.flow;
}

export async function updateFlow(
  id: number,
  params: { name?: string; type?: FlowType; businessIds?: number[] }
): Promise<{
  updateAt: Date;
  businesses: { id: number; name: string }[];
}> {
  const { data } = await api.put(`/private/flows/${id}`, undefined, {
    params,
  });
  return data.flow;
}

export async function getFlowDetails(id: number): Promise<{
  name: string;
  id: number;
  type: FlowType;
  business: { id: number; name: string }[];
  createAt: Date;
  updateAt: Date;
}> {
  const { data } = await api.get(`/private/flows/${id}/details`);
  return data.flow;
}

export async function getFlow(id: number): Promise<{
  name: string;
  type: FlowType;
  businessIds: number[];
}> {
  const { data } = await api.get(`/private/flows/${id}`);
  return data.flows;
}

export async function getFlows(params?: {
  name?: string;
  page?: number;
}): Promise<
  {
    id: number;
    name: string;
    createAt: Date;
    updateAt: Date;
    type: FlowType;
    businesses: { id: number; name: string }[];
  }[]
> {
  const { data } = await api.get("/private/flows", { params });
  return data.flows;
}

export async function getOptionsFlows(params?: {
  name?: string;
  businessIds?: number[];
  type?: ("marketing" | "chatbot" | "universal")[];
}): Promise<{ id: number; name: string }[]> {
  const { data } = await api.get("/private/flows/options", {
    params: {
      ...params,
      businessIds: params?.businessIds?.join("-"),
      type: params?.type?.join("-"),
    },
  });
  return data.flows;
}

export async function deleteFlow(id: number): Promise<void> {
  await api.delete(`/private/flows/${id}`);
}
