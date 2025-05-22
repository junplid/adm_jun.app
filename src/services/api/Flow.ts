import { api } from "./index";

export type FlowType = "marketing" | "chatbot" | "universal";

export async function createFlow(body: {
  name: string;
  type: FlowType;
  businessIds?: number[];
}): Promise<{
  id: string;
  createAt: Date;
  updateAt: Date;
  businesses: { id: number; name: string }[];
}> {
  const { data } = await api.post("/private/flows", body);
  return data.flow;
}

export async function updateFlow(
  id: string,
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

export async function updateFlowData(
  id: string,
  body: {
    nodes?: { type: "upset" | "delete"; node: any }[];
    edges?: { type: "upset" | "delete"; edge: any }[];
  }
): Promise<{
  updateAt: Date;
  businesses: { id: number; name: string }[];
}> {
  const { data } = await api.put(`/private/flows/${id}/data`, body);
  return data.flow;
}

export async function getFlowDetails(id: string): Promise<{
  name: string;
  id: string;
  type: FlowType;
  business: { id: number; name: string }[];
  createAt: Date;
  updateAt: Date;
}> {
  const { data } = await api.get(`/private/flows/${id}/details`);
  return data.flow;
}

export async function getFlow(id: string): Promise<{
  name: string;
  type: FlowType;
  businessIds: number[];
}> {
  const { data } = await api.get(`/private/flows/${id}`);
  return data.flows;
}

export async function getFlowData(id: string): Promise<{
  name: string;
  type: FlowType;
  businessIds: number[];
  nodes: any[];
  edges: any[];
}> {
  const { data } = await api.get(`/private/flows/${id}/data`);
  return data.flow;
}

export async function getFlows(params?: {
  name?: string;
  page?: number;
}): Promise<
  {
    id: string;
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
  type?: FlowType[];
}): Promise<{ id: string; name: string; type: FlowType }[]> {
  const { data } = await api.get("/private/flows/options", {
    params,
  });
  return data.flows;
}

export async function deleteFlow(id: string): Promise<void> {
  await api.delete(`/private/flows/${id}`);
}
